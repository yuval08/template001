using IntranetStarter.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace IntranetStarter.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public new DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.JobTitle).HasMaxLength(100);
            entity.Property(e => e.Avatar).HasMaxLength(500);
            
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Configure Project entity
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.ClientName).HasMaxLength(200);
            entity.Property(e => e.Tags).HasMaxLength(500);
            entity.Property(e => e.Budget).HasColumnType("decimal(18,2)");

            // Configure relationships
            entity.HasOne(e => e.Owner)
                  .WithMany(u => u.Projects)
                  .HasForeignKey(e => e.OwnerId)
                  .OnDelete(DeleteBehavior.SetNull);

            // Many-to-many relationship between Projects and Users (TeamMembers)
            entity.HasMany(p => p.TeamMembers)
                  .WithMany()
                  .UsingEntity<Dictionary<string, object>>(
                      "ProjectUser",
                      j => j.HasOne<User>().WithMany().HasForeignKey("UserId"),
                      j => j.HasOne<Project>().WithMany().HasForeignKey("ProjectId"));
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var adminUserId = Guid.NewGuid();
        var managerUserId = Guid.NewGuid();
        var employeeUserId = Guid.NewGuid();

        // Seed Users
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminUserId,
                Email = "admin@company.com",
                FirstName = "System",
                LastName = "Administrator",
                Role = "Admin",
                Department = "IT",
                JobTitle = "System Administrator",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = managerUserId,
                Email = "manager@company.com",
                FirstName = "Project",
                LastName = "Manager",
                Role = "Manager",
                Department = "Operations",
                JobTitle = "Project Manager",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = employeeUserId,
                Email = "employee@company.com",
                FirstName = "John",
                LastName = "Employee",
                Role = "Employee",
                Department = "Development",
                JobTitle = "Software Developer",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );

        // Seed Projects
        var projectId1 = Guid.NewGuid();
        var projectId2 = Guid.NewGuid();

        modelBuilder.Entity<Project>().HasData(
            new Project
            {
                Id = projectId1,
                Name = "Company Intranet",
                Description = "Internal company portal for employee management and project tracking",
                Status = Domain.Entities.ProjectStatus.InProgress,
                Budget = 50000m,
                ClientName = "Internal",
                Priority = 1,
                OwnerId = managerUserId,
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow.AddDays(60),
                Tags = "internal,portal,management",
                CreatedAt = DateTime.UtcNow
            },
            new Project
            {
                Id = projectId2,
                Name = "Customer Portal",
                Description = "External customer-facing portal for service management",
                Status = Domain.Entities.ProjectStatus.Planning,
                Budget = 75000m,
                ClientName = "Acme Corp",
                Priority = 2,
                OwnerId = managerUserId,
                StartDate = DateTime.UtcNow.AddDays(14),
                EndDate = DateTime.UtcNow.AddDays(120),
                Tags = "external,customer,portal",
                CreatedAt = DateTime.UtcNow
            }
        );
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity && e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            var entity = (Domain.Common.BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}