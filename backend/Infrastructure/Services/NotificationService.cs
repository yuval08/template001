using IntranetStarter.Application.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendNotificationAsync(string userId, string message, NotificationType type = NotificationType.Info, CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new
            {
                Message = message,
                Type = type.ToString().ToLowerInvariant(),
                Timestamp = DateTime.UtcNow,
                Id = Guid.NewGuid()
            };

            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification, cancellationToken);
            
            _logger.LogInformation("Notification sent to user {UserId}: {Message}", userId, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to user {UserId}: {Message}", userId, message);
            throw;
        }
    }

    public async Task SendNotificationToAllAsync(string message, NotificationType type = NotificationType.Info, CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new
            {
                Message = message,
                Type = type.ToString().ToLowerInvariant(),
                Timestamp = DateTime.UtcNow,
                Id = Guid.NewGuid()
            };

            await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification, cancellationToken);
            
            _logger.LogInformation("Notification sent to all users: {Message}", message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to all users: {Message}", message);
            throw;
        }
    }
}

public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("User connected to notification hub: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("User disconnected from notification hub: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("User {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        _logger.LogInformation("User {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
    }
}