# Data Table Implementation Guide

When creating pages that display tabular data (like Users, Products, Orders, etc.), follow this comprehensive pattern that includes desktop/mobile responsive views, filtering, sorting, pagination, and search.

## Features Provided

- ✅ **Responsive Design**: Table view for desktop, card view for mobile
- ✅ **Search**: Debounced search with 500ms delay
- ✅ **Filtering**: Role/status filters with clear functionality
- ✅ **Sorting**: Column sorting with visual indicators
- ✅ **Pagination**: Smart pagination with automatic page adjustment
- ✅ **Clear Filters**: Button that appears when filters are active
- ✅ **State Management**: Proper state reset on filter/sort changes

## Component Architecture

### 1. Main Page Component

The main page component orchestrates all the data table functionality.

**Location**: `/src/pages/YourEntityList.tsx`

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveEntityView } from '@/components/your-entity/ResponsiveEntityView';
import { useYourEntities } from '@/entities/your-entity';
import { debounce } from 'lodash';

type SortingState = Array<{
  id: string;
  desc: boolean;
}>;

const YourEntityList: React.FC = () => {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false } // Default sort
  ]);
  const [searchInput, setSearchInput] = useState(''); // For input field
  const [globalFilter, setGlobalFilter] = useState(''); // For API call
  const [statusFilter, setStatusFilter] = useState<string>();
  const [showInactive, setShowInactive] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debounced search
  const debouncedSetGlobalFilter = useCallback(
    debounce((value: string) => {
      setGlobalFilter(value);
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSetGlobalFilter(searchInput);
  }, [searchInput, debouncedSetGlobalFilter]);

  useEffect(() => {
    return () => {
      debouncedSetGlobalFilter.cancel();
    };
  }, [debouncedSetGlobalFilter]);

  // Check if filters are active
  const hasActiveFilters = searchInput.trim() !== '' || 
    statusFilter !== undefined || 
    showInactive;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setGlobalFilter('');
    setStatusFilter(undefined);
    setShowInactive(false);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    debouncedSetGlobalFilter.cancel();
  };

  // Data fetching
  const { data: response, isLoading, error } = useYourEntities({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: globalFilter,
    statusFilter: statusFilter,
    showInactive: showInactive,
    sortBy: sorting[0]?.id,
    sortDescending: sorting[0]?.desc,
  });

  const entities = response?.data || [];
  const totalCount = response?.totalCount || 0;

  // Handler functions with pagination reset
  const handleGlobalFilterChange = (filter: string) => {
    setSearchInput(filter);
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (status: string | undefined) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleShowInactiveChange = (show: boolean) => {
    setShowInactive(show);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleDelete = async (entity: YourEntity) => {
    // Delete logic with pagination adjustment
    const currentPageItems = entities.length;
    const isLastItemOnPage = currentPageItems === 1;
    const isNotOnFirstPage = pagination.pageIndex > 0;
    
    if (isLastItemOnPage && isNotOnFirstPage) {
      setPagination(prev => ({
        ...prev,
        pageIndex: prev.pageIndex - 1
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Entities</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveEntityView
            entities={entities}
            totalCount={totalCount}
            loading={isLoading}
            error={error}
            pagination={pagination}
            sorting={sorting}
            globalFilter={searchInput}
            statusFilter={statusFilter}
            showInactive={showInactive}
            hasActiveFilters={hasActiveFilters}
            onPaginationChange={setPagination}
            onSortingChange={handleSortingChange}
            onGlobalFilterChange={handleGlobalFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
            onShowInactiveChange={handleShowInactiveChange}
            onClearFilters={handleClearFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};
```

### 2. Responsive View Wrapper

This component switches between desktop and mobile views based on screen size.

**Location**: `/src/components/your-entity/ResponsiveEntityView.tsx`

```tsx
import React from 'react';
import { EntityTable } from './EntityTable';
import { EntityList } from './EntityList';
import type { SortingState } from '@tanstack/react-table';

interface ResponsiveEntityViewProps {
  entities: YourEntity[];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: SortingState;
  globalFilter: string;
  statusFilter?: string;
  showInactive?: boolean;
  hasActiveFilters?: boolean;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange: (sorting: SortingState) => void;
  onGlobalFilterChange: (filter: string) => void;
  onStatusFilterChange?: (status: string | undefined) => void;
  onShowInactiveChange?: (show: boolean) => void;
  onClearFilters?: () => void;
  onEdit: (entity: YourEntity) => void;
  onDelete: (entity: YourEntity) => void;
}

export const ResponsiveEntityView: React.FC<ResponsiveEntityViewProps> = (props) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <EntityTable {...props} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <EntityList {...props} />
      </div>
    </>
  );
};
```

### 3. Desktop Table Component

Implements a full-featured data table using TanStack Table.

```tsx
export const EntityTable: React.FC<EntityTableProps> = ({
  entities,
  totalCount,
  loading,
  error,
  pagination,
  sorting,
  globalFilter,
  statusFilter,
  showInactive,
  hasActiveFilters,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  onStatusFilterChange,
  onShowInactiveChange,
  onClearFilters,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnDef<YourEntity>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    // ... more columns
  ];

  const table = useReactTable({
    data: entities,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange,
    onGlobalFilterChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  });

  // ... render table with filters, pagination, etc.
};
```

### 4. Mobile Card List Component

Displays data as cards for mobile devices with all filtering capabilities.

```tsx
export const EntityList: React.FC<EntityListProps> = ({
  entities,
  loading,
  error,
  globalFilter,
  statusFilter,
  showInactive,
  hasActiveFilters,
  onGlobalFilterChange,
  onStatusFilterChange,
  onShowInactiveChange,
  onClearFilters,
  pagination,
  onPaginationChange,
  // ... other props
}) => {
  return (
    <div className="space-y-4">
      {/* Search with Clear button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Additional Filters */}
      <div className="flex flex-col gap-3">
        {/* Filters here */}
      </div>

      {/* Entity Cards */}
      <div className="space-y-4">
        {entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} {...otherProps} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Pagination controls */}
      </div>
    </div>
  );
};
```

## Key Implementation Details

### Debounced Search
- Use lodash debounce with 500ms delay to reduce API calls
- Separate `searchInput` (for UI) and `globalFilter` (for API)
- Cancel pending debounce on component unmount

### Smart Pagination
- Automatically move to previous page when deleting last item
- Reset to page 1 when any filter or sort changes
- Provide page size selector for user preference

### Filter Management
- Track active filters with `hasActiveFilters` computed value
- Show Clear Filters button only when filters are active
- Reset all filters and pagination in `handleClearFilters`

### Responsive Design
- Use TanStack Table for desktop (hidden on mobile with `hidden lg:block`)
- Use custom card layout for mobile (hidden on desktop with `lg:hidden`)
- Ensure feature parity between desktop and mobile views

## Best Practices

1. **Always debounce search inputs** to avoid excessive API calls
2. **Reset pagination to page 1** when filters or sorting changes
3. **Provide visual feedback** for active filters
4. **Ensure mobile view has feature parity** with desktop
5. **Use proper TypeScript types** for all props and state
6. **Implement proper error boundaries** for error handling
7. **Add accessibility attributes** (aria-labels, roles)
8. **Use semantic HTML elements** for better accessibility
9. **Show loading states** during data fetching
10. **Display empty states** when no data matches filters