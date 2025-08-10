#if DEBUG
using IntranetStarter.Application.Commands;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using IntranetStarter.Api.Hubs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IntranetStarter.Api.Controllers;

/// <summary>
/// Test controller for development and testing purposes.
/// Only available in DEBUG builds.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestController(
    IMediator mediator,
    ApplicationDbContext context,
    IHubContext<NotificationHub> hubContext,
    ILogger<TestController> logger) : ControllerBase {

    /// <summary>
    /// Creates a test notification for the current user
    /// </summary>
    [HttpPost("notification")]
    public async Task<IActionResult> CreateTestNotification([FromBody] TestNotificationRequest request) {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new CreateNotificationCommand(
            userId.Value,
            request.Title ?? "Test Notification",
            request.Message ?? $"Test notification created at {DateTime.UtcNow:HH:mm:ss}",
            request.Type ?? NotificationType.Info,
            request.ActionUrl,
            request.Metadata
        );

        var notificationId = await mediator.Send(command);
        
        logger.LogInformation("Test notification created: {NotificationId} for user {UserId}", notificationId, userId);
        
        return Ok(new { notificationId, message = "Test notification created successfully" });
    }

    /// <summary>
    /// Creates multiple test notifications
    /// </summary>
    [HttpPost("notifications/bulk")]
    public async Task<IActionResult> CreateBulkTestNotifications([FromBody] BulkTestNotificationRequest request) {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var notificationIds = new List<Guid>();
        var count = Math.Min(request.Count ?? 5, 20); // Limit to 20 notifications

        for (int i = 0; i < count; i++) {
            var command = new CreateNotificationCommand(
                userId.Value,
                $"Test Notification {i + 1}",
                $"This is test notification {i + 1} of {count}",
                GetRandomNotificationType(),
                i % 2 == 0 ? "/dashboard" : null,
                null
            );

            var notificationId = await mediator.Send(command);
            notificationIds.Add(notificationId);
            
            // Add small delay to spread out creation times
            await Task.Delay(100);
        }
        
        logger.LogInformation("Created {Count} test notifications for user {UserId}", count, userId);
        
        return Ok(new { 
            notificationIds, 
            count,
            message = $"Created {count} test notifications successfully" 
        });
    }

    /// <summary>
    /// Simulates an error notification
    /// </summary>
    [HttpPost("notification/error")]
    public async Task<IActionResult> CreateErrorNotification() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new CreateNotificationCommand(
            userId.Value,
            "System Error",
            "An error occurred while processing your request. Error code: TEST_ERROR_001",
            NotificationType.Error,
            null,
            "{\"errorCode\": \"TEST_ERROR_001\", \"timestamp\": \"" + DateTime.UtcNow.ToString("o") + "\"}"
        );

        var notificationId = await mediator.Send(command);
        
        return Ok(new { notificationId, message = "Error notification created" });
    }

    /// <summary>
    /// Simulates a success notification
    /// </summary>
    [HttpPost("notification/success")]
    public async Task<IActionResult> CreateSuccessNotification() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new CreateNotificationCommand(
            userId.Value,
            "Operation Successful",
            "Your operation completed successfully!",
            NotificationType.Success,
            "/dashboard",
            null
        );

        var notificationId = await mediator.Send(command);
        
        return Ok(new { notificationId, message = "Success notification created" });
    }

    /// <summary>
    /// Simulates a warning notification
    /// </summary>
    [HttpPost("notification/warning")]
    public async Task<IActionResult> CreateWarningNotification() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new CreateNotificationCommand(
            userId.Value,
            "Warning",
            "Your disk space is running low. Please free up some space.",
            NotificationType.Warning,
            null,
            null
        );

        var notificationId = await mediator.Send(command);
        
        return Ok(new { notificationId, message = "Warning notification created" });
    }

    /// <summary>
    /// Tests real-time notification via SignalR
    /// </summary>
    [HttpPost("notification/realtime")]
    public async Task<IActionResult> TestRealtimeNotification() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        // Create notification in database
        var command = new CreateNotificationCommand(
            userId.Value,
            "Real-time Test",
            "This notification was sent in real-time via SignalR",
            NotificationType.Info,
            null,
            null
        );

        var notificationId = await mediator.Send(command);
        
        // Send via SignalR
        await hubContext.Clients.Group($"User:{userId}").SendAsync("ReceiveNotification", new {
            id = notificationId,
            title = "Real-time Test",
            message = "This notification was sent in real-time via SignalR",
            type = "info",
            timestamp = DateTime.UtcNow,
            isRead = false
        });
        
        logger.LogInformation("Real-time notification sent to user {UserId}", userId);
        
        return Ok(new { notificationId, message = "Real-time notification sent" });
    }

    /// <summary>
    /// Tests broadcast notification to all users
    /// </summary>
    [HttpPost("notification/broadcast")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> TestBroadcastNotification([FromBody] BroadcastNotificationRequest request) {
        // Get all users
        var users = await context.Users.ToListAsync();
        var notificationIds = new List<Guid>();

        foreach (var user in users) {
            var command = new CreateNotificationCommand(
                user.Id,
                request.Title ?? "System Announcement",
                request.Message ?? "This is a broadcast message to all users",
                NotificationType.Info,
                null,
                null
            );

            var notificationId = await mediator.Send(command);
            notificationIds.Add(notificationId);
        }

        // Send via SignalR to all
        await hubContext.Clients.All.SendAsync("ReceiveNotification", new {
            title = request.Title ?? "System Announcement",
            message = request.Message ?? "This is a broadcast message to all users",
            type = "info",
            timestamp = DateTime.UtcNow
        });
        
        logger.LogInformation("Broadcast notification sent to {Count} users", users.Count);
        
        return Ok(new { 
            notificationIds, 
            userCount = users.Count,
            message = $"Broadcast notification sent to {users.Count} users" 
        });
    }

    /// <summary>
    /// Simulates a long-running job with progress notifications
    /// </summary>
    [HttpPost("job/simulate")]
    public async Task<IActionResult> SimulateJob() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var jobId = Guid.NewGuid();
        
        // Start notification
        await SendJobNotification(userId.Value, jobId, "Job Started", "Processing your request...", NotificationType.Info);
        
        // Simulate job processing
        _ = Task.Run(async () => {
            try {
                await Task.Delay(2000);
                await SendJobNotification(userId.Value, jobId, "Job Progress", "25% complete...", NotificationType.Info);
                
                await Task.Delay(2000);
                await SendJobNotification(userId.Value, jobId, "Job Progress", "50% complete...", NotificationType.Info);
                
                await Task.Delay(2000);
                await SendJobNotification(userId.Value, jobId, "Job Progress", "75% complete...", NotificationType.Info);
                
                await Task.Delay(2000);
                await SendJobNotification(userId.Value, jobId, "Job Completed", "Your job has completed successfully!", NotificationType.Success);
                
                // Send SignalR job completed event
                await hubContext.Clients.Group($"User:{userId}").SendAsync("JobCompleted", new {
                    jobId,
                    message = "Job completed successfully",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex) {
                await SendJobNotification(userId.Value, jobId, "Job Failed", $"Job failed with error: {ex.Message}", NotificationType.Error);
                
                // Send SignalR job failed event
                await hubContext.Clients.Group($"User:{userId}").SendAsync("JobFailed", new {
                    jobId,
                    error = ex.Message,
                    message = "Job failed",
                    timestamp = DateTime.UtcNow
                });
            }
        });
        
        return Ok(new { jobId, message = "Job started, you will receive notifications about its progress" });
    }

    /// <summary>
    /// Clears all notifications for the current user (useful for testing)
    /// </summary>
    [HttpDelete("notifications/clear")]
    public async Task<IActionResult> ClearAllNotifications() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var notifications = await context.Notifications
            .Where(n => n.UserId == userId.Value)
            .ToListAsync();

        context.Notifications.RemoveRange(notifications);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Cleared {Count} notifications for user {UserId}", notifications.Count, userId);
        
        return Ok(new { 
            deletedCount = notifications.Count,
            message = $"Cleared {notifications.Count} notifications" 
        });
    }

    /// <summary>
    /// Gets test statistics for the current user
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetTestStats() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var stats = await context.Notifications
            .Where(n => n.UserId == userId.Value)
            .GroupBy(n => n.Type)
            .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var total = await context.Notifications
            .Where(n => n.UserId == userId.Value)
            .CountAsync();

        var unread = await context.Notifications
            .Where(n => n.UserId == userId.Value && !n.IsRead)
            .CountAsync();

        return Ok(new {
            total,
            unread,
            byType = stats,
            message = "Test statistics retrieved"
        });
    }

    private async Task<Guid?> GetUserIdAsync() {
        string? email = User.FindFirst(ClaimTypes.Email)?.Value;
        
        if (string.IsNullOrEmpty(email)) {
            logger.LogWarning("User authenticated but email claim is missing");
            return null;
        }
        
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user == null) {
            logger.LogWarning("User {Email} authenticated but not found in database", email);
            return null;
        }
        
        return user.Id;
    }

    private async Task SendJobNotification(Guid userId, Guid jobId, string title, string message, NotificationType type) {
        var command = new CreateNotificationCommand(
            userId,
            title,
            message,
            type,
            null,
            "{\"jobId\": \"" + jobId + "\"}"
        );

        await mediator.Send(command);
    }

    private NotificationType GetRandomNotificationType() {
        var types = new[] { 
            NotificationType.Info, 
            NotificationType.Success, 
            NotificationType.Warning, 
            NotificationType.Error 
        };
        return types[Random.Shared.Next(types.Length)];
    }
}

// Request DTOs
public record TestNotificationRequest(
    string? Title,
    string? Message,
    NotificationType? Type,
    string? ActionUrl,
    string? Metadata
);

public record BulkTestNotificationRequest(
    int? Count
);

public record BroadcastNotificationRequest(
    string? Title,
    string? Message
);
#endif