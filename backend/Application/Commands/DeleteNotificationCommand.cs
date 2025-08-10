using IntranetStarter.Application.Interfaces;
using MediatR;

namespace IntranetStarter.Application.Commands;

public record DeleteNotificationCommand(Guid NotificationId, Guid UserId) : IRequest<bool>;

public class DeleteNotificationCommandHandler(INotificationRepository repository) : IRequestHandler<DeleteNotificationCommand, bool> {
    public async Task<bool> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken) {
        // Verify the notification belongs to the user
        var notification = await repository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null || notification.UserId != request.UserId) {
            return false;
        }

        return await repository.DeleteAsync(request.NotificationId, cancellationToken);
    }
}