# Backend Development Guidelines

## Quick Reference

This backend follows Clean Architecture principles. For detailed information, see the documentation in the `./docs/` folder:

- **[Project Structure](./docs/project-structure.md)** - Architecture layers and organization
- **[Feature Development](./docs/feature-development.md)** - Adding new features following CQRS pattern
- **[Database Management](./docs/database.md)** - Entity creation and migrations
- **[Authentication](./docs/authentication.md)** - OAuth setup and user management
- **[SignalR & Real-time](./docs/signalr-realtime.md)** - Real-time notifications and background jobs
- **[Email Templates](./docs/email-templates.md)** - HTML email templates and configuration

## Essential Commands

```bash
# Build and run
dotnet build
dotnet run --project Api

# Database migrations
dotnet ef migrations add YourMigrationName -p Infrastructure -c ApplicationDbContext -s Api
dotnet ef database update -p Infrastructure -c ApplicationDbContext -s Api

# Tests
dotnet test
```

## Key Patterns

- **CQRS**: Commands for writes, Queries for reads using MediatR
- **Feature-based organization**: `/Application/Features/[Feature]/`
- **Generic Repository**: Access via `unitOfWork.Repository<YourEntity>()`
- **Validation**: Always create FluentValidation validators
- **Authentication**: Get user email from claims, lookup user ID in database

## Quick Start for New Features

1. Create entity in `/Domain/Entities/`
2. Add feature folder structure in `/Application/Features/YourFeature/`
3. Create Commands, Queries, DTOs, and Validators
4. Add controller in `/Api/Controllers/`
5. Update DbContext and create migration
6. Register services in DI