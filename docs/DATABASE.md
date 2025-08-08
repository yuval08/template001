# Database Documentation

## Database Overview
- **Type**: PostgreSQL 13+
- **ORM**: Entity Framework Core
- **Architecture**: Relational Database

## Schema Design

### Entity Relationships
```
+---------------+       +---------------+
|     User      |       |    Project    |
+---------------+       +---------------+
| PK: Id        |       | PK: Id        |
| Username      |       | Name          |
| Email         | 1   * | Description   |
| Roles         |-------|  StartDate    |
| Department    |       |  EndDate      |
+---------------+       +---------------+
```

### Tables and Schemas

#### Users Table
```sql
CREATE TABLE "Users" (
    "Id" uuid PRIMARY KEY,
    "Username" varchar(100) NOT NULL,
    "Email" varchar(255) NOT NULL UNIQUE,
    "PasswordHash" varchar(255),
    "Roles" text[],
    "Department" varchar(100),
    "CreatedAt" timestamp with time zone DEFAULT now(),
    "LastLogin" timestamp with time zone
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
public class DatabaseSeeder 
{
    public void SeedData(ModelBuilder modelBuilder) 
    {
        modelBuilder.Entity<User>().HasData(
            new User { 
                Id = Guid.NewGuid(), 
                Username = "admin", 
                Email = "admin@company.com" 
            }
        );
    }
}
```

## Indexing Strategy

### Performance Indexes
```sql
-- User email lookup
CREATE INDEX idx_users_email ON "Users" ("Email");

-- Project status filtering
CREATE INDEX idx_projects_status ON "Projects" ("Status");
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