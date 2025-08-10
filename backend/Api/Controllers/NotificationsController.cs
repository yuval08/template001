using IntranetStarter.Application.Commands;
using IntranetStarter.Application.Queries;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController(
    IMediator mediator, 
    ApplicationDbContext context,
    ILogger<NotificationsController> logger) : ControllerBase {
    [HttpGet]
    public async Task<ActionResult<GetUserNotificationsResponse>> GetNotifications(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isRead = null,
        [FromQuery] NotificationType? type = null) {
        
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var query = new GetUserNotificationsQuery(userId.Value, pageNumber, pageSize, isRead, type);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var query = new GetUnreadNotificationCountQuery(userId.Value);
        var count = await mediator.Send(query);
        return Ok(new { count });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id) {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new MarkNotificationAsReadCommand(id, userId.Value);
        var result = await mediator.Send(command);
        
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<ActionResult<int>> MarkAllAsRead() {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new MarkAllNotificationsAsReadCommand(userId.Value);
        var count = await mediator.Send(command);
        return Ok(new { markedAsRead = count });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(Guid id) {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new DeleteNotificationCommand(id, userId.Value);
        var result = await mediator.Send(command);
        
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("test")]
    [ApiExplorerSettings(IgnoreApi = true)] // Hide from Swagger in production
    public async Task<ActionResult<Guid>> CreateTestNotification([FromBody] CreateTestNotificationDto dto) {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var command = new CreateNotificationCommand(
            userId.Value,
            dto.Title ?? "Test Notification",
            dto.Message ?? "This is a test notification message.",
            dto.Type ?? NotificationType.Info,
            dto.ActionUrl,
            dto.Metadata
        );

        var notificationId = await mediator.Send(command);
        return Ok(new { notificationId });
    }

    private async Task<Guid?> GetUserIdAsync() {
        // Get user email from claims (following AuthController pattern)
        string? email = User.FindFirst(ClaimTypes.Email)?.Value;
        
        if (string.IsNullOrEmpty(email)) {
            logger.LogWarning("User authenticated but email claim is missing");
            return null;
        }
        
        // Look up user in database by email to get their ID
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user == null) {
            logger.LogWarning("User {Email} authenticated but not found in database", email);
            return null;
        }
        
        return user.Id;
    }
}

public record CreateTestNotificationDto(
    string? Title,
    string? Message,
    NotificationType? Type,
    string? ActionUrl,
    string? Metadata
);