using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Notifications.Commands;

public record DeleteNotificationCommand(Guid NotificationId, Guid UserId) : IRequest<bool>;

public class DeleteNotificationCommandHandler(
    IUnitOfWork unitOfWork,
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

        await repository.DeleteAsync(notification, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        logger.LogInformation("Deleted notification {NotificationId}", request.NotificationId);
        return true;
    }
}