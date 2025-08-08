using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace IntranetStarter.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection("Jwt");
        
        services.AddAuthentication(options =>
        {
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            // Configure JWT Bearer token validation
            options.Authority = jwtSection["Authority"] ?? configuration["JWT_AUTHORITY"];
            options.Audience = jwtSection["Audience"] ?? configuration["JWT_AUDIENCE"];
            options.RequireHttpsMetadata = bool.Parse(jwtSection["RequireHttpsMetadata"] ?? configuration["JWT_REQUIRE_HTTPS"] ?? "true");
            
            // Configure token validation parameters
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            // Handle SignalR authentication
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }
                    
                    return Task.CompletedTask;
                }
            };
        });

        // Add Azure AD OpenID Connect if configured
        var azureAdSection = configuration.GetSection("AzureAd");
        var azureTenantId = azureAdSection["TenantId"] ?? configuration["AZURE_AD_TENANT_ID"];
        var azureClientId = azureAdSection["ClientId"] ?? configuration["AZURE_AD_CLIENT_ID"];
        
        if (!string.IsNullOrEmpty(azureTenantId) && !string.IsNullOrEmpty(azureClientId))
        {
            services.AddAuthentication()
                .AddOpenIdConnect("AzureAD", "Azure Active Directory", options =>
                {
                    options.Authority = $"https://login.microsoftonline.com/{azureTenantId}/v2.0";
                    options.ClientId = azureClientId;
                    options.ClientSecret = azureAdSection["ClientSecret"] ?? configuration["AZURE_AD_CLIENT_SECRET"];
                    options.ResponseType = "code";
                    options.SaveTokens = true;
                    options.CallbackPath = "/signin-azuread";
                    
                    options.Scope.Clear();
                    options.Scope.Add("openid");
                    options.Scope.Add("profile");
                    options.Scope.Add("email");
                    
                    options.TokenValidationParameters.NameClaimType = "name";
                    options.TokenValidationParameters.RoleClaimType = "role";
                    
                    options.Events = new OpenIdConnectEvents
                    {
                        OnTokenValidated = async context =>
                        {
                            // Domain validation
                            var email = context.Principal?.FindFirst("email")?.Value;
                            await ValidateUserDomain(context, email, configuration);
                        }
                    };
                });
        }

        // Add Google OpenID Connect if configured
        var googleClientId = configuration["Authentication:Google:ClientId"] ?? configuration["GOOGLE_CLIENT_ID"];
        var googleClientSecret = configuration["Authentication:Google:ClientSecret"] ?? configuration["GOOGLE_CLIENT_SECRET"];
        
        if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
        {
            services.AddAuthentication()
                .AddGoogle("Google", options =>
                {
                    options.ClientId = googleClientId;
                    options.ClientSecret = googleClientSecret;
                    options.SaveTokens = true;
                    options.CallbackPath = "/signin-google";
                    
                    options.Events = new()
                    {
                        OnCreatingTicket = async context =>
                        {
                            // Domain validation
                            var email = context.Principal?.FindFirst("email")?.Value;
                            await ValidateUserDomain(context, email, configuration);
                        }
                    };
                });
        }

        return services;
    }

    private static Task ValidateUserDomain<T>(T context, string? email, IConfiguration configuration) where T : class
    {
        var allowedDomain = configuration["ALLOWED_DOMAIN"];
        
        if (!string.IsNullOrEmpty(allowedDomain) && !string.IsNullOrEmpty(email))
        {
            if (!email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException($"Email domain not allowed. Must be @{allowedDomain}");
            }
        }
        
        return Task.CompletedTask;
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