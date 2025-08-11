using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Notifications.Commands;

public record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest<int>;

public class MarkAllNotificationsAsReadCommandHandler(
    IUnitOfWork unitOfWork,
    INotificationService notificationService,
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
        
        // Send real-time updates to the user
        try {
            // Send unread count update (now 0 since all are marked as read)
            await notificationService.SendUnreadCountUpdateAsync(request.UserId.ToString(), 0, cancellationToken);
            
            // Send signal to refresh notification list
            await notificationService.SendNotificationUpdateAsync(request.UserId.ToString(), cancellationToken);
        }
        catch (Exception ex) {
            // Log but don't fail the command if real-time update fails
            logger.LogWarning(ex, "Failed to send real-time notification update for user {UserId}", request.UserId);
        }
        
        return notificationsList.Count;
    }
}