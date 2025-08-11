# New Feature Requirements: Adding Entities to the System

This document provides a high-level checklist and step-by-step guide for adding new business entities to the full-stack application. Use this as a comprehensive roadmap when implementing features like Customer, Order, Product, Invoice, etc.

## Overview

Adding a new entity involves coordinating changes across multiple layers of the application:
- **Backend**: Domain entities, CQRS commands/queries, API controllers, database migrations
- **Frontend**: Entity-based architecture with types, services, hooks, and components
- **Integration**: Global loading states, SignalR notifications, authentication, and testing

## Pre-Implementation Checklist

Before starting implementation, ensure you have:

- [ ] **Clear Requirements**: Entity fields, relationships, business rules, and user roles
- [ ] **Architecture Understanding**: Review [Architecture Overview](./ARCHITECTURE.md) and [Frontend Entity Development Guide](../frontend/docs/entity-development.md)
- [ ] **Database Design**: Plan entity relationships and migration strategy
- [ ] **API Design**: Define endpoints, DTOs, and validation rules
- [ ] **UI/UX Design**: Wireframes for list, detail, create/edit views
- [ ] **Permission Model**: Role-based access control requirements

---

## Backend Implementation Steps

### 1. Domain Layer (`backend/Domain/`)

#### 1.1 Create Domain Entity
**File**: `backend/Domain/Entities/YourEntity.cs`
- [ ] Create entity class extending `BaseEntity`
- [ ] Define all properties with proper types
- [ ] Add navigation properties for relationships
- [ ] Include business logic methods if needed
- [ ] Implement any domain-specific validations

**Reference**: `backend/Domain/Entities/User.cs`

#### 1.2 Update Constants (if needed)
**File**: `backend/Domain/Constants/YourEntityConstants.cs`
- [ ] Create constants for status values, types, or categories
- [ ] Define validation rules and business constraints

### 2. Application Layer (`backend/Application/`)

#### 2.1 Create DTOs
**File**: `backend/Application/Features/YourEntity/DTOs/YourEntityDto.cs`
- [ ] Create request/response DTOs
- [ ] Define paginated response DTOs
- [ ] Add validation attributes where appropriate

#### 2.2 Create Commands (CQRS)
**Directory**: `backend/Application/Features/YourEntity/Commands/`

For each command, create:
- [ ] **CreateYourEntityCommand.cs** - Command record and handler
- [ ] **UpdateYourEntityCommand.cs** - Command record and handler  
- [ ] **DeleteYourEntityCommand.cs** - Command record and handler
- [ ] **Validators/CreateYourEntityCommandValidator.cs** - FluentValidation rules
- [ ] **Validators/UpdateYourEntityCommandValidator.cs** - FluentValidation rules
- [ ] **Validators/DeleteYourEntityCommandValidator.cs** - FluentValidation rules

**Reference**: `backend/Application/Features/Users/Commands/CreateUserCommand.cs`

#### 2.3 Create Queries (CQRS)
**Directory**: `backend/Application/Features/YourEntity/Queries/`

For each query, create:
- [ ] **GetYourEntitiesQuery.cs** - List query with filtering/sorting/pagination
- [ ] **GetYourEntityByIdQuery.cs** - Single entity query
- [ ] **Validators/GetYourEntitiesQueryValidator.cs** - Query validation
- [ ] **Validators/GetYourEntityByIdQueryValidator.cs** - Query validation

**Reference**: `backend/Application/Features/Users/Queries/GetUsersQuery.cs`

#### 2.4 Create Mappers
**File**: `backend/Application/Features/YourEntity/Mappers/YourEntityMapper.cs`
- [ ] Entity to DTO mapping methods
- [ ] DTO to Entity mapping methods
- [ ] Collection mapping helpers

### 3. Infrastructure Layer (`backend/Infrastructure/`)

#### 3.1 Update Database Context
**File**: `backend/Infrastructure/Data/ApplicationDbContext.cs`
- [ ] Add `DbSet<YourEntity>` property
- [ ] Configure entity relationships in `OnModelCreating`
- [ ] Set up indexes for performance

#### 3.2 Create Database Migration
**Run**: `dotnet ef migrations add AddYourEntity -p backend/Infrastructure -s backend/Api`
- [ ] Generate migration for new entity
- [ ] Review migration script for accuracy
- [ ] Test migration on development database

#### 3.3 Update Data Seeder (optional)
**File**: `backend/Infrastructure/Data/DataSeeder.cs`
- [ ] Add seed data for your entity
- [ ] Update `SeedDataConstants.cs` if needed

### 4. API Layer (`backend/Api/`)

#### 4.1 Create Controller
**File**: `backend/Api/Controllers/YourEntityController.cs`
- [ ] Create controller with CRUD endpoints
- [ ] Add proper authorization attributes (`[Authorize("AdminOnly")]`, `[Authorize("ManagerOrAdmin")]`)
- [ ] Implement proper HTTP status codes and responses
- [ ] Add API documentation with XML comments

**Reference**: `backend/Api/Controllers/UsersController.cs`

#### 4.2 Add Background Jobs (if needed)
**File**: `backend/Infrastructure/BackgroundJobs/YourEntityJob.cs`
- [ ] Create background job classes
- [ ] Register jobs in `Program.cs`

---

## Frontend Implementation Steps

### 1. Entity Architecture (`frontend/src/entities/your-entity/`)

#### 1.1 Create Type Definitions
**File**: `frontend/src/entities/your-entity/types/your-entity.types.ts`
- [ ] Define entity interface matching backend DTO
- [ ] Create request/response type interfaces
- [ ] Add query parameters interface
- [ ] Include business logic helpers (display functions, constants)

**Reference**: `frontend/src/entities/user/types/user.types.ts`

#### 1.2 Create API Types (if different)
**File**: `frontend/src/entities/your-entity/types/your-entity-api.types.ts`
- [ ] Define API-specific types if they differ from business types
- [ ] Create paginated response types

#### 1.3 Create DTOs
**File**: `frontend/src/entities/your-entity/dtos/your-entity.dtos.ts`
- [ ] Create DTO interfaces for API communication
- [ ] Add DTO mapper functions for transforming data
- [ ] Define form-specific DTOs

#### 1.4 Create Service Class
**File**: `frontend/src/entities/your-entity/services/your-entity.service.ts`
- [ ] Extend `BaseApiService` or `CrudService`
- [ ] Implement all CRUD operations
- [ ] Add entity-specific API methods
- [ ] Configure loading states with appropriate priority levels
- [ ] Include proper TypeScript typing

**Reference**: `frontend/src/entities/user/services/user.service.ts`

**Key Points:**
- Always extend `BaseApiService` or `CrudService`
- Never use axios directly
- Use proper loading keys: `'your-entity:fetch'`, `'your-entity:create'`, etc.
- Set appropriate priority levels (`'critical'`, `'high'`, `'normal'`, `'low'`)

#### 1.5 Create React Query Hooks
**File**: `frontend/src/entities/your-entity/hooks/your-entity.hooks.ts`
- [ ] Create hooks for all CRUD operations
- [ ] Implement proper cache invalidation
- [ ] Add proper error handling with toast notifications
- [ ] Use authentication checks (`enabled: isAuthenticated`)

**Reference**: `frontend/src/entities/user/hooks/user.hooks.ts`

**Required hooks:**
- `useYourEntities(params)` - List with filtering/pagination
- `useYourEntity(id)` - Single entity
- `useCreateYourEntity()` - Create mutation
- `useUpdateYourEntity()` - Update mutation
- `useDeleteYourEntity()` - Delete mutation

#### 1.6 Create Index File
**File**: `frontend/src/entities/your-entity/index.ts`
- [ ] Export all types, services, hooks, and components
- [ ] Ensure clean barrel exports for easy importing

### 2. UI Components

#### 2.1 Use Existing Components First
Before creating custom components, leverage the established component library:
- [ ] Review **[Component Library Documentation](../frontend/docs/components.md)** for reusable components
- [ ] Use `PageLayout` for consistent page structure
- [ ] Use `DataTable` for entity lists with sorting/pagination/filtering
- [ ] Use `ResponsiveEntityView` for desktop table/mobile card switching
- [ ] Use `FormDialog` for create/edit modals
- [ ] Use `MetricCard` for dashboard statistics
- [ ] Use `SearchAndFilters` for search and filter controls

#### 2.2 Create Entity-Specific Components (if needed)
**Directory**: `frontend/src/entities/your-entity/components/`
- [ ] **YourEntityCard.tsx** - Card view for mobile/grid layouts (if standard card isn't sufficient)
- [ ] **YourEntityForm.tsx** - Entity-specific form fields (use with FormDialog)
- [ ] **YourEntityDetails.tsx** - Detail view component

### 3. Page Components (`frontend/src/pages/`)

#### 3.1 Create List Page
**File**: `frontend/src/pages/YourEntityList.tsx`
- [ ] Use `PageLayout` component for consistent structure and layout
- [ ] Implement comprehensive data table following [Data Tables Guide](../frontend/docs/data-tables.md)
- [ ] Use `DataTable` component for desktop view with sorting/pagination/filtering
- [ ] Use `ResponsiveEntityView` for automatic desktop/mobile view switching
- [ ] Use `SearchAndFilters` component for search and filter controls
- [ ] Implement proper loading and error states with skeletons
- [ ] Add create/edit/delete actions using dialogs


**Key Features:**
- Leverages established component patterns
- Debounced search (500ms delay)
- Smart pagination with auto-adjustment
- Clear filters functionality
- Responsive table/card switching
- Global loading integration

#### 3.2 Create Detail Page (if needed)
**File**: `frontend/src/pages/YourEntityDetail.tsx`
- [ ] Use `PageLayout` component for consistent structure
- [ ] Show detailed entity information in cards or sections
- [ ] Include edit/delete actions in the page actions area
- [ ] Add related entities if applicable
- [ ] Use `Card` components to organize information sections

### 4. Forms Implementation

#### 4.1 Create Forms Following Guide
Follow [Forms Guide](../frontend/docs/forms.md) and use existing components:
- [ ] Use `FormDialog` component for create/edit forms
- [ ] Create form with React Hook Form + Zod validation inside FormDialog
- [ ] Implement proper validation with real-time error display
- [ ] Add loading states during form submission
- [ ] Use consistent form field patterns from component library

### 5. State Management (if needed)

#### 5.1 Create Zustand Store (optional)
**File**: `frontend/src/stores/your-entity.store.ts`
- [ ] Create store for complex UI state
- [ ] Implement filters, selections, UI preferences
- [ ] Add persistence where appropriate

### 6. Routing Integration

#### 6.1 Update Router
**File**: `frontend/src/router.tsx`
- [ ] Add routes for list and detail pages
- [ ] Wrap in `PrivateRoute` for authentication
- [ ] Add proper role-based access control

#### 6.2 Update Navigation
**File**: `frontend/src/components/Sidebar.tsx` or navigation component
- [ ] Add navigation link to entity list
- [ ] Include proper icons and labels
- [ ] Ensure proper role-based visibility

---

## Integration & Features

### 1. Global Loading States

The system automatically integrates with the [Global Loading System](../frontend/docs/global-loading-state.md):
- [ ] Verify API services use proper loading keys
- [ ] Test loading indicators appear correctly
- [ ] Ensure loading priorities are appropriate

### 2. SignalR Real-time Updates (if applicable)

If your entity needs real-time updates:
- [ ] Add SignalR hub methods in backend
- [ ] Update frontend SignalR hooks
- [ ] Test real-time notifications

### 3. Search Integration

If your entity should be searchable via global search:
- [ ] Implement `ISearchableEntity` in backend
- [ ] Add to search configurations
- [ ] Test global search functionality

### 4. Network Status & Offline Support

The system includes [Network Status System](../frontend/docs/network-status-system.md):
- [ ] Verify offline behavior works correctly
- [ ] Test connection retry mechanisms
- [ ] Ensure proper offline indicators

---

## Testing Strategy

### 1. Backend Testing
- [ ] **Unit Tests**: Commands, queries, and business logic
- [ ] **Integration Tests**: API endpoints and database operations
- [ ] **Validation Tests**: Ensure all validation rules work correctly

### 2. Frontend Testing
- [ ] **Component Tests**: Form validation, user interactions
- [ ] **Hook Tests**: React Query hooks and error handling
- [ ] **Integration Tests**: End-to-end user workflows

### 3. Manual Testing Checklist
- [ ] **CRUD Operations**: Create, read, update, delete
- [ ] **Validation**: All validation rules work correctly
- [ ] **Permissions**: Role-based access control
- [ ] **Responsive Design**: Mobile and desktop views
- [ ] **Loading States**: All loading indicators work
- [ ] **Error Handling**: Network errors, validation errors
- [ ] **Real-time Updates**: SignalR notifications (if applicable)

---

## Deployment Checklist

### 1. Database Migration
- [ ] Test migration on staging environment
- [ ] Verify data integrity after migration
- [ ] Plan rollback strategy if needed

### 2. Feature Flags (if applicable)
- [ ] Implement feature toggles for gradual rollout
- [ ] Configure environment-specific settings

### 3. Documentation
- [ ] Update API documentation (Swagger)
- [ ] Update user documentation
- [ ] Create admin guides if needed

---

## Common Patterns & Examples

### Backend Command Example
```csharp
public record CreateCustomerCommand(CreateCustomerDto Customer) : IRequest<CustomerDto>;

public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, CustomerDto>
{
    // Implementation following User patterns
}
```

### Frontend Service Example
```typescript
export class CustomerService extends CrudService<Customer, CreateCustomerDto, UpdateCustomerDto> {
  protected readonly entityPath = '/api/customers';
  
  async getCustomers(params: CustomerQueryParams = {}): Promise<CustomersResponse> {
    return this.get<CustomersResponse>(this.entityPath, params, {
      loadingKey: 'customers:fetch',
      priority: 'normal',
      trackLoading: true
    });
  }
}
```

### Frontend Hook Example
```typescript
export const useCustomers = (params: CustomerQueryParams = {}) => {
  return useQuery({
    queryKey: customerQueryKeys.customersList(params),
    queryFn: () => customerService.getCustomers(params),
    placeholderData: (previousData) => previousData,
  });
};
```

---

## Reference Documentation

For detailed implementation guides, refer to:

**Frontend Documentation:**
- **[Component Library Documentation](../frontend/docs/components.md)** - Complete component reference and usage guide
- **[Entity Development Guide](../frontend/docs/entity-development.md)** - Detailed frontend entity patterns
- **[Data Tables Guide](../frontend/docs/data-tables.md)** - Comprehensive table implementation
- **[Forms Guide](../frontend/docs/forms.md)** - Form handling with validation
- **[Project Structure](../frontend/docs/project-structure.md)** - Frontend architecture
- **[Global Loading State](../frontend/docs/global-loading-state.md)** - Loading state management
- **[Authentication Guide](../frontend/docs/authentication.md)** - Auth integration
- **[Common Patterns](../frontend/docs/common-patterns.md)** - Reusable patterns and utilities

**System Documentation:**
- **[Architecture Overview](./ARCHITECTURE.md)** - System architecture and CQRS patterns
- **[Main CLAUDE.md](../CLAUDE.md)** - Development workflow and setup
- **[Backend Documentation](../backend/docs/)** - Backend-specific guides

---

## Tips for Success

1. **Start Small**: Begin with basic CRUD operations, then add advanced features
2. **Follow Patterns**: Use existing entities (User, Project) as templates
3. **Leverage Components**: Always check the [Component Library](../frontend/docs/components.md) first before creating custom components
4. **Test Early**: Implement tests as you build, not after
5. **Use Documentation**: Reference the detailed guides for each layer
6. **Consistent Naming**: Follow established naming conventions across all layers
7. **Security First**: Always implement proper authentication and authorization
8. **Performance**: Consider pagination, caching, and loading states from the start
9. **User Experience**: Implement proper loading states, error handling, and responsive design
10. **Component Reuse**: The consolidated component library provides 40% code reduction - use it!

This comprehensive guide ensures that every new entity is implemented consistently and follows the established architectural patterns of the application.