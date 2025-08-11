using IntranetStarter.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    ApplicationDbContext    context,
    ILogger<AuthController> logger,
    IConfiguration          configuration)
    : ControllerBase {
    /// <summary>
    /// Unified login endpoint - redirects to appropriate OAuth provider
    /// </summary>
    [HttpGet("login")]
    public IActionResult Login(string? returnUrl = null, string provider = "Google") {
        logger.LogInformation("User attempting to login via {Provider} OAuth", provider);

        var properties = new AuthenticationProperties {
            RedirectUri = returnUrl ?? "/"
        };

        // Determine which provider to use
        string authScheme = provider.ToLowerInvariant() switch {
            "microsoft" or "azure" => "Microsoft",
            "google"               => "Google",
            _                      => "Google" // Default to Google
        };

        return Challenge(properties, authScheme);
    }

    /// <summary>
    /// Login with Google OAuth specifically
    /// </summary>
    [HttpGet("login/google")]
    public IActionResult LoginWithGoogle(string? returnUrl = null) {
        return Login(returnUrl, "Google");
    }

    /// <summary>
    /// Login with Microsoft/Azure OAuth specifically
    /// </summary>
    [HttpGet("login/microsoft")]
    public IActionResult LoginWithMicrosoft(string? returnUrl = null) {
        return Login(returnUrl, "Microsoft");
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<object>> GetCurrentUser() {
        try {
            // Check if user is authenticated
            if (User.Identity?.IsAuthenticated != true) {
                logger.LogDebug("User is not authenticated");
                return Unauthorized(new { Message = "User is not authenticated" });
            }

            string? email = User.FindFirst(ClaimTypes.Email)?.Value;
            string? name  = User.FindFirst(ClaimTypes.Name)?.Value;

            logger.LogDebug("Current user info requested - Email: {Email}, Name: {Name}", email, name);

            if (string.IsNullOrEmpty(email)) {
                logger.LogWarning("User authenticated but email claim is missing or empty");
                return BadRequest("User email not found");
            }

            // Get user from database for additional details
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) {
                logger.LogWarning("User {Email} authenticated but not found in database", email);
                return NotFound("User not found in database");
            }

            logger.LogInformation("Successfully retrieved current user information for {Email}", email);

            return Ok(new {
                Email           = email,
                Name            = name ?? user.FullName,
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
                // Additional user details from database
                user.Id,
                user.FirstName,
                user.LastName,
                user.FullName,
                user.Role,
                user.Department,
                user.JobTitle,
                user.Avatar,
                user.IsActive,
                user.LastLoginAt,
                user.CreatedAt,
                user.UpdatedAt
            });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving current user information");
            return StatusCode(500, new { Message = "Error retrieving user information" });
        }
    }

    /// <summary>
    /// Logout endpoint
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout() {
        try {
            string? email = User.FindFirst(ClaimTypes.Email)?.Value;
            logger.LogInformation("User logout initiated for {Email}", email);

            await HttpContext.SignOutAsync();

            logger.LogInformation("User {Email} logged out successfully", email);
            return Ok(new { Message = "Logged out successfully" });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during logout process");
            return StatusCode(500, new { Message = "Error during logout" });
        }
    }

    /// <summary>
    /// Google OAuth callback - automatically handled by authentication middleware
    /// </summary>
    [HttpGet("signin-google")]
    public async Task<IActionResult> GoogleCallback() {
        try {
            logger.LogDebug("Google OAuth callback received");

            string  frontendUrl = GetFrontendUrl();
            string? email       = User.FindFirst(ClaimTypes.Email)?.Value;

            if (User.Identity?.IsAuthenticated == true) {
                logger.LogInformation("Google OAuth authentication successful for {Email}, redirecting to {FrontendUrl}", email, frontendUrl);
                // Redirect to dashboard instead of login page
                return Redirect($"{frontendUrl}");
            }
            else {
                logger.LogWarning("Google OAuth callback received but user is not authenticated");
                return Redirect($"{frontendUrl}/login?error=authentication_failed");
            }
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during Google OAuth callback processing");
            string errorUrl = GetFrontendUrl() + "/auth/error?message=" + Uri.EscapeDataString("Google authentication failed");
            return Redirect(errorUrl);
        }
    }

    /// <summary>
    /// Microsoft/Azure OAuth callback - automatically handled by authentication middleware
    /// </summary>
    [HttpGet("signin-microsoft")]
    public async Task<IActionResult> MicrosoftCallback() {
        try {
            logger.LogDebug("Microsoft OAuth callback received");

            string  frontendUrl = GetFrontendUrl();
            string? email       = User.FindFirst(ClaimTypes.Email)?.Value;

            if (User.Identity?.IsAuthenticated == true) {
                logger.LogInformation("Microsoft OAuth authentication successful for {Email}, redirecting to {FrontendUrl}", email, frontendUrl);
                // Redirect to dashboard instead of login page
                return Redirect($"{frontendUrl}/dashboard");
            }
            else {
                logger.LogWarning("Microsoft OAuth callback received but user is not authenticated");
                return Redirect($"{frontendUrl}/login?error=authentication_failed");
            }
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error during Microsoft OAuth callback processing");
            string errorUrl = GetFrontendUrl() + "/auth/error?message=" + Uri.EscapeDataString("Microsoft authentication failed");
            return Redirect(errorUrl);
        }
    }

    /// <summary>
    /// Health check for authentication configuration
    /// </summary>
    [HttpGet("config")]
    public ActionResult<object> GetAuthConfig() {
        var config = new {
            GoogleEnabled    = !string.IsNullOrEmpty(configuration["GOOGLE_CLIENT_ID"]),
            MicrosoftEnabled = !string.IsNullOrEmpty(configuration["AZURE_AD_CLIENT_ID"]),
            AllowedDomain    = configuration["ALLOWED_DOMAIN"]
        };

        return Ok(config);
    }

    private string GetFrontendUrl() {
        bool isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
        return configuration["FRONTEND_URL"] ?? (isDevelopment ? "http://localhost:5173" : "/");
    }
}