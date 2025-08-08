using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.WebUtilities;
using System.Security.Claims;
using System.Text.Json;
using IntranetStarter.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

namespace IntranetStarter.Api.Extensions;

public static class AuthenticationExtensions {
    private const string CookieName = "IntranetAuth";

    public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, IConfiguration configuration, bool isDevelopment) {
        // Configure simple cookie-based authentication similar to ezy example
        services.AddAuthentication(options => {
                options.DefaultScheme          = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = "Google"; // Default to Google for now
            })
            .AddCookie(options => {
                options.Cookie.Name         = CookieName;
                options.Cookie.HttpOnly     = true;
                options.Cookie.SecurePolicy = isDevelopment ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
                options.Cookie.SameSite     = SameSiteMode.Lax;
                options.ExpireTimeSpan      = TimeSpan.FromHours(8);
                options.SlidingExpiration   = true;

                options.Events.OnRedirectToLogin = context => {
                    // For API calls, return 401 and prevent further processing
                    if (context.Request.Path.StartsWithSegments("/api")) {
                        context.Response.StatusCode  = 401;
                        context.Response.ContentType = "application/json";
                        string json = JsonSerializer.Serialize(new {
                            message = "Unauthorized",
                            status  = 401
                        });
                        return context.Response.WriteAsync(json);
                    }

                    return Task.CompletedTask;
                };

                options.Events.OnRedirectToAccessDenied = context => {
                    // For API calls, return 403 Forbidden instead of redirecting
                    if (context.Request.Path.StartsWithSegments("/api")) {
                        context.Response.StatusCode  = 403;
                        context.Response.ContentType = "application/json";
                        string json = JsonSerializer.Serialize(new {
                            message = "Access denied. Insufficient permissions.",
                            status  = 403
                        });
                        return context.Response.WriteAsync(json);
                    }

                    return Task.CompletedTask;
                };

                options.Events.OnValidatePrincipal = async context => {
                    string? email         = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;
                    string? allowedDomain = configuration["ALLOWED_DOMAIN"];

                    // Validate domain if configured
                    if (!string.IsNullOrEmpty(allowedDomain) && !string.IsNullOrEmpty(email)) {
                        if (!email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase)) {
                            context.RejectPrincipal();
                            await context.HttpContext.SignOutAsync(CookieName);
                            return;
                        }
                    }

                    // Update user last login in database and add role claim
                    var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                    if (!string.IsNullOrEmpty(email)) {
                        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
                        if (user != null) {
                            user.LastLoginAt = DateTime.UtcNow;
                            await dbContext.SaveChangesAsync();

                            // Add role claim to the principal if not already present
                            var claimsIdentity = context.Principal?.Identity as ClaimsIdentity;
                            if (claimsIdentity != null && !claimsIdentity.HasClaim(ClaimTypes.Role, user.Role)) {
                                claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, user.Role));
                            }
                        }
                    }
                };
            });

        // Add Google OAuth if configured
        string? googleClientId     = configuration["GOOGLE_CLIENT_ID"];
        string? googleClientSecret = configuration["GOOGLE_CLIENT_SECRET"];

        if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret)) {
            services.AddAuthentication()
                .AddGoogle("Google", options => {
                    options.ClientId     = googleClientId;
                    options.ClientSecret = googleClientSecret;
                    options.CallbackPath = "/api/auth/signin-google";
                    options.SaveTokens   = true;

                    // Add required scopes
                    options.Scope.Add("email");
                    options.Scope.Add("profile");

                    options.Events = new OAuthEvents {
                        OnRedirectToAuthorizationEndpoint = context => {
                            string? allowedDomain = configuration["ALLOWED_DOMAIN"];
                            if (!string.IsNullOrEmpty(allowedDomain)) {
                                // Add hosted domain parameter for Google
                                string uri = QueryHelpers.AddQueryString(context.RedirectUri, "hd", allowedDomain);
                                context.Response.Redirect(uri);
                            }
                            else {
                                context.Response.Redirect(context.RedirectUri);
                            }

                            return Task.CompletedTask;
                        },
                        OnCreatingTicket = async context => {
                            string? email         = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;
                            string? allowedDomain = configuration["ALLOWED_DOMAIN"];

                            // Validate domain
                            if (!string.IsNullOrEmpty(allowedDomain) && !string.IsNullOrEmpty(email)) {
                                if (!email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase)) {
                                    context.Fail($"User email {email} is not from allowed domain @{allowedDomain}");
                                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                                    return;
                                }
                            }

                            // Create or update user in database and add role claim
                            var user = await CreateOrUpdateUser(context.HttpContext, email, context.Principal?.FindFirst(ClaimTypes.Name)?.Value);
                            if (user != null && !string.IsNullOrEmpty(user.Role)) {
                                var claimsIdentity = context.Principal?.Identity as ClaimsIdentity;
                                if (claimsIdentity != null && !claimsIdentity.HasClaim(ClaimTypes.Role, user.Role)) {
                                    claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, user.Role));
                                }
                            }
                        },
                        OnRemoteFailure = context => {
                            string frontendUrl = configuration["FRONTEND_URL"] ?? (isDevelopment ? "http://localhost:5173" : "/");
                            context.Response.Redirect($"{frontendUrl}/auth/error?message={context.Failure?.Message}");
                            return Task.CompletedTask;
                        }
                    };
                });
        }

        // Add Microsoft OAuth for Azure AD if configured
        string? azureClientId     = configuration["AZURE_AD_CLIENT_ID"];
        string? azureClientSecret = configuration["AZURE_AD_CLIENT_SECRET"];
        string? azureTenantId     = configuration["AZURE_AD_TENANT_ID"];

        if (!string.IsNullOrEmpty(azureClientId) && !string.IsNullOrEmpty(azureClientSecret)) {
            services.AddAuthentication()
                .AddMicrosoftAccount("Microsoft", options => {
                    options.ClientId     = azureClientId;
                    options.ClientSecret = azureClientSecret;
                    options.CallbackPath = "/api/auth/signin-microsoft";
                    options.SaveTokens   = true;

                    // Configure for specific tenant if provided
                    if (!string.IsNullOrEmpty(azureTenantId)) {
                        options.AuthorizationEndpoint = $"https://login.microsoftonline.com/{azureTenantId}/oauth2/v2.0/authorize";
                        options.TokenEndpoint         = $"https://login.microsoftonline.com/{azureTenantId}/oauth2/v2.0/token";
                    }

                    // Add required scopes
                    options.Scope.Add("https://graph.microsoft.com/user.read");
                    options.Scope.Add("email");
                    options.Scope.Add("profile");

                    options.Events = new OAuthEvents {
                        OnCreatingTicket = async context => {
                            string? email         = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;
                            string? allowedDomain = configuration["ALLOWED_DOMAIN"];

                            // Validate domain
                            if (!string.IsNullOrEmpty(allowedDomain) && !string.IsNullOrEmpty(email)) {
                                if (!email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase)) {
                                    context.Fail($"User email {email} is not from allowed domain @{allowedDomain}");
                                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                                    return;
                                }
                            }

                            // Create or update user in database and add role claim
                            var user = await CreateOrUpdateUser(context.HttpContext, email, context.Principal?.FindFirst(ClaimTypes.Name)?.Value);
                            if (user != null && !string.IsNullOrEmpty(user.Role)) {
                                var claimsIdentity = context.Principal?.Identity as ClaimsIdentity;
                                if (claimsIdentity != null && !claimsIdentity.HasClaim(ClaimTypes.Role, user.Role)) {
                                    claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, user.Role));
                                }
                            }
                        },
                        OnRemoteFailure = context => {
                            string frontendUrl = configuration["FRONTEND_URL"] ?? (isDevelopment ? "http://localhost:5173" : "/");
                            context.Response.Redirect($"{frontendUrl}/auth/error?message={context.Failure?.Message}");
                            return Task.CompletedTask;
                        }
                    };
                });
        }

        return services;
    }

    private static async Task<Domain.Entities.User?> CreateOrUpdateUser(HttpContext httpContext, string? email, string? name) {
        if (string.IsNullOrEmpty(email)) return null;

        var dbContext = httpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
        var user      = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null) {
            // Parse full name into first and last name
            string[] nameParts = (name ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
            string firstName = nameParts.Length > 0 ? nameParts[0] : "Unknown";
            string lastName  = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";

            // Check for pending invitations first
            var pendingInvitation = await dbContext.PendingInvitations
                .FirstOrDefaultAsync(i => i.Email == email && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow);

            string       defaultRole = "Employee";
            Guid?     invitedById = null;
            DateTime? invitedAt   = null;

            if (pendingInvitation != null) {
                // Use role from invitation
                defaultRole = pendingInvitation.IntendedRole;
                invitedById = pendingInvitation.InvitedById;
                invitedAt   = pendingInvitation.InvitedAt;

                // Mark invitation as used
                pendingInvitation.IsUsed = true;
                pendingInvitation.UsedAt = DateTime.UtcNow;
            }

            user = new Domain.Entities.User {
                Email         = email,
                FirstName     = firstName,
                LastName      = lastName,
                Role          = defaultRole,
                IsActive      = true,
                IsProvisioned = false, // New user from OAuth is not pre-provisioned
                InvitedById   = invitedById,
                InvitedAt     = invitedAt,
                ActivatedAt   = DateTime.UtcNow,
                LastLoginAt   = DateTime.UtcNow
            };

            dbContext.Users.Add(user);
        }
        else {
            // Update existing user
            user.LastLoginAt = DateTime.UtcNow;

            // Handle pre-provisioned user activation
            if (user.IsProvisioned) {
                // Keep their assigned role (don't override)
                user.IsProvisioned = false;
                user.ActivatedAt   = DateTime.UtcNow;

                // Update name from OAuth if FirstName was "Unknown"
                if (user.FirstName == "Unknown" && !string.IsNullOrEmpty(name)) {
                    string[] nameParts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    user.FirstName = nameParts.Length > 0 ? nameParts[0] : "Unknown";
                    user.LastName  = nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "";
                }
            }
            else {
                // Check for pending invitations for existing non-provisioned users
                var pendingInvitation = await dbContext.PendingInvitations
                    .FirstOrDefaultAsync(i => i.Email == email && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow);

                if (pendingInvitation != null) {
                    // Apply role from invitation if user doesn't have Admin role
                    if (user.Role != "Admin") {
                        user.Role = pendingInvitation.IntendedRole;
                    }

                    user.InvitedById = pendingInvitation.InvitedById;
                    user.InvitedAt   = pendingInvitation.InvitedAt;

                    // Mark invitation as used
                    pendingInvitation.IsUsed = true;
                    pendingInvitation.UsedAt = DateTime.UtcNow;
                }
            }
        }

        await dbContext.SaveChangesAsync();
        return user;
    }

    public static IServiceCollection AddCustomAuthorization(this IServiceCollection services) {
        services.AddAuthorization(options => {
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

public static class AuthenticationMiddlewareExtensions {
    public static IApplicationBuilder UseCustomAuthentication(this IApplicationBuilder app) {
        app.UseAuthentication();
        app.UseAuthorization();

        return app;
    }
}