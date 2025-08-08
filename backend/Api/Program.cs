using Hangfire;
using Hangfire.Dashboard;
using IntranetStarter.Api.Hubs;
using IntranetStarter.Application;
using IntranetStarter.Infrastructure;
using IntranetStarter.Infrastructure.BackgroundJobs;
using IntranetStarter.Infrastructure.Data;
using IntranetStarter.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Intranet Starter API", Version = "v1" });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new()
    {
        {
            new ()
            {
                Reference = new ()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration["CorsSettings:AllowedOrigins"]?.Split(',') ?? 
                new[] { "http://localhost:3000", "http://localhost:5173", "https://localhost:3000", "https://localhost:5173" }
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add Application and Infrastructure services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = jwtSection["Authority"];
    options.Audience = jwtSection["Audience"];
    options.RequireHttpsMetadata = bool.Parse(jwtSection["RequireHttpsMetadata"] ?? "true");
    
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            // Add custom claims or user information
            var userEmail = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;
            if (!string.IsNullOrEmpty(userEmail))
            {
                // Check domain restriction
                var allowedDomain = builder.Configuration["ALLOWED_DOMAIN"];
                if (!string.IsNullOrEmpty(allowedDomain) && !userEmail.EndsWith($"@{allowedDomain}"))
                {
                    context.Fail($"Email domain not allowed. Must be @{allowedDomain}");
                    return;
                }
                
                // Add role claims from database
                var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                
                if (user != null)
                {
                    var claims = new List<Claim>
                    {
                        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new(ClaimTypes.Name, user.FullName),
                        new(ClaimTypes.Role, user.Role),
                        new("department", user.Department ?? ""),
                        new("job_title", user.JobTitle ?? "")
                    };
                    
                    var appIdentity = new ClaimsIdentity(claims);
                    context.Principal?.AddIdentity(appIdentity);
                    
                    // Update last login
                    user.LastLoginAt = DateTime.UtcNow;
                    await dbContext.SaveChangesAsync();
                }
            }
        }
    };
});

// Add Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Admin"));
    options.AddPolicy("AllUsers", policy => policy.RequireAuthenticatedUser());
});

// Add SignalR
builder.Services.AddSignalR();

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!)
    .AddHangfire(options =>
    {
        options.MinimumAvailableServers = 1;
    });

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Intranet Starter API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app root
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Use Hangfire Dashboard (only in development or for admins)
if (app.Environment.IsDevelopment())
{
    app.UseHangfireDashboard("/hangfire");
}
else
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new HangfireAuthorizationFilter() }
    });
}

// Map controllers and hubs
app.MapControllers();
app.MapHub<IntranetStarter.Api.Hubs.NotificationHub>("/hubs/notifications");

// Health checks endpoint
app.MapHealthChecks("/health");

// Seed initial data and start background jobs
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Apply migrations
        await context.Database.MigrateAsync();
        
        // Seed admin user if configured
        await SeedAdminUser(scope.ServiceProvider, builder.Configuration);
        
        // Schedule recurring jobs
        var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
        recurringJobManager.ScheduleProjectReportGeneration();
        
        Log.Information("Application started successfully");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Application failed to start");
        throw;
    }
}

app.Run();

static async Task SeedAdminUser(IServiceProvider serviceProvider, IConfiguration configuration)
{
    var adminEmail = configuration["ADMIN_EMAIL"];
    if (string.IsNullOrEmpty(adminEmail))
        return;

    var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
    
    var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
    if (existingUser == null)
    {
        var adminUser = new IntranetStarter.Domain.Entities.User
        {
            Email = adminEmail,
            FirstName = "System",
            LastName = "Administrator",
            Role = "Admin",
            Department = "IT",
            JobTitle = "System Administrator",
            IsActive = true
        };
        
        context.Users.Add(adminUser);
        await context.SaveChangesAsync();
        
        Log.Information("Admin user created: {AdminEmail}", adminEmail);
    }
}

// Make Program class public for integration tests
public partial class Program { }

// Custom Hangfire authorization filter for production
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();
        
        // Only allow authenticated admin users
        return httpContext.User.Identity?.IsAuthenticated == true &&
               httpContext.User.IsInRole("Admin");
    }
}