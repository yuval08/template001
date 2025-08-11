# Project Structure

This backend follows Clean Architecture principles with a specific folder structure. **IMPORTANT**: Follow this structure exactly when adding new features.

## Layer Organization

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

## Existing Entities

The project includes the following domain entities:
- **User** - System users with authentication and roles (Admin, Manager, Employee)
- **Project** - Business projects/items that users work with
- **Notification** - User notifications with read/unread status
- **PendingInvitation** - User invitations waiting to be accepted

## CQRS Pattern

This project uses MediatR for CQRS:
- **Commands**: For operations that modify state (Create, Update, Delete)
- **Queries**: For operations that read state (Get, List, Search)
- **Always** create corresponding validators
- **Always** use record types for commands/queries

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

**Note:** This project uses a generic repository pattern with Unit of Work.
- Core interfaces (`IRepository<T>`, `IUnitOfWork`) are in `/Domain/Interfaces/`
- No need to create specific repository interfaces for each entity
- Access entities through `unitOfWork.Repository<YourEntity>()`

## Testing

- Unit tests go in `/Tests.Unit/`
- Integration tests go in `/Tests.Integration/`
- Follow existing test patterns and naming conventions