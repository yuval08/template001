using IntranetStarter.Application.Interfaces;
using MediatR;

namespace IntranetStarter.Application.Commands;

public record MarkNotificationAsReadCommand(Guid NotificationId, Guid UserId) : IRequest<bool>;

public class MarkNotificationAsReadCommandHandler(INotificationRepository repository) : IRequestHandler<MarkNotificationAsReadCommand, bool> {
    public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken) {
        // Verify the notification belongs to the user
        var notification = await repository.GetByIdAsync(request.NotificationId, cancellationToken);
        if (notification == null || notification.UserId != request.UserId) {
            return false;
        }

        return await repository.MarkAsReadAsync(request.NotificationId, cancellationToken);
    }
}