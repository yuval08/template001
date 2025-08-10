using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest<int>;

public class MarkAllNotificationsAsReadCommandHandler(
    IUnitOfWork unitOfWork,
    ILogger<MarkAllNotificationsAsReadCommandHandler> logger) : IRequestHandler<MarkAllNotificationsAsReadCommand, int> {
    
    public async Task<int> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken) {
        var repository = unitOfWork.Repository<Notification>();
        
        // Get all unread notifications for the user
        var unreadNotifications = await repository.FindAsync(
            n => n.UserId == request.UserId && !n.IsRead, 
            cancellationToken);
        
        var notificationsList = unreadNotifications.ToList();
        if (!notificationsList.Any()) {
            logger.LogInformation("No unread notifications found for user {UserId}", request.UserId);
            return 0;
        }

        var now = DateTime.UtcNow;
        foreach (var notification in notificationsList) {
            notification.IsRead = true;
            notification.ReadAt = now;
            notification.UpdatedAt = now;
            await repository.UpdateAsync(notification, cancellationToken);
        }
        
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        logger.LogInformation("Marked {Count} notifications as read for user {UserId}", 
            notificationsList.Count, request.UserId);
        
        return notificationsList.Count;
    }
}