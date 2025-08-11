using IntranetStarter.Application.Features.Notifications.Commands;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Infrastructure.Hubs;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.Services;

public class NotificationService(
    IHubContext<RealtimeHub> hubContext, 
    IMediator mediator,
    ILogger<NotificationService> logger
) : INotificationService {
    public async Task SendNotificationAsync(string userId, string message, NotificationType type = NotificationType.Info, CancellationToken cancellationToken = default) {
        try {
            // Parse userId to Guid for database persistence
            Guid? userGuid = null;
            if (Guid.TryParse(userId, out var parsedGuid)) {
                userGuid = parsedGuid;
            }

            // Create notification in database if we have a valid user ID
            Guid? notificationId = null;
            if (userGuid.HasValue) {
                var command = new CreateNotificationCommand(
                    userGuid.Value,
                    GetTitleFromMessage(message, type),
                    message,
                    (Domain.Entities.NotificationType)type
                );
                notificationId = await mediator.Send(command, cancellationToken);
            }

            // Send real-time notification via SignalR
            var notification = new {
                Id        = notificationId ?? Guid.NewGuid(),
                Title     = GetTitleFromMessage(message, type),
                Message   = message,
                Type      = type.ToString().ToLowerInvariant(),
                Timestamp = DateTime.UtcNow,
                IsRead    = false
            };

            await hubContext.Clients.Group($"User:{userId}").SendAsync("ReceiveNotification", notification, cancellationToken);

            logger.LogInformation("Notification sent to user {UserId}: {Message}", userId, message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error sending notification to user {UserId}: {Message}", userId, message);
            throw;
        }
    }
    
    private string GetTitleFromMessage(string message, NotificationType type) {
        // Extract a title from the message (first sentence or first 50 chars)
        var firstSentence = message.Split('.')[0];
        if (firstSentence.Length <= 50) {
            return firstSentence;
        }
        
        // Default titles based on type
        return type switch {
            NotificationType.Success => "Success",
            NotificationType.Warning => "Warning",
            NotificationType.Error => "Error",
            _ => "Notification"
        };
    }

    public async Task SendNotificationToAllAsync(string message, NotificationType type = NotificationType.Info, CancellationToken cancellationToken = default) {
        try {
            var notification = new {
                Message   = message,
                Type      = type.ToString().ToLowerInvariant(),
                Timestamp = DateTime.UtcNow,
                Id        = Guid.NewGuid()
            };

            await hubContext.Clients.All.SendAsync("ReceiveNotification", notification, cancellationToken);

            logger.LogInformation("Notification sent to all users: {Message}", message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error sending notification to all users: {Message}", message);
            throw;
        }
    }

    public async Task SendNotificationUpdateAsync(string userId, CancellationToken cancellationToken = default) {
        try {
            // Send a signal to the user group to refresh their notification list
            await hubContext.Clients.Group($"User:{userId}").SendAsync("RefreshNotifications", cancellationToken);
            
            logger.LogInformation("Notification update signal sent to user {UserId}", userId);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error sending notification update signal to user {UserId}", userId);
            throw;
        }
    }

    public async Task SendUnreadCountUpdateAsync(string userId, int unreadCount, CancellationToken cancellationToken = default) {
        try {
            // Send the updated unread count to the user group
            await hubContext.Clients.Group($"User:{userId}").SendAsync("UpdateUnreadCount", unreadCount, cancellationToken);
            
            logger.LogInformation("Unread count update sent to user {UserId}: {Count}", userId, unreadCount);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error sending unread count update to user {UserId}", userId);
            throw;
        }
    }
}