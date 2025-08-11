# Backend Development Guidelines

## Project Structure

This backend follows Clean Architecture principles with a specific folder structure. **IMPORTANT**: Follow this structure exactly when adding new features.

### Layer Organization

```
backend/
├── Domain/           # Core business logic (no dependencies)
│   ├── Common/       # Base entities and shared domain code
│   ├── Entities/     # Domain entities
│   └── Interfaces/   # Core interfaces (IRepository, IUnitOfWork)
├── Application/      # Use cases and business rules
│   ├── Features/     # Feature-based organization
│   │   ├── Users/    # User feature
│   │   │   ├── Commands/    # User commands
│   │   │   ├── Queries/     # User queries
│   │   │   ├── DTOs/        # User DTOs
│   │   │   └── Validators/  # User validators
│   │   ├── Projects/ # Project feature
│   │   │   ├── Commands/    # Project commands
│   │   │   ├── Queries/     # Project queries
│   │   │   ├── DTOs/        # Project DTOs
│   │   │   └── Validators/  # Project validators
│   │   └── Notifications/ # Notification feature
│   │       ├── Commands/    # Notification commands
│   │       ├── Queries/     # Notification queries
│   │       ├── DTOs/        # Notification DTOs
│   │       └── Validators/  # Notification validators
│   ├── Common/       # Shared application code
│   │   ├── Behaviors/       # MediatR behaviors
│   │   ├── Exceptions/      # Custom exceptions
│   │   └── Validation/      # Shared validation logic
│   └── Interfaces/   # Application service interfaces
├── Infrastructure/   # External concerns (DB, Email, etc.)
│   ├── Data/         # DbContext, Repository, UnitOfWork
│   ├── Migrations/   # EF Core migrations
│   └── Services/     # Service implementations
├── Api/             # Web API layer
│   ├── Controllers/  # API controllers
│   └── Hubs/        # SignalR hubs
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

#### Feature-Based Organization
All application logic is organized by feature. Each feature has its own folder containing commands, queries, DTOs, and validators.

#### Commands
**Commands** go in feature-specific folders:
```csharp
// File: /Application/Features/YourFeature/Commands/CreateYourEntityCommand.cs
namespace IntranetStarter.Application.Features.YourFeature.Commands;

public record CreateYourEntityCommand(...) : IRequest<ReturnType>;

public class CreateYourEntityCommandHandler : IRequestHandler<CreateYourEntityCommand, ReturnType> {
    // Implementation
}
```

#### Queries
**Queries** go in feature-specific folders:
```csharp
// File: /Application/Features/YourFeature/Queries/GetYourEntityQuery.cs
namespace IntranetStarter.Application.Features.YourFeature.Queries;

public record GetYourEntityQuery(...) : IRequest<ReturnType>;

public class GetYourEntityQueryHandler : IRequestHandler<GetYourEntityQuery, ReturnType> {
    // Implementation
}
```

#### Validators
**Validators** go in feature-specific Validators folders:
```csharp
// File: /Application/Features/YourFeature/Validators/CreateYourEntityCommandValidator.cs
namespace IntranetStarter.Application.Features.YourFeature.Validators;

public class CreateYourEntityCommandValidator : AbstractValidator<CreateYourEntityCommand> {
    // Validation rules
}
```

#### DTOs
**DTOs** go in feature-specific DTOs folders:
```csharp
// File: /Application/Features/YourFeature/DTOs/YourEntityDto.cs
namespace IntranetStarter.Application.Features.YourFeature.DTOs;

public record YourEntityDto(...);
```

#### Service Interfaces
**Service Interfaces** go in `/Application/Interfaces/`, each in its own file:
```csharp
// File: /Application/Interfaces/IYourService.cs
namespace IntranetStarter.Application.Interfaces;

public interface IYourService {
    // Methods
}
```

**Important**: Each interface should be in its own file:
- `/Application/Interfaces/INotificationService.cs`
- `/Application/Interfaces/IEmailService.cs`
- `/Application/Interfaces/IPdfService.cs`
- etc.

**Note:** This project uses a generic repository pattern with Unit of Work.
- Core interfaces (`IRepository<T>`, `IUnitOfWork`) are in `/Domain/Interfaces/`
- No need to create specific repository interfaces for each entity
- Access entities through `unitOfWork.Repository<YourEntity>()`

### 3. Infrastructure Layer (`/Infrastructure/`)

**Generic Repository Implementation** is in `/Infrastructure/Data/`:
```csharp
// The generic Repository<T> and UnitOfWork are already implemented
// Access entities through dependency injection of IUnitOfWork:
public class YourCommandHandler(IUnitOfWork unitOfWork) {
    public async Task Handle(...) {
        var repository = unitOfWork.Repository<YourEntity>();
        var entity = await repository.GetByIdAsync(id);
        // ... work with entity
        await unitOfWork.SaveChangesAsync();
    }
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

## Existing Entities

The project includes the following domain entities:
- **User** - System users with authentication and roles (Admin, Manager, Employee)
- **Project** - Business projects/items that users work with
- **Notification** - User notifications with read/unread status
- **PendingInvitation** - User invitations waiting to be accepted

## Dependency Injection

Register services in `/Infrastructure/DependencyInjection.cs`:
```csharp
// Services are registered automatically through DI configuration
services.AddScoped<IUnitOfWork, UnitOfWork>();
services.AddScoped<INotificationService, NotificationService>();
services.AddScoped<IEmailService, EmailService>();
services.AddScoped<IPdfService, PdfService>();
services.AddScoped<IYourService, YourService>();
```

**Note**: Service interfaces are defined in `/Application/Interfaces/` and their implementations in `/Infrastructure/Services/`

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

## Best Practices & Common Mistakes to Avoid

✅ **DO** organize code by features in `/Application/Features/[Feature]/`
❌ **DON'T** use flat structure with all commands/queries in one folder

✅ **DO** keep related commands, queries, DTOs, and validators together by feature
❌ **DON'T** scatter related files across different folders

✅ **DO** put each service interface in its own file in `/Application/Interfaces/`
❌ **DON'T** put multiple interfaces in a single file

✅ **DO** create validators for every command and query
❌ **DON'T** skip validation even for simple operations

✅ **DO** follow namespace conventions: `IntranetStarter.Application.Features.[Feature].[Type]` and `IntranetStarter.Application.Interfaces`
❌ **DON'T** use inconsistent namespace patterns

✅ **DO** get user email from claims and look up the user in the database
❌ **DON'T** try to get user ID from claims (ClaimTypes.NameIdentifier, "sub", "id")

✅ **DO** use the generic repository pattern through IUnitOfWork
❌ **DON'T** create specific repository interfaces for each entity

## Testing

- Unit tests go in `/Tests.Unit/`
- Integration tests go in `/Tests.Integration/`
- Follow existing test patterns and naming conventions

## SignalR Real-time Notifications

The application uses SignalR for real-time communication:

### NotificationHub (`/Api/Hubs/NotificationHub.cs`)
- Handles real-time connections
- Manages user/role/project groups
- Methods: `JoinUserGroup`, `LeaveUserGroup`, `JoinProjectGroup`, `SendToAll`, etc.

### NotificationService (`/Infrastructure/Services/NotificationService.cs`)
- Sends notifications via SignalR
- Persists notifications to database
- Integrates with MediatR commands

### Sending Notifications
```csharp
// Inject INotificationService
public class YourService(INotificationService notificationService) {
    public async Task NotifyUser(string userId, string message) {
        await notificationService.SendNotificationAsync(
            userId, 
            message, 
            NotificationType.Info
        );
    }
}
```

## Repository Pattern with Unit of Work

This project uses a generic repository pattern:

```csharp
// In command/query handlers, inject IUnitOfWork
public class YourCommandHandler(IUnitOfWork unitOfWork) {
    public async Task<Result> Handle(Command request, CancellationToken ct) {
        // Get repository for any entity
        var repository = unitOfWork.Repository<YourEntity>();
        
        // Use repository methods
        var entity = await repository.GetByIdAsync(id, ct);
        var all = await repository.GetAllAsync(ct);
        var filtered = await repository.FindAsync(e => e.IsActive, ct);
        
        // Add/Update/Delete
        await repository.AddAsync(newEntity, ct);
        await repository.UpdateAsync(entity, ct);
        await repository.DeleteAsync(entity, ct);
        
        // Save all changes
        await unitOfWork.SaveChangesAsync(ct);
    }
}
```

## Example: Adding a New Feature (e.g., "Tasks")

1. **Domain Entity**: `/Domain/Entities/Task.cs`
2. **Feature Folder Structure**:
   ```
   /Application/Features/Tasks/
   ├── Commands/
   │   ├── CreateTaskCommand.cs
   │   ├── UpdateTaskCommand.cs
   │   └── DeleteTaskCommand.cs
   ├── Queries/
   │   ├── GetTasksQuery.cs
   │   └── GetTaskByIdQuery.cs
   ├── Validators/
   │   ├── CreateTaskCommandValidator.cs
   │   ├── UpdateTaskCommandValidator.cs
   │   └── GetTasksQueryValidator.cs
   └── DTOs/
       ├── TaskDto.cs
       └── CreateTaskDto.cs
   ```
3. **Service Interface (if needed)**: `/Application/Interfaces/ITaskService.cs`
4. **Service Implementation (if needed)**: `/Infrastructure/Services/TaskService.cs`
5. **Controller**: `/Api/Controllers/TasksController.cs`
6. **DbContext**: Add `DbSet<Task> Tasks` to `ApplicationDbContext`
7. **Migration**: `dotnet ef migrations add AddTaskEntity -p Infrastructure -c ApplicationDbContext -s Api`
8. **DI**: Register services in `DependencyInjection.cs`

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