using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;
using MediatR;

namespace IntranetStarter.Application.Commands;

public record CreateNotificationCommand(
    Guid UserId,
    string Title,
    string Message,
    NotificationType Type,
    string? ActionUrl = null,
    string? Metadata = null
) : IRequest<Guid>;

public class CreateNotificationCommandHandler(INotificationRepository repository) : IRequestHandler<CreateNotificationCommand, Guid> {
    public async Task<Guid> Handle(CreateNotificationCommand request, CancellationToken cancellationToken) {
        var notification = new Notification {
            UserId = request.UserId,
            Title = request.Title,
            Message = request.Message,
            Type = request.Type,
            ActionUrl = request.ActionUrl,
            Metadata = request.Metadata,
            IsRead = false
        };

        var created = await repository.CreateAsync(notification, cancellationToken);
        return created.Id;
    }
}