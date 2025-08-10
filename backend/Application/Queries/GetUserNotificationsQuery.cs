using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;
using MediatR;

namespace IntranetStarter.Application.Queries;

public record GetUserNotificationsQuery(
    Guid UserId,
    int PageNumber = 1,
    int PageSize = 20,
    bool? IsRead = null
) : IRequest<GetUserNotificationsResponse>;

public record GetUserNotificationsResponse(
    IEnumerable<NotificationDto> Notifications,
    int TotalUnread,
    int PageNumber,
    int PageSize
);

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    NotificationType Type,
    bool IsRead,
    DateTime? ReadAt,
    string? ActionUrl,
    string? Metadata,
    DateTime CreatedAt
);

public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, GetUserNotificationsResponse> {
    private readonly INotificationRepository _repository;

    public GetUserNotificationsQueryHandler(INotificationRepository repository) {
        _repository = repository;
    }

    public async Task<GetUserNotificationsResponse> Handle(GetUserNotificationsQuery request, CancellationToken cancellationToken) {
        var notifications = await _repository.GetUserNotificationsAsync(
            request.UserId,
            request.PageNumber,
            request.PageSize,
            request.IsRead,
            cancellationToken
        );

        var unreadCount = await _repository.GetUnreadCountAsync(request.UserId, cancellationToken);

        var notificationDtos = notifications.Select(n => new NotificationDto(
            n.Id,
            n.Title,
            n.Message,
            n.Type,
            n.IsRead,
            n.ReadAt,
            n.ActionUrl,
            n.Metadata,
            n.CreatedAt
        ));

        return new GetUserNotificationsResponse(
            notificationDtos,
            unreadCount,
            request.PageNumber,
            request.PageSize
        );
    }
}