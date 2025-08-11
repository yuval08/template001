# Database Management

## Adding New Entities

1. Create entity in `/Domain/Entities/`
2. Add DbSet to `ApplicationDbContext`:
   ```csharp
   public DbSet<YourEntity> YourEntities { get; set; }
   ```
3. Configure entity in `OnModelCreating`:
   ```csharp
   modelBuilder.Entity<YourEntity>(entity => {
       entity.HasKey(e => e.Id);
       // Additional configuration
   });
   ```
4. Create migration:
   ```bash
   dotnet ef migrations add YourMigrationName -p Infrastructure -c ApplicationDbContext -s Api
   ```
5. Update database:
   ```bash
   dotnet ef database update -p Infrastructure -c ApplicationDbContext -s Api
   ```

## Build Commands

```bash
# Build solution
dotnet build

# Build specific project
dotnet build Api/Api.csproj

# Run API
dotnet run --project Api

# Run tests
dotnet test
```

## Database Configuration

The application uses Code-First migrations with Entity Framework Core:
- Migrations are in `backend/Infrastructure/Migrations/`
- ApplicationDbContext is the main database context
- Automatic migration on startup in development
- Seed data includes admin user if ADMIN_EMAIL is configured

## Connection Strings

Key environment variables:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - Database connection
- Database runs on localhost:5433 (development) or localhost:5432 (production)