using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.WebUtilities;
using System.Security.Claims;
using IntranetStarter.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

namespace IntranetStarter.Api.Extensions;

public static class AuthenticationExtensions
{
    private const string CookieName = "IntranetAuth";

    public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, IConfiguration configuration, bool isDevelopment)
    {
        // Configure simple cookie-based authentication similar to ezy example
        services.AddAuthentication(options =>
        {
            options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = "Google"; // Default to Google for now
        })
        .AddCookie(options =>
        {
            options.Cookie.Name = CookieName;
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = isDevelopment ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromHours(8);
            options.SlidingExpiration = true;
            
            options.Events.OnRedirectToLogin = context =>
            {
                // For API calls, return 401 instead of redirect
                if (context.Request.Path.StartsWithSegments("/api"))
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                }
                return Task.CompletedTask;
            };
            
            options.Events.OnValidatePrincipal = async context =>
            {
                var email = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;
                var allowedDomain = configuration["ALLOWED_DOMAIN"];
                
                // Validate domain if configured
                if (!string.IsNullOrEmpty(allowedDomain) && !string.IsNullOrEmpty(email))
                {
                    if (!email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase))
                    {
                        context.RejectPrincipal();
                        await context.HttpContext.SignOutAsync(CookieName);
                        return;
                    }
                }
                
                // Update user last login in database
                var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                if (!string.IsNullOrEmpty(email))
                {
                    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
                    if (user != null)
                    {
                        user.LastLoginAt = DateTime.UtcNow;
                        await dbContext.SaveChangesAsync();
                    }
                }
            };
        });

        // Add Google OAuth if configured
        var googleClientId = configuration["GOOGLE_CLIENT_ID"];
        var googleClientSecret = configuration["GOOGLE_CLIENT_SECRET"];
        
        if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
        {
            services.AddAuthentication()
                .AddGoogle("Google", options =>
                {
                    options.ClientId = googleClientId;
                    options.ClientSecret = googleClientSecret;
                    options.CallbackPath = "/api/auth/signin-google";
                    options.SaveTokens = true;

                    // Add required scopes
                    options.Scope.Add("email");
                    options.Scope.Add("profile");

                    options.Events = new OAuthEvents
                    {
                        OnRedirectToAuthorizationEndpoint = context =>
                        {
                            var allowedDomain = configuration["ALLOWED_DOMAIN"];
                            if (!string.IsNullOrEmpty(allowedDomain))
                            {
                                // Add hosted domain parameter for Google
                                var uri = QueryHelpers.AddQueryString(context.RedirectUri, "hd", allowedDomain);
                                context.Response.Redirect(uri);
                            }
                            else
                            {
                                context.Response.Redirect(context.RedirectUri);
                            }
                            return Task.CompletedTask;
                        },
                        OnCreatingTicket = async context =>
                        {
                            var email = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;
                            var allowedDomain = configuration["ALLOWED_DOMAIN"];

                            // Validate domain
                            if (!string.IsNullOrEmpty(allowedDomain) && !string.IsNullOrEmpty(email))
                            {
                                if (!email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase))
                                {
                                    context.Fail($"User email {email} is not from allowed domain @{allowedDomain}");
                                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                                    return;
                                }
                            }

                            // Create or update user in database
                            await CreateOrUpdateUser(context.HttpContext, email, context.Principal?.FindFirst(ClaimTypes.Name)?.Value);
                        },
                        OnRemoteFailure = context =>
                        {
                            var frontendUrl = configuration["FRONTEND_URL"] ?? (isDevelopment ? "http://localhost:5173" : "/");
                            context.Response.Redirect($"{frontendUrl}/auth/error?message={context.Failure?.Message}");
                            context.HandleResponse();
                            return Task.CompletedTask;
                        }
                    };
                });
        }

        // Add Microsoft OAuth for Azure AD if configured
        var azureClientId = configuration["AZURE_AD_CLIENT_ID"];
        var azureClientSecret = configuration["AZURE_AD_CLIENT_SECRET"];
        var azureTenantId = configuration["AZURE_AD_TENANT_ID"];

        if (!string.IsNullOrEmpty(azureClientId) && !string.IsNullOrEmpty(azureClientSecret))
        {
            services.AddAuthentication()
                .AddMicrosoftAccount("Microsoft", options =>
                {
                    options.ClientId = azureClientId;
                    options.ClientSecret = azureClientSecret;
                    options.CallbackPath = "/api/auth/signin-microsoft";
                    options.SaveTokens = true;

                    // Configure for specific tenant if provided
                    if (!string.IsNullOrEmpty(azureTenantId))
                    {
                        options.AuthorizationEndpoint = $"https://login.microsoftonline.com/{azureTenantId}/oauth2/v2.0/authorize";
                        options.TokenEndpoint = $"https://login.microsoftonline.com/{azureTenantId}/oauth2/v2.0/token";
                    }

                    // Add required scopes
                    options.Scope.Add("https://graph.microsoft.com/user.read");
                    options.Scope.Add("email");
                    options.Scope.Add("profile");

                    options.Events = new OAuthEvents
                    {
                        OnCreatingTicket = async context =>
                        {
                            var email = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;
                            var allowedDomain = configuration["ALLOWED_DOMAIN"];

                            // Validate domain
                            if (!string.IsNullOrEmpty(allowedDomain) && !string.IsNullOrEmpty(email))
                            {
                                if (!email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase))
                                {
                                    context.Fail($"User email {email} is not from allowed domain @{allowedDomain}");
                                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                                    return;
                                }
                            }

                            // Create or update user in database
                            await CreateOrUpdateUser(context.HttpContext, email, context.Principal?.FindFirst(ClaimTypes.Name)?.Value);
                        },
                        OnRemoteFailure = context =>
                        {
                            var frontendUrl = configuration["FRONTEND_URL"] ?? (isDevelopment ? "http://localhost:5173" : "/");
                            context.Response.Redirect($"{frontendUrl}/auth/error?message={context.Failure?.Message}");
                            context.HandleResponse();
                            return Task.CompletedTask;
                        }
                    };
                });
        }

        return services;
    }

    private static async Task CreateOrUpdateUser(HttpContext httpContext, string? email, string? name)
    {
        if (string.IsNullOrEmpty(email)) return;

        var dbContext = httpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            // Parse full name into first and last name
            var nameParts = (name ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var firstName = nameParts.Length > 0 ? nameParts[0] : "Unknown";
            var lastName = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";

            user = new Domain.Entities.User
            {
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Role = "Employee", // Default role
                IsActive = true,
                LastLoginAt = DateTime.UtcNow
            };

            dbContext.Users.Add(user);
        }
        else
        {
            user.LastLoginAt = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync();
    }

    public static IServiceCollection AddCustomAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // Basic role-based policies
            options.AddPolicy("AdminOnly", policy => 
                policy.RequireRole("Admin"));
                
            options.AddPolicy("ManagerOrAdmin", policy => 
                policy.RequireRole("Manager", "Admin"));
                
            options.AddPolicy("AllUsers", policy => 
                policy.RequireAuthenticatedUser());

            // Department-based policies
            options.AddPolicy("ITDepartment", policy =>
                policy.RequireClaim("department", "IT"));
                
            options.AddPolicy("HRDepartment", policy =>
                policy.RequireClaim("department", "HR"));

            // Custom policies
            options.AddPolicy("CanManageProjects", policy =>
                policy.RequireAssertion(context =>
                    context.User.IsInRole("Admin") ||
                    context.User.IsInRole("Manager") ||
                    context.User.HasClaim("permission", "manage_projects")));
                    
            options.AddPolicy("CanViewReports", policy =>
                policy.RequireAssertion(context =>
                    context.User.IsInRole("Admin") ||
                    context.User.IsInRole("Manager") ||
                    context.User.HasClaim("permission", "view_reports")));
        });

        return services;
    }
}

public static class AuthenticationMiddlewareExtensions
{
    public static IApplicationBuilder UseCustomAuthentication(this IApplicationBuilder app)
    {
        app.UseAuthentication();
        app.UseAuthorization();
        
        return app;
    }
}