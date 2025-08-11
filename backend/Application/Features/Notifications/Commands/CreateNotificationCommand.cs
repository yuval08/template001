using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Notifications.Commands;

public record CreateNotificationCommand(
    Guid UserId,
    string Title,
    string Message,
    NotificationType Type,
    string? ActionUrl = null,
    string? Metadata = null
) : IRequest<Guid>;

public class CreateNotificationCommandHandler(
    IUnitOfWork unitOfWork,
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
        
        return created.Id;
    }
}