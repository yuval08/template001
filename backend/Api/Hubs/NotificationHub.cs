using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace IntranetStarter.Api.Hubs;

[Authorize]
public class NotificationHub(ILogger<NotificationHub> logger) : Hub {
    public override async Task OnConnectedAsync() {
        string? userId   = Context.UserIdentifier;
        string? userName = Context.User?.Identity?.Name;

        logger.LogInformation("User connected to notification hub: {UserId} ({UserName})", userId, userName);

        // Add user to a group based on their role
        string userRole = Context.User?.FindFirst("role")?.Value ?? "Employee";
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Role:{userRole}");

        // Send welcome notification
        await Clients.Caller.SendAsync("ReceiveNotification", new {
            Message   = "Connected to notification system",
            Type      = "success",
            Timestamp = DateTime.UtcNow,
            Id        = Guid.NewGuid()
        });

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception) {
        string? userId   = Context.UserIdentifier;
        string? userName = Context.User?.Identity?.Name;

        logger.LogInformation("User disconnected from notification hub: {UserId} ({UserName})", userId, userName);

        if (exception != null) {
            logger.LogWarning(exception, "User disconnected with error: {UserId}", userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a specific project group to receive project-related notifications
    /// </summary>
    /// <param name="projectId">Project ID to join</param>
    public async Task JoinProjectGroup(string projectId) {
        if (Guid.TryParse(projectId, out var projectGuid)) {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Project:{projectId}");

            await Clients.Caller.SendAsync("ReceiveNotification", new {
                Message   = $"Joined project notifications for {projectId}",
                Type      = "info",
                Timestamp = DateTime.UtcNow,
                Id        = Guid.NewGuid()
            });

            logger.LogInformation("User {UserId} joined project group: {ProjectId}",
                Context.UserIdentifier, projectId);
        }
        else {
            await Clients.Caller.SendAsync("ReceiveNotification", new {
                Message   = "Invalid project ID",
                Type      = "error",
                Timestamp = DateTime.UtcNow,
                Id        = Guid.NewGuid()
            });
        }
    }

    /// <summary>
    /// Leave a specific project group
    /// </summary>
    /// <param name="projectId">Project ID to leave</param>
    public async Task LeaveProjectGroup(string projectId) {
        if (Guid.TryParse(projectId, out var projectGuid)) {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Project:{projectId}");

            await Clients.Caller.SendAsync("ReceiveNotification", new {
                Message   = $"Left project notifications for {projectId}",
                Type      = "info",
                Timestamp = DateTime.UtcNow,
                Id        = Guid.NewGuid()
            });

            logger.LogInformation("User {UserId} left project group: {ProjectId}",
                Context.UserIdentifier, projectId);
        }
    }

    /// <summary>
    /// Send a message to all users in the same company/organization
    /// </summary>
    /// <param name="message">Message to send</param>
    public async Task SendToAll(string message) {
        // Only allow admins and managers to send to all
        string? userRole = Context.User?.FindFirst("role")?.Value;
        if (userRole != "Admin" && userRole != "Manager") {
            await Clients.Caller.SendAsync("ReceiveNotification", new {
                Message   = "You don't have permission to send messages to all users",
                Type      = "error",
                Timestamp = DateTime.UtcNow,
                Id        = Guid.NewGuid()
            });
            return;
        }

        string userName = Context.User?.Identity?.Name ?? "Unknown";

        await Clients.All.SendAsync("ReceiveNotification", new {
            Message   = $"[{userName}]: {message}",
            Type      = "info",
            Timestamp = DateTime.UtcNow,
            Id        = Guid.NewGuid()
        });

        logger.LogInformation("User {UserId} sent message to all users: {Message}",
            Context.UserIdentifier, message);
    }

    /// <summary>
    /// Send a typing indicator (example of real-time interaction)
    /// </summary>
    /// <param name="projectId">Project ID where typing is happening</param>
    public async Task SendTypingIndicator(string projectId) {
        string userName = Context.User?.Identity?.Name ?? "Unknown";

        await Clients.Group($"Project:{projectId}").SendAsync("UserTyping", new {
            UserId    = Context.UserIdentifier,
            UserName  = userName,
            ProjectId = projectId,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Send a status update (online/offline/busy)
    /// </summary>
    /// <param name="status">User status</param>
    public async Task UpdateStatus(string status) {
        string[] validStatuses = ["online", "offline", "busy", "away"];
        if (!validStatuses.Contains(status.ToLowerInvariant())) {
            await Clients.Caller.SendAsync("ReceiveNotification", new {
                Message   = "Invalid status. Use: online, offline, busy, or away",
                Type      = "error",
                Timestamp = DateTime.UtcNow,
                Id        = Guid.NewGuid()
            });
            return;
        }

        // In a real application, you would save this status to the database
        string userName = Context.User?.Identity?.Name ?? "Unknown";

        await Clients.All.SendAsync("UserStatusChanged", new {
            UserId    = Context.UserIdentifier,
            UserName  = userName,
            Status    = status,
            Timestamp = DateTime.UtcNow
        });

        logger.LogInformation("User {UserId} changed status to: {Status}",
            Context.UserIdentifier, status);
    }
}