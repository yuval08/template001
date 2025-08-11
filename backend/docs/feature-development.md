# Feature Development Guidelines

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

✅ **DO** use the generic repository pattern through IUnitOfWork
❌ **DON'T** create specific repository interfaces for each entity