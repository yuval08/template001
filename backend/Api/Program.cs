using Hangfire;
using Hangfire.Dashboard;
using IntranetStarter.Api.Extensions;
using IntranetStarter.Api.Middleware;
using IntranetStarter.Application;
using IntranetStarter.Infrastructure;
using IntranetStarter.Infrastructure.BackgroundJobs;
using IntranetStarter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

#if DEBUG
DotNetEnv.Env.Load();
#endif

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
                ["http://localhost:3000", "http://localhost:5173", "https://localhost:3000", "https://localhost:5173"]
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add Application and Infrastructure services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add simplified cookie-based authentication
builder.Services.AddCustomAuthentication(builder.Configuration, builder.Environment.IsDevelopment());
builder.Services.AddCustomAuthorization();

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

// Add global exception middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Use Hangfire Dashboard (only in development or for admins)
if (app.Environment.IsDevelopment())
{
    app.UseHangfireDashboard();
}
else
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = [new HangfireAuthorizationFilter()]
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
        
        // Seed data using the data seeding service
        var dataSeeder = scope.ServiceProvider.GetRequiredService<IDataSeeder>();
        await dataSeeder.SeedAsync();
        
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