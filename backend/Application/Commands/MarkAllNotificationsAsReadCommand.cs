using IntranetStarter.Application.Interfaces;
using MediatR;

namespace IntranetStarter.Application.Commands;

public record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest<int>;

public class MarkAllNotificationsAsReadCommandHandler(INotificationRepository repository) : IRequestHandler<MarkAllNotificationsAsReadCommand, int> {
    public async Task<int> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken) {
        return await repository.MarkAllAsReadAsync(request.UserId, cancellationToken);
    }
}