using IntranetStarter.Application.Features.Notifications.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Notifications.Queries;

public record GetUserNotificationsQuery(
    Guid              UserId,
    int               PageNumber = 1,
    int               PageSize   = 20,
    bool?             IsRead     = null,
    NotificationType? Type       = null
) : IRequest<GetUserNotificationsResponse>;

public class GetUserNotificationsQueryHandler(IUnitOfWork unitOfWork, ILogger<GetUserNotificationsQueryHandler> logger) : IRequestHandler<GetUserNotificationsQuery, GetUserNotificationsResponse> {
    public async Task<GetUserNotificationsResponse> Handle(GetUserNotificationsQuery request, CancellationToken cancellationToken) {
        logger.LogInformation("Fetching notifications for user {UserId} - Page: {Page}, PageSize: {PageSize}",
            request.UserId, request.PageNumber, request.PageSize);

        var repository = unitOfWork.Repository<Notification>();

        // Get all notifications for the user
        var allNotifications = await repository.FindAsync(n => n.UserId == request.UserId, cancellationToken);

        // Apply filters
        if (request.IsRead.HasValue) {
            allNotifications = allNotifications.Where(n => n.IsRead == request.IsRead.Value);
        }

        if (request.Type.HasValue) {
            allNotifications = allNotifications.Where(n => n.Type == request.Type.Value);
        }

        // Get unread count
        var unreadCount = allNotifications.Count(n => !n.IsRead);

        // Apply pagination
        var notifications = allNotifications
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto(
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

        logger.LogInformation("Retrieved {Count} notifications for user {UserId}",
            notifications.Count(), request.UserId);

        return new GetUserNotificationsResponse(
            notifications,
            unreadCount,
            request.PageNumber,
            request.PageSize
        );
    }
}