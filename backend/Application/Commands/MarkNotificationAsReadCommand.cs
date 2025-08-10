using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record MarkNotificationAsReadCommand(Guid NotificationId, Guid UserId) : IRequest<bool>;

public class MarkNotificationAsReadCommandHandler(
    IUnitOfWork unitOfWork,
    ILogger<MarkNotificationAsReadCommandHandler> logger) : IRequestHandler<MarkNotificationAsReadCommand, bool> {
    
    public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken) {
        var repository = unitOfWork.Repository<Notification>();
        
        // Verify the notification belongs to the user
        var notification = await repository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null || notification.UserId != request.UserId) {
            logger.LogWarning("Notification {NotificationId} not found or doesn't belong to user {UserId}", 
                request.NotificationId, request.UserId);
            return false;
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        notification.UpdatedAt = DateTime.UtcNow;
        
        await repository.UpdateAsync(notification, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        logger.LogInformation("Marked notification {NotificationId} as read", request.NotificationId);
        return true;
    }
}