using IntranetStarter.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Xunit;

namespace IntranetStarter.Tests.Integration;

public class TestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly CustomWebApplicationFactory Factory;
    protected readonly HttpClient Client;

    protected TestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected async Task<ApplicationDbContext> GetDbContextAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();
        return context;
    }

    protected async Task SeedTestDataAsync(ApplicationDbContext context)
    {
        // Clear existing data
        context.Projects.RemoveRange(context.Projects);
        context.Users.RemoveRange(context.Users);
        await context.SaveChangesAsync();

        // Seed test users
        var admin = new Domain.Entities.User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = "admin@test.com",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin",
            Department = "IT",
            IsActive = true
        };

        var manager = new Domain.Entities.User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Email = "manager@test.com",
            FirstName = "Manager",
            LastName = "User",
            Role = "Manager",
            Department = "Operations",
            IsActive = true
        };

        var employee = new Domain.Entities.User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Email = "employee@test.com",
            FirstName = "Employee",
            LastName = "User",
            Role = "Employee",
            Department = "Development",
            IsActive = true
        };

        context.Users.AddRange(admin, manager, employee);

        // Seed test projects
        var project1 = new Domain.Entities.Project
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "Test Project 1",
            Description = "First test project",
            Status = Domain.Entities.ProjectStatus.InProgress,
            Budget = 50000m,
            Priority = 1,
            Owner = manager,
            TeamMembers = new List<Domain.Entities.User> { employee }
        };

        var project2 = new Domain.Entities.Project
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            Name = "Test Project 2",
            Description = "Second test project",
            Status = Domain.Entities.ProjectStatus.Planning,
            Budget = 30000m,
            Priority = 2,
            Owner = manager
        };

        context.Projects.AddRange(project1, project2);
        await context.SaveChangesAsync();
    }
}

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        
        builder.ConfigureServices(services =>
        {
            // Remove the existing DbContext registration
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Add in-memory database for testing
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase($"InMemoryDbForTesting_{Guid.NewGuid()}");
                options.EnableSensitiveDataLogging();
            });

            // Suppress certain log categories to reduce test output noise
            services.AddLogging(builder =>
            {
                builder.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
                builder.AddFilter("Microsoft.AspNetCore", LogLevel.Warning);
                builder.AddFilter("System.Net.Http.HttpClient", LogLevel.Warning);
            });

            // Override services for testing if needed
            // For example, you might want to mock external services
        });

        builder.UseContentRoot(Directory.GetCurrentDirectory());
    }

    public HttpClient CreateAuthenticatedClient(string role = "Employee", string userId = "33333333-3333-3333-3333-333333333333")
    {
        var client = CreateClient();

        // In a real implementation, you would add proper JWT authentication
        // For testing purposes, you might use a test authentication scheme
        // Example:
        // client.DefaultRequestHeaders.Authorization = 
        //     new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", GenerateTestJwtToken(role, userId));

        return client;
    }

    private string GenerateTestJwtToken(string role, string userId)
    {
        // In a real implementation, generate a proper test JWT token
        // This is just a placeholder for the concept
        return "test-jwt-token";
    }
}

// Extension methods for testing
public static class TestExtensions
{
    public static async Task<T?> ReadAsJsonAsync<T>(this HttpContent content)
    {
        var json = await content.ReadAsStringAsync();
        return System.Text.Json.JsonSerializer.Deserialize<T>(json, new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    public static StringContent AsJson(this object obj)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(obj);
        return new StringContent(json, System.Text.Encoding.UTF8, "application/json");
    }
}