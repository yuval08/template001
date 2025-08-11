using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Notifications.DTOs;

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

public record GetUserNotificationsResponse(
    IEnumerable<NotificationDto> Notifications,
    int                          TotalUnread,
    int                          PageNumber,
    int                          PageSize
);

public record CreateNotificationDto(
    Guid             UserId,
    string           Title,
    string           Message,
    NotificationType Type,
    string?          ActionUrl = null,
    string?          Metadata = null
);