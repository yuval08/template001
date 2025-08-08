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

        // Check if we already have enough projects for testing
        var existingProjectCount = await _context.Projects.CountAsync(cancellationToken);
        if (existingProjectCount >= 50)
        {
            _logger.LogInformation("Sufficient projects already exist ({Count}), skipping project seeding", existingProjectCount);
        }
        else
        {
            _logger.LogInformation("Seeding development projects for pagination testing");
            
            // Seed additional development projects - enough for pagination testing
            var projectStatuses = new[] { ProjectStatus.Planning, ProjectStatus.InProgress, ProjectStatus.OnHold, ProjectStatus.Completed, ProjectStatus.Cancelled };
            var clients = new[] { "Tech Startup Inc", "Enterprise Corp", "Global Solutions", "Innovation Labs", "Digital Agency", "Software House", "Cloud Systems", "Data Analytics Co" };
            var tags = new[] { "web", "mobile", "api", "cloud", "database", "ai", "ml", "security", "infrastructure", "analytics" };
            
            var developmentProjects = new List<Project>();
            
            // Create 50+ projects for pagination testing
            for (int i = 1; i <= 55; i++)
            {
                var status = projectStatuses[i % projectStatuses.Length];
                var startOffset = -90 + (i * 3);
                var duration = 30 + (i % 5) * 30;
                
                developmentProjects.Add(new Project
                {
                    Name = $"Project {i:D3} - {GetProjectNameSuffix(i)}",
                    Description = $"Description for project {i}. This is a {status} project with various technical requirements and deliverables.",
                    Status = status,
                    Budget = 50000m + (i * 5000m),
                    ClientName = clients[i % clients.Length],
                    Priority = (i % 3) + 1,
                    StartDate = DateTime.UtcNow.AddDays(startOffset),
                    EndDate = DateTime.UtcNow.AddDays(startOffset + duration),
                    Tags = string.Join(",", tags.Take(3 + (i % 3))),
                    OwnerId = i % 2 == 0 ? SeedDataConstants.ManagerUserId : SeedDataConstants.EmployeeUserId
                });
            }

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
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Development data seeding completed");
    }

    /// <summary>
    /// Helper method to generate descriptive project name suffixes
    /// </summary>
    private string GetProjectNameSuffix(int index)
    {
        var suffixes = new[]
        {
            "Website Redesign", "Mobile App", "API Development", "Database Migration",
            "Cloud Migration", "Security Audit", "Performance Optimization", "UI/UX Refresh",
            "Data Analytics", "Machine Learning POC", "Infrastructure Upgrade", "DevOps Implementation",
            "E-commerce Platform", "CRM Integration", "Payment Gateway", "Reporting Dashboard",
            "Microservices Architecture", "Legacy System Modernization", "Real-time Analytics", "IoT Integration"
        };
        
        return suffixes[index % suffixes.Length];
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