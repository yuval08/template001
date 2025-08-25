# System Architecture

## Overview

This intranet template follows **Clean Architecture** principles with clear separation of concerns and dependency inversion.

## Architecture Layers

```
┌─────────────────────────────────┐
│         Frontend (React)        │
│     Components, Pages, State    │
└─────────────┬───────────────────┘
              │ HTTP/SignalR
┌─────────────┴───────────────────┐
│         API Layer (.NET)        │
│    Controllers, Middleware      │
├─────────────────────────────────┤
│      Application Layer          │
│   CQRS Commands/Queries         │
├─────────────────────────────────┤
│        Domain Layer             │
│   Entities, Value Objects       │
├─────────────────────────────────┤
│     Infrastructure Layer        │
│  Database, Email, External APIs │
└─────────────────────────────────┘
```

### 1. Frontend Layer (React + TypeScript)
- **Location**: `frontend/src/`
- **Responsibility**: User interface, state management, routing
- **Key Technologies**: React 18, TypeScript, Tailwind CSS, Zustand
- **Structure**:
  - `components/` - Reusable UI components
  - `pages/` - Route-level components
  - `stores/` - Global state management
  - `hooks/` - Custom React hooks and API integration

### 2. API Layer (.NET 9)
- **Location**: `backend/Api/`
- **Responsibility**: HTTP endpoints, authentication, request/response handling
- **Key Features**: 
  - RESTful API design
  - JWT authentication with OAuth2
  - Role-based authorization
  - Swagger documentation
  - SignalR hubs for real-time features

### 3. Application Layer
- **Location**: `backend/Application/`
- **Responsibility**: Business logic orchestration using CQRS pattern
- **Structure**:
  - `Commands/` - Write operations (Create, Update, Delete)
  - `Queries/` - Read operations (Get, List, Search)
  - `DTOs/` - Data transfer objects
  - `Interfaces/` - Service contracts

### 4. Domain Layer
- **Location**: `backend/Domain/`
- **Responsibility**: Core business entities and rules
- **Key Components**:
  - `Entities/` - Business objects (User, Project, etc.)
  - `ValueObjects/` - Immutable domain concepts
  - `Events/` - Domain events for decoupling

### 5. Infrastructure Layer
- **Location**: `backend/Infrastructure/`
- **Responsibility**: External integrations and data persistence
- **Services**:
  - Entity Framework Core (PostgreSQL)
  - Email services (SMTP)
  - File storage
  - Background jobs (Hangfire)
  - Caching (Redis)

## Key Design Patterns

### CQRS (Command Query Responsibility Segregation)
Separates read and write operations for better scalability and maintainability.

**Example Command:**
```csharp
public class CreateProjectCommand : IRequest<ProjectDto>
{
    public string Name { get; set; }
    public string Description { get; set; }
}
```

**Example Query:**
```csharp
public class GetProjectsQuery : IRequest<List<ProjectDto>>
{
    public int PageSize { get; set; } = 10;
    public int PageNumber { get; set; } = 1;
}
```

### Repository Pattern
Abstracts data access logic and provides a consistent interface.

### Dependency Injection
All services are registered in the DI container, enabling loose coupling and easy testing.

## Authentication & Authorization

### OAuth2 Flow
1. User initiates login
2. Redirected to OAuth provider (Azure AD/Google)
3. Provider validates credentials
4. Returns authorization code
5. Backend exchanges code for JWT token
6. Token stored in HTTP-only cookie
7. Subsequent requests include token for authorization

### Role-Based Access Control
- **Admin**: Full system access
- **Manager**: Project and team management
- **Employee**: Limited access based on assignments

## Database Design

### Core Entities
- **Users**: Authentication and profile information
- **Projects**: Work organization and tracking
- **Files**: Document management
- **Reports**: Generated analytics and exports

### Entity Relationships
```
User ──< UserProject >── Project
  │                        │
  └── CreatedBy             └── ProjectFiles ──> File
```

## Real-Time Features (SignalR)

### Notification System
- Real-time updates for project changes
- User online/offline status
- Progress notifications for long-running operations

### Hub Architecture
```csharp
public class NotificationHub : Hub
{
    // Real-time communication logic
}
```

## Technology Stack Rationale

### Backend: .NET 9
- **Performance**: High-throughput, low-latency
- **Type Safety**: Strong typing prevents runtime errors
- **Ecosystem**: Extensive library support
- **Cross-Platform**: Runs on Windows, Linux, macOS

### Frontend: React + TypeScript
- **Component Architecture**: Reusable, maintainable UI
- **Type Safety**: Catches errors at compile time  
- **Developer Experience**: Excellent tooling and debugging
- **Community**: Large ecosystem and community support

### Database: PostgreSQL
- **ACID Compliance**: Data consistency guarantees
- **JSON Support**: Flexible schema when needed
- **Performance**: Advanced indexing and query optimization
- **Open Source**: No licensing costs

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: API can be scaled across multiple instances
- **Database Separation**: Read replicas for query scaling
- **Caching**: Redis for performance optimization
- **Container Ready**: Docker for orchestration

### Performance Optimizations
- **Database Indexing**: Optimized queries
- **Response Caching**: Reduced server load
- **Asset Compression**: Smaller frontend bundles
- **Lazy Loading**: Load components on demand

## Security Architecture

### Defense in Depth
1. **Authentication**: OAuth2 with reputable providers
2. **Authorization**: Role-based access control
3. **Data Protection**: Encryption at rest and in transit
4. **Input Validation**: Server-side validation for all inputs
5. **CORS**: Restricted cross-origin requests

### Security Best Practices
- JWT tokens in HTTP-only cookies
- SQL injection prevention via EF Core
- XSS protection via Content Security Policy
- Regular dependency updates for vulnerabilities

## Development Workflow

### Local Development
1. Use setup scripts for consistent environment
2. Hot reload for rapid iteration
3. Database migrations for schema changes
4. Automated tests for quality assurance

### Code Organization
- **Feature-based**: Related files grouped together
- **Separation of Concerns**: Clear layer boundaries
- **Interface Segregation**: Small, focused interfaces
- **Single Responsibility**: Classes with single purpose

This architecture provides a solid foundation for building scalable, maintainable intranet applications while following industry best practices.