# Adding New Features Guide

This guide explains how to extend the template with new business entities and features.

## Quick Start: Adding a New Entity

### 1. Plan Your Entity
- **Define fields**: What data will you store?
- **Relationships**: How does it relate to existing entities?
- **Permissions**: Who can create/read/update/delete?
- **UI Requirements**: List view, forms, details page needed?

### 2. Backend Implementation

#### Domain Layer (`backend/Domain/`)
```csharp
// Create: backend/Domain/Entities/Customer.cs
public class Customer : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    
    // Navigation properties
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
```

#### Application Layer (`backend/Application/Features/Customers/`)

**Commands** - Create, Update, Delete operations:
```csharp
// Commands/CreateCustomerCommand.cs
public record CreateCustomerCommand(
    string Name,
    string Email,
    string Phone
) : IRequest<CustomerDto>;

public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, CustomerDto>
{
    // Implementation
}
```

**Queries** - Read operations:
```csharp
// Queries/GetCustomersQuery.cs
public record GetCustomersQuery(
    string? SearchTerm = null,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<PagedResult<CustomerDto>>;
```

**DTOs** - Data transfer objects:
```csharp
// DTOs/CustomerDto.cs
public class CustomerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
```

#### Infrastructure Layer

**Database Context** (`backend/Infrastructure/Data/ApplicationDbContext.cs`):
```csharp
public DbSet<Customer> Customers { get; set; }

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Customer>(entity =>
    {
        entity.HasIndex(e => e.Email).IsUnique();
        entity.Property(e => e.Name).HasMaxLength(200);
        entity.Property(e => e.Email).HasMaxLength(100);
    });
}
```

**Create Migration**:
```bash
dotnet ef migrations add AddCustomer -p backend/Infrastructure -s backend/Api
dotnet ef database update
```

#### API Layer (`backend/Api/Controllers/`)
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly IMediator _mediator;

    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetCustomers(
        [FromQuery] GetCustomersQuery query)
    {
        return await _mediator.Send(query);
    }

    [HttpPost]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(
        CreateCustomerCommand command)
    {
        return await _mediator.Send(command);
    }
}
```

### 3. Frontend Implementation

#### Type Definitions (`frontend/src/types/`)
```typescript
// types/customer.ts
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
}
```

#### API Services (`frontend/src/services/`)
```typescript
// services/customerService.ts
import api from './api';
import { Customer, CreateCustomerRequest } from '@/types/customer';

export const customerService = {
  getAll: (params?: { search?: string; page?: number }) =>
    api.get<PagedResult<Customer>>('/customers', { params }),
    
  getById: (id: number) =>
    api.get<Customer>(`/customers/${id}`),
    
  create: (data: CreateCustomerRequest) =>
    api.post<Customer>('/customers', data),
    
  update: (id: number, data: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, data),
    
  delete: (id: number) =>
    api.delete(`/customers/${id}`),
};
```

#### React Hooks (`frontend/src/hooks/`)
```typescript
// hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customerService';

export const useCustomers = (params?: { search?: string; page?: number }) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getAll(params),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
```

#### Components (`frontend/src/components/customers/`)

**List Component**:
```typescript
// components/customers/CustomerList.tsx
export const CustomerList = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useCustomers({ search });

  return (
    <div>
      <SearchInput value={search} onChange={setSearch} />
      {isLoading ? (
        <Loading />
      ) : (
        <DataTable 
          data={data?.items} 
          columns={customerColumns}
        />
      )}
    </div>
  );
};
```

**Form Component**:
```typescript
// components/customers/CustomerForm.tsx
export const CustomerForm = () => {
  const form = useForm<CreateCustomerRequest>();
  const createCustomer = useCreateCustomer();

  const onSubmit = (data: CreateCustomerRequest) => {
    createCustomer.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" label="Name" />
        <FormField name="email" label="Email" />
        <FormField name="phone" label="Phone" />
        <Button type="submit">Create Customer</Button>
      </form>
    </Form>
  );
};
```

#### Pages (`frontend/src/pages/`)
```typescript
// pages/CustomersPage.tsx
export const CustomersPage = () => {
  return (
    <div>
      <PageHeader title="Customers" />
      <CustomerList />
    </div>
  );
};
```

#### Routing (`frontend/src/router.tsx`)
```typescript
// Add route
{
  path: '/customers',
  element: <CustomersPage />,
}
```

### 4. Integration Features

#### Global Loading State
Loading states are automatically handled by React Query hooks.

#### Real-time Updates (Optional)
```csharp
// backend: Add SignalR notifications
await _hubContext.Clients.All.SendAsync("CustomerCreated", customerDto);
```

```typescript
// frontend: Listen for updates
useSignalR('CustomerCreated', (customer) => {
  queryClient.setQueryData(['customers'], (old) => 
    old ? [customer, ...old] : [customer]
  );
});
```

#### Authorization
```csharp
// Restrict endpoint access
[Authorize(Policy = "ManagerOrAdmin")]
public async Task<ActionResult> CreateCustomer(...) { }
```

### 5. Testing

#### Backend Tests
```csharp
// backend/Tests.Unit/Features/Customers/CreateCustomerCommandHandlerTests.cs
[Test]
public async Task Handle_ValidCommand_ReturnsCustomerDto()
{
    // Arrange
    var command = new CreateCustomerCommand("Test", "test@test.com", "123");
    
    // Act
    var result = await _handler.Handle(command, CancellationToken.None);
    
    // Assert
    result.Should().NotBeNull();
    result.Name.Should().Be("Test");
}
```

#### Frontend Tests
```typescript
// frontend/src/components/customers/__tests__/CustomerList.test.tsx
import { render, screen } from '@testing-library/react';
import { CustomerList } from '../CustomerList';

test('renders customer list', () => {
  render(<CustomerList />);
  expect(screen.getByText('Customers')).toBeInTheDocument();
});
```

## Advanced Features

### File Uploads
```csharp
// Add file handling to your entity
public string? DocumentPath { get; set; }

// Controller endpoint for file upload
[HttpPost("{id}/upload")]
public async Task<IActionResult> UploadDocument(int id, IFormFile file)
{
    // File handling logic
}
```

### Bulk Operations
```typescript
// Frontend: Multi-select for bulk actions
const { mutate: bulkDelete } = useMutation({
  mutationFn: (ids: number[]) => 
    Promise.all(ids.map(id => customerService.delete(id)))
});
```

### Export Functionality
```csharp
// Backend: Export endpoint
[HttpGet("export")]
public async Task<IActionResult> ExportCustomers()
{
    var customers = await _mediator.Send(new GetCustomersQuery());
    return File(csvBytes, "text/csv", "customers.csv");
}
```

## Best Practices

1. **Follow naming conventions** - Match existing patterns
2. **Use existing components** - Leverage DataTable, forms, etc.
3. **Handle errors gracefully** - Use try-catch and error boundaries
4. **Add loading states** - Use React Query's loading states
5. **Test your changes** - Write unit tests for critical functionality
6. **Update documentation** - Document any complex business logic

## Checklist for New Features

### Backend ✅
- [ ] Domain entity created
- [ ] CQRS commands and queries implemented
- [ ] Database migration created and tested
- [ ] API controller with proper authorization
- [ ] Validation rules implemented
- [ ] Unit tests written

### Frontend ✅
- [ ] TypeScript interfaces defined
- [ ] API service functions created
- [ ] React Query hooks implemented
- [ ] UI components built
- [ ] Page component created
- [ ] Route added to router
- [ ] Error handling implemented

### Integration ✅
- [ ] Authorization policies applied
- [ ] Real-time updates (if needed)
- [ ] Global loading states working
- [ ] End-to-end testing completed