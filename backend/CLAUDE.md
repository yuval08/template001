# Backend Development Guidelines

## Project Structure

This backend follows Clean Architecture principles with a specific folder structure. **IMPORTANT**: Follow this structure exactly when adding new features.

### Layer Organization

```
backend/
├── Domain/           # Core business logic (no dependencies)
├── Application/      # Use cases and business rules
├── Infrastructure/   # External concerns (DB, Email, etc.)
├── Api/             # Web API layer
└── Tests/           # Unit and Integration tests
```

## Adding New Features - STRICT CONVENTIONS

### 1. Domain Layer (`/Domain/`)

**Entities** go in `/Domain/Entities/`:
```csharp
// File: /Domain/Entities/YourEntity.cs
namespace IntranetStarter.Domain.Entities;

public class YourEntity : BaseEntity {
    // Properties
}
```

**Enums** go in `/Domain/Entities/` (same file as entity or separate):
```csharp
public enum YourEnumType {
    Value1,
    Value2
}
```

### 2. Application Layer (`/Application/`)

#### Commands - FLAT STRUCTURE
**Commands** go directly in `/Application/Commands/`:
```csharp
// File: /Application/Commands/CreateYourEntityCommand.cs
namespace IntranetStarter.Application.Commands; // NOT nested in feature folders!

public record CreateYourEntityCommand(...) : IRequest<ReturnType>;

public class CreateYourEntityCommandHandler : IRequestHandler<CreateYourEntityCommand, ReturnType> {
    // Implementation
}
```

**Command Validators** go in `/Application/Commands/Validators/`:
```csharp
// File: /Application/Commands/Validators/CreateYourEntityCommandValidator.cs
namespace IntranetStarter.Application.Commands.Validators;

public class CreateYourEntityCommandValidator : AbstractValidator<CreateYourEntityCommand> {
    // Validation rules
}
```

#### Queries - FLAT STRUCTURE
**Queries** go directly in `/Application/Queries/`:
```csharp
// File: /Application/Queries/GetYourEntityQuery.cs
namespace IntranetStarter.Application.Queries; // NOT nested in feature folders!

public record GetYourEntityQuery(...) : IRequest<ReturnType>;

public class GetYourEntityQueryHandler : IRequestHandler<GetYourEntityQuery, ReturnType> {
    // Implementation
}
```

**Query Validators** go in `/Application/Queries/Validators/`:
```csharp
// File: /Application/Queries/Validators/GetYourEntityQueryValidator.cs
namespace IntranetStarter.Application.Queries.Validators;

public class GetYourEntityQueryValidator : AbstractValidator<GetYourEntityQuery> {
    // Validation rules
}
```

#### Interfaces
**Repository Interfaces** go in `/Application/Interfaces/`:
```csharp
// File: /Application/Interfaces/IYourRepository.cs
namespace IntranetStarter.Application.Interfaces;

public interface IYourRepository {
    // Methods
}
```

#### DTOs
**DTOs** go in `/Application/DTOs/`:
```csharp
// File: /Application/DTOs/YourEntityDto.cs
namespace IntranetStarter.Application.DTOs;

public record YourEntityDto(...);
```

### 3. Infrastructure Layer (`/Infrastructure/`)

**Repositories** go in `/Infrastructure/Repositories/`:
```csharp
// File: /Infrastructure/Repositories/YourRepository.cs
namespace IntranetStarter.Infrastructure.Repositories;

public class YourRepository : IYourRepository {
    // Implementation
}
```

**Services** go in `/Infrastructure/Services/`:
```csharp
// File: /Infrastructure/Services/YourService.cs
namespace IntranetStarter.Infrastructure.Services;

public class YourService : IYourService {
    // Implementation
}
```

### 4. API Layer (`/Api/`)

**Controllers** go in `/Api/Controllers/`:
```csharp
// File: /Api/Controllers/YourController.cs
namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class YourController : ControllerBase {
    // Endpoints
}
```

## Database Changes

### Adding New Entities

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

## Dependency Injection

Register services in `/Infrastructure/DependencyInjection.cs`:
```csharp
services.AddScoped<IYourRepository, YourRepository>();
services.AddScoped<IYourService, YourService>();
```

## Validation Pattern

Always create validators using FluentValidation:
- Use `ValidationErrorCodes` for error codes
- Use `WithCode()` and `WithMessage()` for all rules
- Common validations:
  ```csharp
  RuleFor(x => x.Id)
      .NotEqual(Guid.Empty)
      .WithCode(ValidationErrorCodes.Required);
  
  RuleFor(x => x.Name)
      .NotEmpty()
      .WithCode(ValidationErrorCodes.Required)
      .MaximumLength(200)
      .WithCode(ValidationErrorCodes.InvalidLength);
  ```

## CQRS Pattern

This project uses MediatR for CQRS:
- **Commands**: For operations that modify state (Create, Update, Delete)
- **Queries**: For operations that read state (Get, List, Search)
- **Always** create corresponding validators
- **Always** use record types for commands/queries

## Authentication & Getting Current User

The application uses cookie-based OAuth authentication. To get the current authenticated user in controllers:

```csharp
// IMPORTANT: User ID is NOT directly available in claims
// You must look up the user by email from the database

private async Task<Guid?> GetUserIdAsync() {
    // Get user email from claims
    string? email = User.FindFirst(ClaimTypes.Email)?.Value;
    
    if (string.IsNullOrEmpty(email)) {
        logger.LogWarning("User authenticated but email claim is missing");
        return null;
    }
    
    // Look up user in database by email to get their ID
    var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
    
    if (user == null) {
        logger.LogWarning("User {Email} authenticated but not found in database", email);
        return null;
    }
    
    return user.Id;
}
```

**Available Claims:**
- `ClaimTypes.Email` - User's email address (always available)
- `ClaimTypes.Name` - User's display name
- `ClaimTypes.Role` - User's role (Admin, Manager, Employee)

**Getting User Information:**
```csharp
// Get email directly from claims
string? email = User.FindFirst(ClaimTypes.Email)?.Value;

// Get role from claims
string? role = User.FindFirst(ClaimTypes.Role)?.Value;
bool isAdmin = User.IsInRole("Admin");

// For user ID, always look up from database using email
var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
Guid userId = user.Id;
```

## Common Mistakes to Avoid

❌ **DON'T** create nested folders like `/Application/Features/[Feature]/Commands/`
✅ **DO** use flat structure: `/Application/Commands/`

❌ **DON'T** put commands and queries in feature folders
✅ **DO** put them directly in `/Application/Commands/` and `/Application/Queries/`

❌ **DON'T** forget validators
✅ **DO** create validators for every command and query

❌ **DON'T** use different namespace patterns
✅ **DO** follow exact namespace conventions shown above

❌ **DON'T** try to get user ID from claims (ClaimTypes.NameIdentifier, "sub", "id")
✅ **DO** get user email from claims and look up the user in the database

## Testing

- Unit tests go in `/Tests.Unit/`
- Integration tests go in `/Tests.Integration/`
- Follow existing test patterns and naming conventions

## Example: Adding a "Notification" Feature

1. **Domain**: `/Domain/Entities/Notification.cs`
2. **Interface**: `/Application/Interfaces/INotificationRepository.cs`
3. **Commands**: 
   - `/Application/Commands/CreateNotificationCommand.cs`
   - `/Application/Commands/DeleteNotificationCommand.cs`
4. **Command Validators**:
   - `/Application/Commands/Validators/CreateNotificationCommandValidator.cs`
   - `/Application/Commands/Validators/DeleteNotificationCommandValidator.cs`
5. **Queries**:
   - `/Application/Queries/GetNotificationsQuery.cs`
6. **Query Validators**:
   - `/Application/Queries/Validators/GetNotificationsQueryValidator.cs`
7. **Repository**: `/Infrastructure/Repositories/NotificationRepository.cs`
8. **Controller**: `/Api/Controllers/NotificationsController.cs`
9. **DbContext**: Update `ApplicationDbContext` with DbSet and configuration
10. **DI**: Register in `DependencyInjection.cs`
11. **Migration**: Create and apply EF migration

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