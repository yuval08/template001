using IntranetStarter.Application.Commands;
using IntranetStarter.Application.Services;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.Services;

public class NotificationService(
    IHubContext<NotificationHub> hubContext, 
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

            await hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification, cancellationToken);

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
}

public class NotificationHub : Hub {
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger) {
        _logger = logger;
    }

    public override async Task OnConnectedAsync() {
        _logger.LogInformation("User connected to notification hub: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception) {
        _logger.LogInformation("User disconnected from notification hub: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(string groupName) {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("User {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName) {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("User {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
    }
}