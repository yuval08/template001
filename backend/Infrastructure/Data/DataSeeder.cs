using IntranetStarter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.Data;

/// <summary>
/// Data seeding service that provides environment-specific data seeding
/// </summary>
public class DataSeeder : IDataSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(
        ApplicationDbContext context,
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<DataSeeder> logger)
    {
        _context = context;
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting data seeding for environment: {Environment}", _environment.EnvironmentName);

            // Seed admin user from configuration if provided
            await SeedAdminUserFromConfiguration(cancellationToken);

            if (_environment.IsDevelopment())
            {
                await SeedDevelopmentData(cancellationToken);
            }
            else
            {
                await SeedProductionData(cancellationToken);
            }

            _logger.LogInformation("Data seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during data seeding");
            throw;
        }
    }

    /// <summary>
    /// Seeds admin user from ADMIN_EMAIL configuration if provided and not already exists
    /// </summary>
    private async Task SeedAdminUserFromConfiguration(CancellationToken cancellationToken)
    {
        var adminEmail = _configuration["ADMIN_EMAIL"];
        if (string.IsNullOrEmpty(adminEmail))
        {
            _logger.LogInformation("No ADMIN_EMAIL configured, skipping admin user creation");
            return;
        }

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == adminEmail, cancellationToken);

        if (existingUser == null)
        {
            var adminUser = new User
            {
                Email = adminEmail,
                FirstName = "System",
                LastName = "Administrator",
                Role = "Admin",
                Department = "IT",
                JobTitle = "System Administrator",
                IsActive = true
            };

            _context.Users.Add(adminUser);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Admin user created: {AdminEmail}", adminEmail);
        }
        else
        {
            _logger.LogInformation("Admin user already exists: {AdminEmail}", adminEmail);
        }
    }

    /// <summary>
    /// Seeds development environment with rich test data
    /// </summary>
    private async Task SeedDevelopmentData(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Seeding development data");

        // Check if development data already exists
        var existingUserCount = await _context.Users.CountAsync(cancellationToken);
        if (existingUserCount > 1) // More than just potential admin user
        {
            _logger.LogInformation("Development data already exists, skipping seeding");
            return;
        }

        // Seed additional development users (beyond the deterministic ones in migrations)
        var developmentUsers = new[]
        {
            new User
            {
                Email = "developer1@company.com",
                FirstName = "Alice",
                LastName = "Developer",
                Role = "Employee",
                Department = "Development",
                JobTitle = "Senior Software Developer",
                IsActive = true
            },
            new User
            {
                Email = "developer2@company.com",
                FirstName = "Bob",
                LastName = "Frontend",
                Role = "Employee",
                Department = "Development",
                JobTitle = "Frontend Developer",
                IsActive = true
            },
            new User
            {
                Email = "tester@company.com",
                FirstName = "Carol",
                LastName = "Tester",
                Role = "Employee",
                Department = "QA",
                JobTitle = "QA Engineer",
                IsActive = true
            }
        };

        foreach (var user in developmentUsers)
        {
            var existing = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == user.Email, cancellationToken);
            
            if (existing == null)
            {
                _context.Users.Add(user);
                _logger.LogDebug("Added development user: {Email}", user.Email);
            }
        }

        // Seed additional development projects
        var developmentProjects = new[]
        {
            new Project
            {
                Name = "Mobile App Development",
                Description = "Native mobile application for iOS and Android platforms",
                Status = ProjectStatus.InProgress,
                Budget = 120000m,
                ClientName = "Tech Startup Inc",
                Priority = 1,
                StartDate = DateTime.UtcNow.AddDays(-60),
                EndDate = DateTime.UtcNow.AddDays(90),
                Tags = "mobile,ios,android,development",
                OwnerId = SeedDataConstants.ManagerUserId
            },
            new Project
            {
                Name = "API Modernization",
                Description = "Modernize legacy API infrastructure with microservices architecture",
                Status = ProjectStatus.Planning,
                Budget = 200000m,
                ClientName = "Enterprise Client",
                Priority = 2,
                StartDate = DateTime.UtcNow.AddDays(30),
                EndDate = DateTime.UtcNow.AddDays(210),
                Tags = "api,microservices,modernization",
                OwnerId = SeedDataConstants.ManagerUserId
            }
        };

        foreach (var project in developmentProjects)
        {
            var existing = await _context.Projects
                .FirstOrDefaultAsync(p => p.Name == project.Name, cancellationToken);
            
            if (existing == null)
            {
                _context.Projects.Add(project);
                _logger.LogDebug("Added development project: {ProjectName}", project.Name);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Development data seeding completed");
    }

    /// <summary>
    /// Seeds production environment with minimal essential data
    /// </summary>
    private async Task SeedProductionData(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Seeding production data");

        // In production, we only ensure the deterministic seed data exists
        // (this is mainly handled by migrations, but we can add any production-specific logic here)
        
        var userCount = await _context.Users.CountAsync(cancellationToken);
        _logger.LogInformation("Production environment initialized with {UserCount} users", userCount);
    }
}