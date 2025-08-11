using IntranetStarter.Application.Features.Notifications.Queries;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Notifications.Commands;

public record CreateNotificationCommand(
    Guid UserId,
    string Title,
    string Message,
    Domain.Entities.NotificationType Type,
    string? ActionUrl = null,
    string? Metadata = null
) : IRequest<Guid>;

public class CreateNotificationCommandHandler(
    IUnitOfWork unitOfWork,
    INotificationService notificationService,
    IMediator mediator,
    ILogger<CreateNotificationCommandHandler> logger) : IRequestHandler<CreateNotificationCommand, Guid> {
    
    public async Task<Guid> Handle(CreateNotificationCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Creating notification for user {UserId}: {Title}", request.UserId, request.Title);
        
        var notification = new Notification {
            UserId = request.UserId,
            Title = request.Title,
            Message = request.Message,
            Type = request.Type,
            ActionUrl = request.ActionUrl,
            Metadata = request.Metadata,
            IsRead = false
        };

        var repository = unitOfWork.Repository<Notification>();
        var created = await repository.AddAsync(notification, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        logger.LogInformation("Notification created with ID: {NotificationId}", created.Id);
        
        // Send real-time updates to the user
        try {
            // Get the updated unread count
            var unreadCountQuery = new GetUnreadNotificationCountQuery(request.UserId);
            var unreadCount = await mediator.Send(unreadCountQuery, cancellationToken);
            
            // Send unread count update
            await notificationService.SendUnreadCountUpdateAsync(request.UserId.ToString(), unreadCount, cancellationToken);
            
            // Send signal to refresh notification list
            await notificationService.SendNotificationUpdateAsync(request.UserId.ToString(), cancellationToken);
        }
        catch (Exception ex) {
            // Log but don't fail the command if real-time update fails
            logger.LogWarning(ex, "Failed to send real-time notification update for user {UserId}", request.UserId);
        }
        
        return created.Id;
    }
}