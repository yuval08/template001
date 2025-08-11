using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Infrastructure.Data;

/// <summary>
/// Deterministic seed data constants to ensure stable migrations and consistent test data
/// </summary>
public static class SeedDataConstants
{
    // Fixed timestamp for all seed data to ensure deterministic migrations
    public static readonly DateTime SeedTimestamp = new(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
    
    // User IDs - Fixed GUIDs for consistent relationships
    public static readonly Guid AdminUserId    = new("11111111-1111-1111-1111-111111111111");
    public static readonly Guid ManagerUserId  = new("22222222-2222-2222-2222-222222222222");
    public static readonly Guid EmployeeUserId = new("33333333-3333-3333-3333-333333333333");
    
    // Project IDs - Fixed GUIDs for consistent relationships
    public static readonly Guid IntranetProjectId       = new("44444444-4444-4444-4444-444444444444");
    public static readonly Guid CustomerPortalProjectId = new("55555555-5555-5555-5555-555555555555");
    
    /// <summary>
    /// Gets the deterministic seed users for migration purposes
    /// </summary>
    public static IEnumerable<User> GetSeedUsers()
    {
        return [
            new User
            {
                Id = AdminUserId,
                Email = "admin@company.com",
                FirstName = "System",
                LastName = "Administrator",
                Role = "Admin",
                Department = "IT",
                JobTitle = "System Administrator",
                IsActive = true,
                CreatedAt = SeedTimestamp
            },
            new User
            {
                Id = ManagerUserId,
                Email = "manager@company.com",
                FirstName = "Project",
                LastName = "Manager",
                Role = "Manager",
                Department = "Operations",
                JobTitle = "Project Manager",
                IsActive = true,
                CreatedAt = SeedTimestamp
            },
            new User
            {
                Id = EmployeeUserId,
                Email = "employee@company.com",
                FirstName = "John",
                LastName = "Employee",
                Role = "Employee",
                Department = "Development",
                JobTitle = "Software Developer",
                IsActive = true,
                CreatedAt = SeedTimestamp
            }
        ];
    }
    
    /// <summary>
    /// Gets the deterministic seed projects for migration purposes
    /// </summary>
    public static IEnumerable<Project> GetSeedProjects()
    {
        return [
            new Project
            {
                Id = IntranetProjectId,
                Name = "Company Intranet",
                Description = "Internal company portal for employee management and project tracking",
                Status = ProjectStatus.InProgress,
                Budget = 50000m,
                ClientName = "Internal",
                Priority = 1,
                OwnerId = ManagerUserId,
                StartDate = SeedTimestamp.AddDays(-30),
                EndDate = SeedTimestamp.AddDays(60),
                Tags = "internal,portal,management",
                CreatedAt = SeedTimestamp
            },
            new Project
            {
                Id = CustomerPortalProjectId,
                Name = "Customer Portal",
                Description = "External customer-facing portal for service management",
                Status = ProjectStatus.Planning,
                Budget = 75000m,
                ClientName = "Acme Corp",
                Priority = 2,
                OwnerId = ManagerUserId,
                StartDate = SeedTimestamp.AddDays(14),
                EndDate = SeedTimestamp.AddDays(120),
                Tags = "external,customer,portal",
                CreatedAt = SeedTimestamp
            }
        ];
    }
}