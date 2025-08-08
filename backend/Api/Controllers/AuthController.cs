using IntranetStarter.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(
        ApplicationDbContext context,
        ILogger<AuthController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Initiate Google OAuth login
    /// </summary>
    [HttpGet("login/google")]
    public IActionResult LoginWithGoogle()
    {
        var redirectUrl = Url.Action(nameof(GoogleCallback));
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, "Google");
    }

    /// <summary>
    /// Initiate Azure AD login
    /// </summary>
    [HttpGet("login/azure")]
    public IActionResult LoginWithAzureAD()
    {
        var redirectUrl = Url.Action(nameof(AzureCallback));
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, "AzureAD");
    }

    /// <summary>
    /// Google OAuth callback
    /// </summary>
    [HttpGet("callback/google")]
    public async Task<IActionResult> GoogleCallback()
    {
        try
        {
            var result = await HttpContext.AuthenticateAsync("Google");
            
            if (!result.Succeeded)
            {
                _logger.LogWarning("Google authentication failed");
                return BadRequest("Google authentication failed");
            }

            var email = result.Principal?.FindFirst(ClaimTypes.Email)?.Value;
            var name = result.Principal?.FindFirst(ClaimTypes.Name)?.Value;
            
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email not provided by Google");
            }

            // Validate domain restriction
            var allowedDomain = _configuration["ALLOWED_DOMAIN"];
            if (!string.IsNullOrEmpty(allowedDomain) && !email.EndsWith($"@{allowedDomain}"))
            {
                _logger.LogWarning("User attempted login with unauthorized domain: {Email}", email);
                return Unauthorized($"Email domain not allowed. Must be @{allowedDomain}");
            }

            // Create or update user in database
            var user = await CreateOrUpdateUser(email, name ?? "");

            _logger.LogInformation("User logged in successfully via Google: {Email}", email);

            // In a real implementation, you would generate a JWT token here
            // For now, we'll redirect to the frontend with user information
            var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:3000";
            return Redirect($"{frontendUrl}/auth/callback?email={email}&name={Uri.EscapeDataString(user.FullName)}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Google callback");
            return StatusCode(500, "Authentication error occurred");
        }
    }

    /// <summary>
    /// Azure AD OAuth callback
    /// </summary>
    [HttpGet("callback/azure")]
    public async Task<IActionResult> AzureCallback()
    {
        try
        {
            var result = await HttpContext.AuthenticateAsync("AzureAD");
            
            if (!result.Succeeded)
            {
                _logger.LogWarning("Azure AD authentication failed");
                return BadRequest("Azure AD authentication failed");
            }

            var email = result.Principal?.FindFirst("email")?.Value;
            var name = result.Principal?.FindFirst("name")?.Value;
            
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email not provided by Azure AD");
            }

            // Create or update user in database
            var user = await CreateOrUpdateUser(email, name ?? "");

            _logger.LogInformation("User logged in successfully via Azure AD: {Email}", email);

            // In a real implementation, you would generate a JWT token here
            var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:3000";
            return Redirect($"{frontendUrl}/auth/callback?email={email}&name={Uri.EscapeDataString(user.FullName)}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Azure AD callback");
            return StatusCode(500, "Authentication error occurred");
        }
    }

    /// <summary>
    /// Logout endpoint
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            await HttpContext.SignOutAsync();
            
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (!string.IsNullOrEmpty(userEmail))
            {
                _logger.LogInformation("User logged out: {Email}", userEmail);
            }

            return Ok(new { Message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, "Logout error occurred");
        }
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<object>> GetCurrentUser()
    {
        try
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            
            if (string.IsNullOrEmpty(userEmail))
            {
                return BadRequest("User email not found");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            
            if (user == null)
            {
                return NotFound("User not found in database");
            }

            return Ok(new
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                Role = user.Role,
                Department = user.Department,
                JobTitle = user.JobTitle,
                Avatar = user.Avatar,
                IsActive = user.IsActive,
                LastLoginAt = user.LastLoginAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user information");
            return StatusCode(500, "Error retrieving user information");
        }
    }

    /// <summary>
    /// Health check for authentication configuration
    /// </summary>
    [HttpGet("config")]
    public ActionResult<object> GetAuthConfig()
    {
        var config = new
        {
            GoogleEnabled = !string.IsNullOrEmpty(_configuration["GOOGLE_CLIENT_ID"]),
            AzureADEnabled = !string.IsNullOrEmpty(_configuration["AZURE_AD_CLIENT_ID"]),
            AllowedDomain = _configuration["ALLOWED_DOMAIN"],
            JwtAuthority = _configuration["JWT_AUTHORITY"]
        };

        return Ok(config);
    }

    private async Task<Domain.Entities.User> CreateOrUpdateUser(string email, string fullName)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user == null)
        {
            // Parse full name into first and last name
            var nameParts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var firstName = nameParts.Length > 0 ? nameParts[0] : "Unknown";
            var lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";
            
            user = new Domain.Entities.User
            {
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Role = "Employee", // Default role
                IsActive = true
            };
            
            _context.Users.Add(user);
        }
        else
        {
            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
        return user;
    }
}