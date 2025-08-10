# Frontend Development Guidelines

## Project Structure

This frontend follows an entity-based architecture with clear separation of concerns. **IMPORTANT**: Follow this structure exactly when adding new features.

### Directory Organization

```
frontend/src/
├── entities/          # Entity-specific modules (services, hooks, types)
├── pages/            # Page components (routes)
├── components/       # Reusable UI components
├── stores/           # Zustand state stores
├── hooks/            # Global hooks (not entity-specific)
├── shared/           # Shared utilities, types, and services
├── layouts/          # Layout components
└── router.tsx        # Route definitions
```

## Adding a New Page

### 1. Create the Page Component

**Location**: `/src/pages/YourPageName.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useYourEntity } from '@/entities/your-entity/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function YourPageName() {
  const { data, isLoading, error } = useYourEntity();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Your Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

### 2. Add Route to Router

**File**: `/src/router.tsx`

```tsx
import YourPageName from '@/pages/YourPageName';

// Add to routes array
{
  path: '/your-route',
  element: (
    <PrivateRoute>
      <YourPageName />
    </PrivateRoute>
  ),
}
```

### 3. Add Navigation Link (if needed)

**File**: `/src/components/Sidebar.tsx` or `/src/components/Topbar.tsx`

```tsx
<Link to="/your-route" className="nav-link">
  <Icon className="h-4 w-4" />
  Your Page Name
</Link>
```

## Adding a New Entity (Backend Integration)

When adding a feature that communicates with the backend, follow this entity-based structure:

### 1. Define Types

**File**: `/src/entities/your-entity/types/your-entity.types.ts`

```typescript
// Entity model
export interface YourEntity {
  id: string;
  name: string;
  // ... other fields
}

// API response types
export interface YourEntityResponse {
  data: YourEntity[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Request types
export interface CreateYourEntityRequest {
  name: string;
  // ... other fields
}
```

### 2. Create Service (API Integration)

**File**: `/src/entities/your-entity/services/your-entity.service.ts`

```typescript
import { BaseApiService } from '@/shared/api';
// OR for CRUD operations:
import { CrudService } from '@/shared/api';
import type { YourEntity, CreateYourEntityRequest } from '../types';

// For custom endpoints:
export class YourEntityService extends BaseApiService {
  protected readonly entityPath = '/api/your-entities';
  
  async getYourEntities(params?: any): Promise<YourEntityResponse> {
    return this.get<YourEntityResponse>(this.entityPath, params);
  }
  
  async createYourEntity(data: CreateYourEntityRequest): Promise<YourEntity> {
    return this.post<YourEntity>(this.entityPath, data);
  }
}

// For standard CRUD:
export class YourEntityService extends CrudService<YourEntity, CreateYourEntityRequest, UpdateYourEntityRequest> {
  protected readonly entityPath = '/api/your-entities';
  
  // Add custom methods if needed
  async customMethod(id: string): Promise<void> {
    return this.post<void>(`${this.entityPath}/${id}/custom-action`);
  }
}

// Export singleton instance
export const yourEntityService = new YourEntityService();
```

**IMPORTANT**: Always extend `BaseApiService` or `CrudService`. Never use axios directly. The base services handle:
- Cookie-based authentication (`credentials: 'include'`)
- Error handling and retries
- Request/response interceptors
- Correlation IDs for tracking

### 3. Create React Query Hooks

**File**: `/src/entities/your-entity/hooks/your-entity.hooks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { yourEntityService } from '../services';
import { useAuth } from '@/hooks/useAuth';
import type { CreateYourEntityRequest } from '../types';

const QUERY_KEY = 'your-entities';

export const useYourEntities = (params?: any) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => yourEntityService.getYourEntities(params),
    enabled: isAuthenticated, // Only fetch when authenticated
  });
};

export const useCreateYourEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateYourEntityRequest) => 
      yourEntityService.createYourEntity(data),
    onSuccess: () => {
      // Invalidate cache to refetch data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useYourEntity = (id: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => yourEntityService.getById(id),
    enabled: isAuthenticated && !!id,
  });
};
```

### 4. Create Index Files for Clean Imports

**File**: `/src/entities/your-entity/index.ts`

```typescript
export * from './types';
export * from './services';
export * from './hooks';
```

### 5. Optional: Create Zustand Store (for complex state)

**File**: `/src/stores/your-entity.store.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { YourEntity } from '@/entities/your-entity';

interface YourEntityStore {
  selectedEntity: YourEntity | null;
  filters: any;
  setSelectedEntity: (entity: YourEntity | null) => void;
  setFilters: (filters: any) => void;
  reset: () => void;
}

export const useYourEntityStore = create<YourEntityStore>()(
  devtools(
    persist(
      (set) => ({
        selectedEntity: null,
        filters: {},
        setSelectedEntity: (entity) => set({ selectedEntity: entity }),
        setFilters: (filters) => set({ filters }),
        reset: () => set({ selectedEntity: null, filters: {} }),
      }),
      {
        name: 'your-entity-storage',
      }
    )
  )
);
```

## Adding a New Component

### Reusable UI Component

**Location**: `/src/components/YourComponent.tsx`

```tsx
import { cn } from '@/lib/utils';

interface YourComponentProps {
  className?: string;
  // ... other props
}

export function YourComponent({ className, ...props }: YourComponentProps) {
  return (
    <div className={cn('default-classes', className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### Entity-Specific Component

**Location**: `/src/entities/your-entity/components/YourEntityCard.tsx`

```tsx
import { Card } from '@/components/ui/card';
import type { YourEntity } from '../types';

interface YourEntityCardProps {
  entity: YourEntity;
  onEdit?: (entity: YourEntity) => void;
  onDelete?: (id: string) => void;
}

export function YourEntityCard({ entity, onEdit, onDelete }: YourEntityCardProps) {
  return (
    <Card>
      {/* Card content */}
    </Card>
  );
}
```

## Form Handling

Use React Hook Form with Zod validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof formSchema>;

export function YourForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });
  
  const onSubmit = async (data: FormData) => {
    // Handle form submission
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Authentication Patterns

### Protected Routes

Routes are already wrapped with `PrivateRoute` in router.tsx. The component handles authentication checks.

### Using Authentication in Components

```tsx
import { useAuth } from '@/hooks/useAuth';

export function YourComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.name}</div>;
}
```

### API Calls with Authentication

Authentication is handled automatically by `BaseApiService`:
- Cookies are included with `credentials: 'include'`
- No need to manually add auth headers
- 401 errors are handled globally

## Common Patterns

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton';

if (isLoading) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  );
}
```

### Error Handling

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';

if (error) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        {error.message || 'An error occurred'}
      </AlertDescription>
    </Alert>
  );
}
```

### Data Tables

Use TanStack Table (already configured):

```tsx
import { DataTable } from '@/components/DataTable';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  // ... more columns
];

<DataTable columns={columns} data={data} />
```

## Common Mistakes to Avoid

❌ **DON'T** use axios directly
✅ **DO** extend `BaseApiService` or `CrudService`

❌ **DON'T** create service methods without proper typing
✅ **DO** define interfaces for all requests and responses

❌ **DON'T** forget to check authentication in React Query hooks
✅ **DO** use `enabled: isAuthenticated` in queries

❌ **DON'T** manually handle authentication tokens
✅ **DO** rely on cookie-based auth with `credentials: 'include'`

❌ **DON'T** create entity files in `/src/hooks/api/`
✅ **DO** use entity-based structure `/src/entities/[entity-name]/`

❌ **DON'T** forget error boundaries
✅ **DO** handle loading and error states in components

## File Naming Conventions

- **Pages**: PascalCase - `YourPageName.tsx`
- **Components**: PascalCase - `YourComponent.tsx`
- **Hooks**: camelCase with 'use' prefix - `useYourHook.ts`
- **Services**: kebab-case - `your-entity.service.ts`
- **Types**: kebab-case - `your-entity.types.ts`
- **Stores**: kebab-case - `your-entity.store.ts`

## Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { YourComponent } from './YourComponent';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('YourComponent', () => {
  it('renders correctly', async () => {
    render(<YourComponent />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });
});
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Environment Variables

Create `.env.local` for local development:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SIGNALR_URL=http://localhost:5000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## UI Components

This project uses Shadcn/ui components. To add a new component:

```bash
npx shadcn-ui@latest add [component-name]
```

Available components are in `/src/components/ui/`