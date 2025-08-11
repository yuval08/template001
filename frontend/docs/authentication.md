# Authentication Guide

The application uses cookie-based OAuth authentication with automatic handling of auth tokens.

## Authentication Flow

1. User clicks login button
2. Redirected to OAuth provider (Azure AD, Google, etc.)
3. After successful authentication, redirected back with auth cookie
4. Cookie is automatically included in all API requests
5. Frontend checks auth status and displays appropriate UI

## Using Authentication in Components

### Basic Authentication Check

```tsx
import { useAuth } from '@/hooks/useAuth';

export function YourComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please log in to continue</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Role-Based Access Control

```tsx
import { useAuth } from '@/hooks/useAuth';

export function AdminPanel() {
  const { user, hasAnyRole } = useAuth();
  
  // Check for admin role
  if (!hasAnyRole(['Admin'])) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }
  
  return <div>Admin content here...</div>;
}

// Check for multiple roles
export function ManagerContent() {
  const { hasAnyRole } = useAuth();
  
  // Allow both Admin and Manager roles
  if (!hasAnyRole(['Admin', 'Manager'])) {
    return <div>Access denied</div>;
  }
  
  return <div>Manager content...</div>;
}
```

## Protected Routes

Routes are automatically protected using the `PrivateRoute` component.

### Router Configuration

```tsx
// src/router.tsx
import { PrivateRoute } from '@/components/ProtectedRoute';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <PrivateRoute requiredRoles={['Admin']}>
            <AdminPanel />
          </PrivateRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <PrivateRoute requiredRoles={['Admin', 'Manager']}>
            <Reports />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <Login />, // Public route
  },
];
```

### PrivateRoute Component

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}
```

## API Calls with Authentication

Authentication is handled automatically by the `BaseApiService`.

### Automatic Cookie Inclusion

```typescript
// src/shared/api/base-api.service.ts
export abstract class BaseApiService {
  protected async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    return response.json();
  }
}
```

### Using in React Query Hooks

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export const useProtectedData = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['protected-data'],
    queryFn: fetchProtectedData,
    enabled: isAuthenticated, // Only fetch when authenticated
  });
};
```

## Auth Context and Store

### Auth Context Provider

```tsx
// src/providers/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = () => {
    window.location.href = '/api/auth/login';
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = '/login';
  };
  
  const hasAnyRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout, 
        hasAnyRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Login/Logout Implementation

### Login Component

```tsx
// src/pages/Login.tsx
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Login() {
  const { login } = useAuth();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Welcome</h1>
        <Button onClick={login} size="lg">
          Sign in with your organization account
        </Button>
      </div>
    </div>
  );
}
```

### Logout in Navigation

```tsx
// src/components/layout/Topbar.tsx
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Topbar() {
  const { user, logout } = useAuth();
  
  return (
    <header className="border-b">
      <div className="flex justify-between items-center px-4 py-2">
        <div>Logo</div>
        <div className="flex items-center gap-4">
          <span>{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
```

## Handling Auth Errors

### Global Error Boundary

```tsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold">Session Expired</h2>
        <p>Please log in again to continue.</p>
        <Button onClick={() => window.location.href = '/login'}>
          Log In
        </Button>
      </div>
    );
  }
  
  return <div>An error occurred</div>;
}
```

### API Error Handling

```typescript
// src/shared/api/error-handler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: any) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Show forbidden message
        toast.error('You do not have permission to perform this action');
        break;
      default:
        toast.error(error.message);
    }
  }
}
```

## Best Practices

1. **Never store tokens manually** - Let cookies handle authentication
2. **Always check authentication** before making protected API calls
3. **Use `enabled` flag** in React Query for auth-dependent queries
4. **Implement proper role checks** for sensitive operations
5. **Handle 401 errors globally** to redirect to login
6. **Show loading states** while checking authentication
7. **Provide clear error messages** for authorization failures
8. **Use TypeScript** for type-safe user data
9. **Implement logout on all devices** if needed
10. **Test auth flows thoroughly** including edge cases

## Security Considerations

- Cookies are HTTP-only and secure (in production)
- CSRF protection is handled by the backend
- No tokens are stored in localStorage or sessionStorage
- API validates authentication on every request
- Role-based access control on both frontend and backend
- Domain restrictions can be enforced via ALLOWED_DOMAIN env variable