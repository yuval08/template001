using IntranetStarter.Application.Features.Notifications.Queries;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Notifications.Commands;

public record DeleteNotificationCommand(Guid NotificationId, Guid UserId) : IRequest<bool>;

public class DeleteNotificationCommandHandler(
    IUnitOfWork unitOfWork,
    INotificationService notificationService,
    IMediator mediator,
    ILogger<DeleteNotificationCommandHandler> logger) : IRequestHandler<DeleteNotificationCommand, bool> {
    
    public async Task<bool> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken) {
        var repository = unitOfWork.Repository<Notification>();
        
        // Verify the notification belongs to the user
        var notification = await repository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null || notification.UserId != request.UserId) {
            logger.LogWarning("Notification {NotificationId} not found or doesn't belong to user {UserId}", 
                request.NotificationId, request.UserId);
            return false;
        }

        var wasUnread = !notification.IsRead;
        
        await repository.DeleteAsync(notification, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        logger.LogInformation("Deleted notification {NotificationId}", request.NotificationId);
        
        // Send real-time updates to the user
        try {
            // If the deleted notification was unread, update the unread count
            if (wasUnread) {
                // Get the updated unread count
                var unreadCountQuery = new GetUnreadNotificationCountQuery(request.UserId);
                var unreadCount = await mediator.Send(unreadCountQuery, cancellationToken);
                
                // Send unread count update
                await notificationService.SendUnreadCountUpdateAsync(request.UserId.ToString(), unreadCount, cancellationToken);
            }
            
            // Send signal to refresh notification list
            await notificationService.SendNotificationUpdateAsync(request.UserId.ToString(), cancellationToken);
        }
        catch (Exception ex) {
            // Log but don't fail the command if real-time update fails
            logger.LogWarning(ex, "Failed to send real-time notification update for user {UserId}", request.UserId);
        }
        
        return true;
    }
}