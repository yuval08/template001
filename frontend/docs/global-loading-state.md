# Global Loading State Management

A comprehensive loading state management system that provides centralized loading tracking, automatic API integration, and multiple UI indicators.

## Overview

The global loading state system consists of:
- **Zustand Store**: Centralized loading state management
- **React Hooks**: Easy integration with components
- **API Integration**: Automatic loading tracking for all API calls
- **UI Components**: Progress bars, overlays, and indicators
- **React Query Middleware**: Seamless integration with React Query

## Core Components

### 1. Loading Store (`stores/core/loading.store.ts`)

```typescript
// Basic usage
import { loadingActions, loadingSelectors } from '@/stores';

// Start loading
const loadingId = loadingActions.startLoading('user-fetch', {
  priority: 'high',
  timeout: 30000
});

// Stop loading
loadingActions.stopLoading(loadingId);

// Check loading state
const isLoading = loadingActions.isLoading('user-fetch');
```

**Loading Priorities:**
- `critical` - Shows full-screen overlay
- `high` - Shows prominent progress indicators  
- `normal` - Shows standard progress indicators
- `low` - Minimal visual feedback

### 2. React Hooks

#### `useLoading` Hook

```typescript
import { useLoading } from '@/hooks/useLoading';

function UserComponent() {
  const { isLoading, start, stop } = useLoading('fetch-users', {
    priority: 'high',
    timeout: 30000
  });

  const handleFetch = async () => {
    start();
    try {
      await fetchUsers();
    } finally {
      stop();
    }
  };

  return (
    <button onClick={handleFetch} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Fetch Users'}
    </button>
  );
}
```

#### `useGlobalLoading` Hook

```typescript
import { useGlobalLoading } from '@/hooks/useLoading';

function App() {
  const { globalLoading, criticalLoading } = useGlobalLoading();

  if (criticalLoading) {
    return <CriticalLoadingOverlay />;
  }

  return <MainApp showProgressBar={globalLoading} />;
}
```

#### React Query Integration Hooks

```typescript
import { useLoadingMutation, useLoadingQuery } from '@/hooks/useLoading';

// For mutations
const { mutationOptions } = useLoadingMutation('create-user', {
  priority: 'high'
});

const createUserMutation = useMutation({
  ...mutationOptions,
  mutationFn: createUser
});

// For queries  
const { queryOptions } = useLoadingQuery('fetch-users', isAuthenticated);

const usersQuery = useQuery({
  ...queryOptions,
  queryKey: ['users'],
  queryFn: fetchUsers
});
```

### 3. API Service Integration

The BaseApiService automatically tracks all API calls:

```typescript
// Automatic tracking (default behavior)
const users = await userService.getUsers();

// Custom loading options
const users = await userService.get('/api/users', {}, {
  loadingKey: 'custom-key',
  priority: 'critical',
  trackLoading: true
});

// Disable loading tracking
const users = await userService.get('/api/users', {}, {
  trackLoading: false
});
```

### 4. UI Components

#### Global Loading Indicator

```typescript
import { GlobalLoadingIndicator } from '@/components/ui/global-loading-indicator';

// In App.tsx (already integrated)
<GlobalLoadingIndicator 
  showProgressBar={true}
  showCriticalOverlay={true}
/>
```

#### Loading Progress Bar

```typescript
import { LoadingProgressBar } from '@/components/ui/global-loading-indicator';

<LoadingProgressBar 
  show={isLoading}
  className="custom-styles"
/>
```

#### Critical Loading Overlay

```typescript
import { CriticalLoadingOverlay } from '@/components/ui/global-loading-indicator';

<CriticalLoadingOverlay 
  show={hasCriticalLoading}
  className="custom-styles"
>
  <div>Custom overlay content</div>
</CriticalLoadingOverlay>
```

#### Specific Loading Indicators

```typescript
import { LoadingIndicator } from '@/components/ui/global-loading-indicator';

<LoadingIndicator
  loadingKey="specific-operation"
  showProgress={true}
  showOverlay={false}
/>
```

## Advanced Usage

### React Query Middleware

```typescript
import { createLoadingMiddleware, withLoadingTracking } from '@/utils/loading-middleware';

// Create custom middleware
const middleware = createLoadingMiddleware({
  defaultPriority: 'high',
  trackQueries: true,
  trackMutations: true,
  shouldTrack: (key, meta) => !key.includes('background')
});

// Enhance query options
const queryOptions = withLoadingTracking({
  queryKey: ['users'],
  queryFn: fetchUsers
}, {
  loadingPriority: 'critical',
  loadingTimeout: 60000
});
```

### Custom Loading Keys

```typescript
// Entity-based keys
loadingActions.startLoading('users:fetch');
loadingActions.startLoading('users:create');
loadingActions.startLoading('users:update:123');
loadingActions.startLoading('users:delete:456');

// Operation-based keys
loadingActions.startLoading('file-upload');
loadingActions.startLoading('report-generation');
loadingActions.startLoading('bulk-export');
```

### Request Deduplication

The system automatically prevents duplicate loading states for the same key:

```typescript
// Multiple calls with same key = single loading state
loadingActions.startLoading('users:fetch');
loadingActions.startLoading('users:fetch'); // Ignored
loadingActions.startLoading('users:fetch'); // Ignored

// Stop once = stops all
loadingActions.stopLoading('users:fetch');
```

## Best Practices

### 1. Use Descriptive Loading Keys

```typescript
// Good
'users:fetch'
'user:create'
'user:update:123'
'report:generate:monthly'

// Bad
'loading'
'api-call'
'request'
```

### 2. Set Appropriate Priorities

```typescript
// Critical - Full page operations
{ priority: 'critical' } // Login, initial app load

// High - Important user actions  
{ priority: 'high' } // Save, delete, create

// Normal - Standard operations
{ priority: 'normal' } // Fetch data, refresh

// Low - Background operations
{ priority: 'low' } // Analytics, prefetching
```

### 3. Handle Loading in Components

```typescript
function UserList() {
  const { isLoading, start, stop } = useLoading('users:fetch');
  
  // Show skeleton while loading
  if (isLoading) {
    return <UserListSkeleton />;
  }
  
  return <UserTable />;
}
```

### 4. Use Timeouts for Long Operations

```typescript
loadingActions.startLoading('report:generate', {
  priority: 'high',
  timeout: 60000, // 1 minute timeout
  metadata: { operation: 'report-generation' }
});
```

## Integration Examples

### Entity Services

```typescript
class UserService extends BaseApiService {
  async getUsers() {
    // Automatic loading tracking with key 'get:/api/users'
    return this.get('/api/users');
  }
  
  async createUser(data: CreateUser) {
    // Custom loading tracking
    return this.post('/api/users', data, {
      loadingKey: 'users:create',
      priority: 'high'
    });
  }
}
```

### React Components

```typescript
function CreateUserButton() {
  const { isLoading, start, stop } = useLoading('users:create', {
    priority: 'high'
  });
  
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onMutate: () => start(),
    onSettled: () => stop()
  });
  
  return (
    <Button 
      loading={isLoading}
      onClick={() => createUserMutation.mutate(userData)}
    >
      Create User
    </Button>
  );
}
```

### Page-Level Loading

```typescript
function UsersPage() {
  const { globalLoading } = useGlobalLoading();
  
  return (
    <div className="page">
      {globalLoading && <PageLoadingBar />}
      <UsersList />
    </div>
  );
}
```

## Monitoring & Debugging

### Development Tools

```typescript
// Check current loading state
console.log(loadingActions.getLoadingItems());

// Check specific loading
console.log(loadingActions.isLoading('users:fetch'));

// Clear expired items
loadingActions.clearExpiredItems();

// Stop all loading (for testing)
loadingActions.stopAllLoading();
```

### Loading State Inspector

```typescript
import { useGlobalLoading } from '@/hooks/useLoading';

function LoadingDebugger() {
  const { items, globalLoading, criticalLoading } = useGlobalLoading();
  
  return (
    <div className="debug-panel">
      <h3>Loading State Debug</h3>
      <p>Global: {globalLoading ? 'Yes' : 'No'}</p>
      <p>Critical: {criticalLoading ? 'Yes' : 'No'}</p>
      <pre>{JSON.stringify(items, null, 2)}</pre>
    </div>
  );
}
```

## Migration Guide

### From Existing Loading States

```typescript
// Before (component-level loading)
const [isLoading, setIsLoading] = useState(false);

setIsLoading(true);
try {
  await fetchUsers();
} finally {
  setIsLoading(false);
}

// After (global loading)
const { isLoading, start, stop } = useLoading('users:fetch');

start();
try {
  await fetchUsers();
} finally {
  stop();
}
```

### From React Query Loading States

```typescript
// Before
const { isLoading, data } = useQuery(['users'], fetchUsers);

// After (automatic tracking via BaseApiService)
const { data } = useQuery(['users'], fetchUsers);
const { isLoading } = useLoading('users:fetch');
```

The global loading state system provides a comprehensive, centralized approach to loading management that improves UX consistency and developer experience across the application.