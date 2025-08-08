using IntranetStarter.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
    private readonly ApplicationDbContext    _context;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration          _configuration;

    public AuthController(
        ApplicationDbContext    context,
        ILogger<AuthController> logger,
        IConfiguration          configuration) {
        _context       = context;
        _logger        = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Unified login endpoint - redirects to appropriate OAuth provider
    /// </summary>
    [HttpGet("login")]
    public IActionResult Login(string? returnUrl = null, string provider = "Google") {
        _logger.LogInformation("User attempting to login via {Provider} OAuth", provider);

        var properties = new AuthenticationProperties {
            RedirectUri = returnUrl ?? "/"
        };

        // Determine which provider to use
        var authScheme = provider.ToLowerInvariant() switch {
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
            if (User?.Identity?.IsAuthenticated != true) {
                _logger.LogDebug("User is not authenticated");
                return Unauthorized(new { Message = "User is not authenticated" });
            }

            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var name  = User.FindFirst(ClaimTypes.Name)?.Value;

            _logger.LogDebug("Current user info requested - Email: {Email}, Name: {Name}", email, name);

            if (string.IsNullOrEmpty(email)) {
                _logger.LogWarning("User authenticated but email claim is missing or empty");
                return BadRequest("User email not found");
            }

            // Get user from database for additional details
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) {
                _logger.LogWarning("User {Email} authenticated but not found in database", email);
                return NotFound("User not found in database");
            }

            _logger.LogInformation("Successfully retrieved current user information for {Email}", email);

            return Ok(new {
                Email           = email,
                Name            = name ?? user.FullName,
                IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
                // Additional user details from database
                Id          = user.Id,
                FirstName   = user.FirstName,
                LastName    = user.LastName,
                FullName    = user.FullName,
                Role        = user.Role,
                Department  = user.Department,
                JobTitle    = user.JobTitle,
                Avatar      = user.Avatar,
                IsActive    = user.IsActive,
                LastLoginAt = user.LastLoginAt
            });
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error retrieving current user information");
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
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            _logger.LogInformation("User logout initiated for {Email}", email);

            await HttpContext.SignOutAsync();

            _logger.LogInformation("User {Email} logged out successfully", email);
            return Ok(new { Message = "Logged out successfully" });
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error during logout process");
            return StatusCode(500, new { Message = "Error during logout" });
        }
    }

    /// <summary>
    /// Google OAuth callback - automatically handled by authentication middleware
    /// </summary>
    [HttpGet("signin-google")]
    public async Task<IActionResult> GoogleCallback() {
        try {
            _logger.LogDebug("Google OAuth callback received");

            var frontendUrl = GetFrontendUrl();
            var email       = User.FindFirst(ClaimTypes.Email)?.Value;

            if (User.Identity?.IsAuthenticated == true) {
                _logger.LogInformation("Google OAuth authentication successful for {Email}, redirecting to {FrontendUrl}", email, frontendUrl);
                // Redirect to dashboard instead of login page
                return Redirect($"{frontendUrl}");
            }
            else {
                _logger.LogWarning("Google OAuth callback received but user is not authenticated");
                return Redirect($"{frontendUrl}/login?error=authentication_failed");
            }
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error during Google OAuth callback processing");
            var errorUrl = GetFrontendUrl() + "/auth/error?message=" + Uri.EscapeDataString("Google authentication failed");
            return Redirect(errorUrl);
        }
    }

    /// <summary>
    /// Microsoft/Azure OAuth callback - automatically handled by authentication middleware
    /// </summary>
    [HttpGet("signin-microsoft")]
    public async Task<IActionResult> MicrosoftCallback() {
        try {
            _logger.LogDebug("Microsoft OAuth callback received");

            var frontendUrl = GetFrontendUrl();
            var email       = User.FindFirst(ClaimTypes.Email)?.Value;

            if (User.Identity?.IsAuthenticated == true) {
                _logger.LogInformation("Microsoft OAuth authentication successful for {Email}, redirecting to {FrontendUrl}", email, frontendUrl);
                // Redirect to dashboard instead of login page
                return Redirect($"{frontendUrl}/dashboard");
            }
            else {
                _logger.LogWarning("Microsoft OAuth callback received but user is not authenticated");
                return Redirect($"{frontendUrl}/login?error=authentication_failed");
            }
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error during Microsoft OAuth callback processing");
            var errorUrl = GetFrontendUrl() + "/auth/error?message=" + Uri.EscapeDataString("Microsoft authentication failed");
            return Redirect(errorUrl);
        }
    }

    /// <summary>
    /// Health check for authentication configuration
    /// </summary>
    [HttpGet("config")]
    public ActionResult<object> GetAuthConfig() {
        var config = new {
            GoogleEnabled    = !string.IsNullOrEmpty(_configuration["GOOGLE_CLIENT_ID"]),
            MicrosoftEnabled = !string.IsNullOrEmpty(_configuration["AZURE_AD_CLIENT_ID"]),
            AllowedDomain    = _configuration["ALLOWED_DOMAIN"]
        };

        return Ok(config);
    }

    private string GetFrontendUrl() {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
        return _configuration["FRONTEND_URL"] ?? (isDevelopment ? "http://localhost:5173" : "/");
    }
}