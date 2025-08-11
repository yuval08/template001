using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace IntranetStarter.Infrastructure.Hubs;

public class CustomUserIdProvider : IUserIdProvider {
    public string? GetUserId(HubConnectionContext connection) {
        // Try to get user ID from claims
        // First try the email claim since we use email-based auth
        var email = connection.User?.FindFirst(ClaimTypes.Email)?.Value;
        
        if (!string.IsNullOrEmpty(email)) {
            // For now, we'll use the email as the user identifier
            // This needs to match what we're passing to SendAsync
            return email;
        }
        
        // Fallback to name claim
        return connection.User?.Identity?.Name;
    }
}