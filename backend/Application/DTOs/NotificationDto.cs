using IntranetStarter.Domain.Entities;
using MediatR;

namespace IntranetStarter.Application.DTOs;

public record GetUnreadNotificationCountQuery(Guid UserId) : IRequest<int>;

public record NotificationDto(
    Guid             Id,
    string           Title,
    string           Message,
    NotificationType Type,
    bool             IsRead,
    DateTime?        ReadAt,
    string?          ActionUrl,
    string?          Metadata,
    DateTime         CreatedAt
);

public record GetUserNotificationsQuery(
    Guid              UserId,
    int               PageNumber = 1,
    int               PageSize   = 20,
    bool?             IsRead     = null,
    NotificationType? Type       = null
) : IRequest<GetUserNotificationsResponse>;

public record GetUserNotificationsResponse(
    IEnumerable<NotificationDto> Notifications,
    int                          TotalUnread,
    int                          PageNumber,
    int                          PageSize
);