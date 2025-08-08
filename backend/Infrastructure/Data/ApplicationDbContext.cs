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
    public DbSet<PendingInvitation> PendingInvitations { get; set; }

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

            // Configure self-referencing relationship for InvitedBy
            entity.HasOne(e => e.InvitedBy)
                  .WithMany()
                  .HasForeignKey(e => e.InvitedById)
                  .OnDelete(DeleteBehavior.SetNull);
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

        // Configure PendingInvitation entity
        modelBuilder.Entity<PendingInvitation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.IntendedRole).IsRequired().HasMaxLength(50);
            entity.Property(e => e.InvitedAt).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();

            entity.HasIndex(e => new { e.Email, e.IsUsed });

            // Configure relationship with User who sent the invitation
            entity.HasOne(e => e.InvitedBy)
                  .WithMany()
                  .HasForeignKey(e => e.InvitedById)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Users with deterministic data to prevent migration warnings
        modelBuilder.Entity<User>().HasData(SeedDataConstants.GetSeedUsers());

        // Seed Projects with deterministic data to prevent migration warnings
        modelBuilder.Entity<Project>().HasData(SeedDataConstants.GetSeedProjects());
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