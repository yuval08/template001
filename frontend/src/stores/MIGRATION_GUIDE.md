# Store Refactoring Migration Guide

## Overview

The Zustand stores have been refactored to follow the Single Responsibility Principle and prevent them from becoming "god objects". The new architecture provides better separation of concerns, improved testability, and enhanced developer experience.

## Key Changes

### 1. Store Architecture

**Before**: Monolithic stores mixing state management with business logic
**After**: Modular stores with clear separation of concerns

- **Core Stores**: Basic state management (`/stores/core/`)
- **Domain Stores**: Business-specific state (`/stores/domain/`)
- **UI Stores**: User interface state (`/stores/ui/`)
- **Services**: Business logic and side effects (`/stores/services/`)

### 2. Middleware System

All stores now use a consistent middleware stack:

```typescript
import { devtools, persistence, logger, reset } from '@/stores/middleware';

// Example store with middleware
export const useExampleStore = create<ExampleStore>()(
  devtools({ name: 'ExampleStore' })(
    logger({ name: 'Example', collapsed: true })(
      persistence({ name: 'example-storage' })(
        reset((set, get) => ({
          // Store implementation
        }))
      )
    )
  )
);
```

### 3. Selectors and Actions

**Before**: Direct store access
```typescript
const { user, setUser } = useAuthStore();
```

**After**: Explicit selectors and actions
```typescript
const user = authSelectors.user();
authActions.setUser(user);
```

## Migration Steps

### Step 1: Update Imports

**Old:**
```typescript
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useToastStore, toast } from '@/stores/toastStore';
```

**New:**
```typescript
// Option 1: Use new hooks (recommended)
import { useAuth } from '@/hooks/useAuth.refactored';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast.refactored';

// Option 2: Use stores directly
import { useAuthStore, authSelectors, authActions } from '@/stores';
import { themeService } from '@/stores';
import { notificationService } from '@/stores';
```

### Step 2: Update Store Usage

#### Auth Store Migration

**Old:**
```typescript
const { user, isAuthenticated, setUser, logout } = useAuthStore();
```

**New:**
```typescript
// Using the hook (recommended)
const { user, isAuthenticated, login, signOut } = useAuth();

// Or using selectors/actions directly
const user = authSelectors.user();
const isAuthenticated = authSelectors.isAuthenticated();
authActions.setUser(newUser);
authActions.logout();
```

#### Theme Store Migration

**Old:**
```typescript
const { theme, setTheme } = useThemeStore();
setTheme('dark'); // This also manipulated DOM directly
```

**New:**
```typescript
// Using the hook (recommended)
const { theme, setTheme, toggleTheme } = useTheme();
setTheme('dark'); // DOM manipulation handled by themeService

// Or using service directly
import { themeService } from '@/stores';
themeService.setTheme('dark');
```

#### Toast/Notification Migration

**Old:**
```typescript
import { useToastStore, toast } from '@/stores/toastStore';

const { toasts, addToast } = useToastStore();
toast.success('Success message');
toast.error('Error message');
```

**New:**
```typescript
// Using the hook (recommended)
import { useToast } from '@/hooks/useToast.refactored';

const { success, error, items } = useToast();
success({ title: 'Success message' });
error({ title: 'Error message' });

// Or using service directly
import { notificationService } from '@/stores';
notificationService.success({ title: 'Success message' });
```

### Step 3: Initialize Services

Add the StoreProvider to your app root:

```typescript
// App.tsx or main.tsx
import { StoreProvider } from '@/stores/providers/StoreProvider';

function App() {
  return (
    <StoreProvider enableDevtools={true} enableLogging={true}>
      {/* Your app components */}
    </StoreProvider>
  );
}
```

### Step 4: Update Tests

**Old:**
```typescript
const { result } = renderHook(() => useAuthStore());
act(() => {
  result.current.setUser(mockUser);
});
```

**New:**
```typescript
import { StoreTestUtils } from '@/stores/utils/store-testing';
import { useAuthStore } from '@/stores';

const authStoreTest = StoreTestUtils.createStoreTest(useAuthStore);
const { result } = authStoreTest.renderStore();

act(() => {
  result.current.setUser(mockUser);
});
```

## New Features

### 1. Reset Functionality

All stores now support reset to initial state:

```typescript
import { authActions, uiActions } from '@/stores';

// Reset individual stores
authActions.reset();

// Reset multiple stores
import { resetStores } from '@/stores/utils/store-composition';
resetStores(useAuthStore.getState(), useUIStore.getState());
```

### 2. Store Composition

Combine multiple stores for complex components:

```typescript
import { combineStores } from '@/stores/utils/store-composition';
import { useAuthStore, useUIStore, useProjectStore } from '@/stores';

const useDashboardStores = combineStores({
  auth: useAuthStore,
  ui: useUIStore,
  project: useProjectStore,
});

// In component
const { auth, ui, project } = useDashboardStores();
```

### 3. Enhanced Selectors

Use specific selectors for better performance:

```typescript
import { authSelectors, projectSelectors } from '@/stores';

// Instead of subscribing to entire store
const hasRole = authSelectors.hasRole('Admin');
const recentProjects = projectSelectors.recentProjects();
```

### 4. Middleware Benefits

- **Logging**: Automatic state change logging in development
- **DevTools**: Redux DevTools integration
- **Persistence**: Configurable state persistence
- **Reset**: Standardized reset functionality

## Best Practices

### 1. Use Hooks for Components

```typescript
// Preferred: Use specialized hooks
const { user, login, signOut } = useAuth();
const { success, error } = useToast();

// Avoid: Direct store access in components
const user = useAuthStore((state) => state.user);
```

### 2. Use Services for Business Logic

```typescript
// Business logic belongs in services
import { notificationService } from '@/stores';

const handleError = (error: Error) => {
  if (error.name === 'ValidationError') {
    notificationService.validationError('Invalid data', error.errors);
  } else {
    notificationService.error({ title: 'Unexpected error' });
  }
};
```

### 3. Use Selectors for Derived State

```typescript
// Create reusable selectors
export const dashboardSelectors = {
  userStats: () => {
    const user = authSelectors.user();
    const projects = projectSelectors.recentProjects();
    return {
      userRole: user?.role,
      projectCount: projects.length,
      isAdmin: authSelectors.hasRole('Admin')(),
    };
  },
};
```

### 4. Test Store Logic

```typescript
import { StoreTestUtils } from '@/stores/utils/store-testing';

describe('Auth Store', () => {
  const authStoreTest = StoreTestUtils.createStoreTest(useAuthStore);

  beforeEach(() => {
    authStoreTest.resetStore();
  });

  it('should authenticate user', () => {
    const { result } = authStoreTest.renderStore();
    
    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## Backward Compatibility

The old store files are maintained for backward compatibility but marked as deprecated:

- `@/stores/authStore.ts` → Deprecated, use `@/stores/core/auth.store.ts`
- `@/stores/themeStore.ts` → Deprecated, use `@/stores/core/theme.store.ts`  
- `@/stores/toastStore.ts` → Deprecated, use `@/stores/core/notification.store.ts`

## Performance Benefits

1. **Selective Subscriptions**: Selectors only subscribe to specific state slices
2. **Optimized Re-renders**: Better memoization and state isolation
3. **Code Splitting**: Services can be lazy-loaded
4. **Type Safety**: Enhanced TypeScript support

## Troubleshooting

### Common Issues

1. **Import Errors**: Update import paths to new store structure
2. **Type Errors**: Use new TypeScript interfaces from `/stores/types/`
3. **Missing Methods**: Check if method moved from store to service
4. **Test Failures**: Update test utilities and mocking

### Migration Checklist

- [ ] Update all store imports
- [ ] Replace direct store usage with hooks
- [ ] Move side effects to services
- [ ] Add StoreProvider to app root
- [ ] Update test files
- [ ] Remove deprecated imports
- [ ] Verify all functionality works

## Support

For questions or issues during migration:

1. Check the new hook implementations in `/hooks/`
2. Review service patterns in `/stores/services/`
3. Look at test examples in `/stores/__tests__/`
4. Use the store composition utilities for complex scenarios