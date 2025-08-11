using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;

namespace IntranetStarter.Application.Features.Notifications.Queries;

public record GetUnreadNotificationCountQuery(Guid UserId) : IRequest<int>;

public class GetUnreadNotificationCountQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetUnreadNotificationCountQuery, int> {
    public async Task<int> Handle(GetUnreadNotificationCountQuery request, CancellationToken cancellationToken) {
        var repository = unitOfWork.Repository<Notification>();
        return await repository.CountAsync(n => n.UserId == request.UserId && !n.IsRead, cancellationToken);
    }
}