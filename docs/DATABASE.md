# Database Documentation

## Database Overview
- **Type**: PostgreSQL 13+
- **ORM**: Entity Framework Core
- **Architecture**: Relational Database

## Schema Design

### Entity Relationships
```
+--------------------+       +---------------+       +--------------------+
|       User         |       |    Project    |       | PendingInvitation  |
+--------------------+       +---------------+       +--------------------+
| PK: Id             |       | PK: Id        |       | PK: Id             |
| Email              | 1   * | Name          |       | Email              |
| Name               |-------| Description   |       | Role               |
| Role               |       | StartDate     |       | InvitedBy          |
| Department         |       | EndDate       |       | InvitedAt          |
| JobTitle           |       | Status        |       | Token              |
| IsProvisioned      |       | OwnerId (FK)  |       | ExpiresAt          |
| InvitedById        |       +---------------+       +--------------------+
| ActivatedAt        |
| IsActive           |
+--------------------+
```

### Tables and Schemas

#### Users Table
```sql
CREATE TABLE "Users" (
    "Id" uuid PRIMARY KEY,
    "Email" varchar(255) NOT NULL UNIQUE,
    "Name" varchar(100),
    "ProfilePicture" text,
    "Role" varchar(50) NOT NULL DEFAULT 'Employee',
    "Department" varchar(100),
    "JobTitle" varchar(100),
    "Phone" varchar(50),
    "Location" varchar(100),
    "IsActive" boolean DEFAULT true,
    "IsProvisioned" boolean DEFAULT false,
    "InvitedById" uuid REFERENCES "Users"("Id"),
    "InvitedAt" timestamp with time zone,
    "ActivatedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone DEFAULT now(),
    "UpdatedAt" timestamp with time zone DEFAULT now()
);
```

#### PendingInvitations Table
```sql
CREATE TABLE "PendingInvitations" (
    "Id" uuid PRIMARY KEY,
    "Email" varchar(255) NOT NULL,
    "Role" varchar(50) NOT NULL,
    "InvitedBy" varchar(255),
    "InvitedAt" timestamp with time zone DEFAULT now(),
    "Token" varchar(255) NOT NULL UNIQUE,
    "ExpiresAt" timestamp with time zone NOT NULL
);
```

#### Projects Table
```sql
CREATE TABLE "Projects" (
    "Id" uuid PRIMARY KEY,
    "Name" varchar(255) NOT NULL,
    "Description" text,
    "OwnerId" uuid REFERENCES "Users"("Id"),
    "StartDate" date,
    "EndDate" date,
    "Status" varchar(50),
    "CreatedAt" timestamp with time zone DEFAULT now()
);
```

## Database Migrations

### EF Core Migration Commands
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Rollback last migration
dotnet ef database update LastGoodMigration
```

## Seed Data

### Development Seed Data
```csharp
public class DataSeeder 
{
    public async Task SeedAsync(ApplicationDbContext context) 
    {
        // Auto-create admin from ADMIN_EMAIL environment variable
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL");
        if (!string.IsNullOrEmpty(adminEmail))
        {
            var adminUser = new User 
            { 
                Id = Guid.NewGuid(),
                Email = adminEmail,
                Name = "System Administrator",
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
        }

        // Seed sample projects if needed
        if (!context.Projects.Any())
        {
            // Add sample projects
        }

        await context.SaveChangesAsync();
    }
}
```

## Indexing Strategy

### Performance Indexes
```sql
-- User email lookup
CREATE INDEX idx_users_email ON "Users" ("Email");

-- User role filtering
CREATE INDEX idx_users_role ON "Users" ("Role");

-- Active users filtering
CREATE INDEX idx_users_active ON "Users" ("IsActive");

-- Project status filtering
CREATE INDEX idx_projects_status ON "Projects" ("Status");

-- Pending invitations by email
CREATE INDEX idx_invitations_email ON "PendingInvitations" ("Email");

-- Pending invitations expiry
CREATE INDEX idx_invitations_expiry ON "PendingInvitations" ("ExpiresAt");
```

## Backup & Recovery

### Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DB_NAME="intranet"

pg_dump -Fc $DB_NAME > $BACKUP_DIR/$(date +%Y%m%d)_$DB_NAME.dump
```

### Point-in-Time Recovery
- Full daily backups
- Transaction log archiving
- 30-day retention policy

## Connection Pooling

### Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=IntranetDb;Username=devuser;Password=devpassword;Maximum Pool Size=100"
  }
}
```

## Data Protection

### Encryption
- Column-level encryption
- Transparent Data Encryption (TDE)
- Encryption at rest

## Monitoring

### Performance Metrics
- Query execution time
- Connection pool usage
- Index usage
- Disk I/O

## Best Practices
- Normalize database design
- Use appropriate data types
- Implement database constraints
- Regular index maintenance
- Monitor slow queries

## Security Considerations
- Least privilege principle
- Row-level security
- Audit logging
- Regular security patches

## Scaling Considerations
- Read replicas
- Horizontal partitioning
- Caching strategies

## Compliance
- GDPR data handling
- Secure data deletion
- Comprehensive logging

## Tools & Utilities
- pgAdmin
- DataGrip
- Postgres.app
- DBeaver

## Emergency Procedures
- Restore from last backup
- Failover to replica
- Incident reporting