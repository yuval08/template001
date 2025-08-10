using IntranetStarter.Application.Interfaces;
using MediatR;

namespace IntranetStarter.Application.Queries;

public record GetUnreadNotificationCountQuery(Guid UserId) : IRequest<int>;

public class GetUnreadNotificationCountQueryHandler : IRequestHandler<GetUnreadNotificationCountQuery, int> {
    private readonly INotificationRepository _repository;

    public GetUnreadNotificationCountQueryHandler(INotificationRepository repository) {
        _repository = repository;
    }

    public async Task<int> Handle(GetUnreadNotificationCountQuery request, CancellationToken cancellationToken) {
        return await _repository.GetUnreadCountAsync(request.UserId, cancellationToken);
    }
}