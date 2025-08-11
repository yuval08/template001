# Entity Development Guide

When adding a feature that communicates with the backend, follow this entity-based structure.

## Overview

Each entity represents a business domain object (User, Project, Report, etc.) and includes:
- Type definitions
- API service
- React Query hooks
- Optional UI components
- Optional Zustand store

## Step-by-Step Implementation

### 1. Define Types

Create TypeScript interfaces for your entity.

**File**: `/src/entities/your-entity/types/your-entity.types.ts`

```typescript
// Entity model
export interface YourEntity {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
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
  description?: string;
  // ... other fields
}

export interface UpdateYourEntityRequest {
  id: string;
  name?: string;
  status?: 'active' | 'inactive';
  // ... other fields
}

// Query parameters
export interface YourEntityQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
```

### 2. Create Service (API Integration)

Create a service class that extends `BaseApiService` or `CrudService`.

**File**: `/src/entities/your-entity/services/your-entity.service.ts`

```typescript
import { BaseApiService } from '@/shared/api';
// OR for CRUD operations:
import { CrudService } from '@/shared/api';
import type { 
  YourEntity, 
  CreateYourEntityRequest,
  UpdateYourEntityRequest,
  YourEntityResponse,
  YourEntityQueryParams 
} from '../types';

// For custom endpoints:
export class YourEntityService extends BaseApiService {
  protected readonly entityPath = '/api/your-entities';
  
  async getYourEntities(params?: YourEntityQueryParams): Promise<YourEntityResponse> {
    return this.get<YourEntityResponse>(this.entityPath, params);
  }
  
  async getYourEntity(id: string): Promise<YourEntity> {
    return this.get<YourEntity>(`${this.entityPath}/${id}`);
  }
  
  async createYourEntity(data: CreateYourEntityRequest): Promise<YourEntity> {
    return this.post<YourEntity>(this.entityPath, data);
  }
  
  async updateYourEntity(id: string, data: UpdateYourEntityRequest): Promise<YourEntity> {
    return this.put<YourEntity>(`${this.entityPath}/${id}`, data);
  }
  
  async deleteYourEntity(id: string): Promise<void> {
    return this.delete<void>(`${this.entityPath}/${id}`);
  }
}

// For standard CRUD (simpler approach):
export class YourEntityService extends CrudService<
  YourEntity, 
  CreateYourEntityRequest, 
  UpdateYourEntityRequest
> {
  protected readonly entityPath = '/api/your-entities';
  
  // Add custom methods if needed
  async customMethod(id: string): Promise<void> {
    return this.post<void>(`${this.entityPath}/${id}/custom-action`);
  }
}

// Export singleton instance
export const yourEntityService = new YourEntityService();
```

**IMPORTANT**: 
- Always extend `BaseApiService` or `CrudService`
- Never use axios directly
- The base services handle:
  - Cookie-based authentication (`credentials: 'include'`)
  - Error handling and retries
  - Request/response interceptors
  - Correlation IDs for tracking

### 3. Create React Query Hooks

Create hooks for data fetching and mutations.

**File**: `/src/entities/your-entity/hooks/your-entity.hooks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { yourEntityService } from '../services';
import { useAuth } from '@/hooks/useAuth';
import type { 
  CreateYourEntityRequest,
  UpdateYourEntityRequest,
  YourEntityQueryParams 
} from '../types';

const QUERY_KEY = 'your-entities';

// Fetch list of entities
export const useYourEntities = (params?: YourEntityQueryParams) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => yourEntityService.getYourEntities(params),
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};

// Fetch single entity
export const useYourEntity = (id: string) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => yourEntityService.getYourEntity(id),
    enabled: isAuthenticated && !!id,
  });
};

// Create entity
export const useCreateYourEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateYourEntityRequest) => 
      yourEntityService.createYourEntity(data),
    onSuccess: () => {
      // Invalidate cache to refetch data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to create entity:', error);
      // Handle error (show toast, etc.)
    },
  });
};

// Update entity
export const useUpdateYourEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateYourEntityRequest }) => 
      yourEntityService.updateYourEntity(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and single entity queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

// Delete entity
export const useDeleteYourEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => yourEntityService.deleteYourEntity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
```

### 4. Create Index File for Clean Imports

Export everything from a single entry point.

**File**: `/src/entities/your-entity/index.ts`

```typescript
// Export all types
export * from './types/your-entity.types';

// Export service
export * from './services/your-entity.service';

// Export hooks
export * from './hooks/your-entity.hooks';

// Export components if any
// export * from './components';
```

### 5. Optional: Create Zustand Store

For complex state management beyond server state.

**File**: `/src/stores/your-entity.store.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { YourEntity } from '@/entities/your-entity';

interface YourEntityStore {
  // State
  selectedEntity: YourEntity | null;
  filters: {
    search: string;
    status: string | undefined;
    showInactive: boolean;
  };
  
  // Actions
  setSelectedEntity: (entity: YourEntity | null) => void;
  setFilters: (filters: Partial<YourEntityStore['filters']>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initialFilters = {
  search: '',
  status: undefined,
  showInactive: false,
};

export const useYourEntityStore = create<YourEntityStore>()(
  devtools(
    persist(
      (set) => ({
        // State
        selectedEntity: null,
        filters: initialFilters,
        
        // Actions
        setSelectedEntity: (entity) => set({ selectedEntity: entity }),
        setFilters: (newFilters) => 
          set((state) => ({ 
            filters: { ...state.filters, ...newFilters } 
          })),
        resetFilters: () => set({ filters: initialFilters }),
        reset: () => set({ 
          selectedEntity: null, 
          filters: initialFilters 
        }),
      }),
      {
        name: 'your-entity-storage',
        partialize: (state) => ({ 
          // Only persist filters, not selected entity
          filters: state.filters 
        }),
      }
    )
  )
);
```

### 6. Optional: Create Entity-Specific Components

Create reusable components for your entity.

**File**: `/src/entities/your-entity/components/YourEntityCard.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { YourEntity } from '../types';

interface YourEntityCardProps {
  entity: YourEntity;
  onEdit?: (entity: YourEntity) => void;
  onDelete?: (id: string) => void;
  onView?: (entity: YourEntity) => void;
}

export function YourEntityCard({ 
  entity, 
  onEdit, 
  onDelete, 
  onView 
}: YourEntityCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{entity.name}</CardTitle>
          <Badge variant={entity.status === 'active' ? 'default' : 'secondary'}>
            {entity.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Entity details */}
        <div className="flex gap-2 mt-4">
          {onView && (
            <Button size="sm" variant="outline" onClick={() => onView(entity)}>
              View
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(entity)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onDelete(entity.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Usage Example

```tsx
import { useYourEntities, useCreateYourEntity, useDeleteYourEntity } from '@/entities/your-entity';

function YourEntityPage() {
  const { data, isLoading, error } = useYourEntities({
    pageNumber: 1,
    pageSize: 10,
    search: 'test',
  });
  
  const createMutation = useCreateYourEntity();
  const deleteMutation = useDeleteYourEntity();
  
  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name: 'New Entity',
      description: 'Description',
    });
  };
  
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {/* Render your entities */}
      {data?.data.map(entity => (
        <YourEntityCard 
          key={entity.id} 
          entity={entity}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

## Best Practices

1. **Type Everything**: Define interfaces for all data structures
2. **Use Base Services**: Always extend `BaseApiService` or `CrudService`
3. **Authentication Check**: Use `enabled: isAuthenticated` in queries
4. **Cache Management**: Invalidate queries appropriately after mutations
5. **Error Handling**: Implement proper error handling in mutations
6. **Loading States**: Always handle loading and error states in components
7. **Optimistic Updates**: Consider implementing optimistic updates for better UX
8. **Query Keys**: Use consistent query key patterns for cache management