# Error Handling System

This directory contains a comprehensive error handling system for the frontend application, providing consistent error management, user-friendly error messages, and robust recovery mechanisms.

## Components Overview

### ErrorBoundary
React Error Boundary component that catches JavaScript errors anywhere in the child component tree.

**Features:**
- Catches React component errors
- Displays fallback UI with error details (dev mode)
- Provides user-friendly error messages (production)
- Includes error reporting and recovery actions
- Supports custom fallback components

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary onError={handleError}>
  <YourComponent />
</ErrorBoundary>
```

### ErrorFallback
Simple error fallback components for displaying error states.

**Components:**
- `ErrorFallback`: Full error display with retry button
- `InlineError`: Compact inline error messages

**Usage:**
```tsx
import { ErrorFallback, InlineError } from '@/components/error/ErrorFallback';

<ErrorFallback 
  error={error} 
  resetError={() => refetch()} 
  title="Failed to load data"
/>

<InlineError 
  message="Connection failed" 
  onRetry={() => retry()} 
/>
```

## Error Types

The system supports several error types with specific handling:

### NetworkError
- Connection failures
- Timeout errors
- Network unavailability
- Automatic retry logic

### ValidationError
- Form validation failures
- Field-specific error messages
- User input corrections

### BusinessError
- Business rule violations
- Domain-specific errors
- User-friendly explanations

### AuthenticationError
- Authentication failures
- Session expiration
- Automatic redirect to login

### ServerError
- Internal server errors
- External service failures
- Error correlation IDs

## Error Handler

The central error handling utility provides consistent error processing across the application.

**Features:**
- Global error handling
- Error type discrimination
- User-friendly message mapping
- Recovery suggestions
- Error reporting integration

**Usage:**
```tsx
import { useErrorHandler } from '@/utils/errorHandler';

const { handleError, handleApiError, handleValidationError } = useErrorHandler();

// Handle different error types
try {
  await apiCall();
} catch (error) {
  handleApiError(error);
}
```

## Integration

### React Query Integration
The error handling system integrates with React Query for API error management:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        errorHandler.handleError(error, {
          showToast: true,
          logError: true,
          redirectOnAuth: true,
        });
      },
    },
  },
});
```

### API Service Integration
API services automatically handle errors through interceptors:

```tsx
import { createApiService } from '@/shared/api';

const apiService = createApiService();
// Errors are automatically handled and mapped to user-friendly messages
```

## Configuration

### Error Messages
Customize error messages in `utils/errorMapper.ts`:

```tsx
export const ERROR_MESSAGES: Record<string, string> = {
  'NETWORK_ERROR': 'Unable to connect to the server...',
  'VALIDATION_ERROR': 'Please correct the highlighted fields...',
  // Add more mappings
};
```

### Recovery Suggestions
Provide helpful recovery suggestions:

```tsx
export const RECOVERY_SUGGESTIONS: Record<string, string[]> = {
  'NETWORK_ERROR': [
    'Check your internet connection',
    'Try refreshing the page',
    'Contact support if the problem persists'
  ],
};
```

## Toast Notifications

Enhanced toast system for error notifications:

```tsx
import { toast } from '@/stores/toastStore';

// Specific error types
toast.networkError();
toast.validationError('Form errors', ['Field 1 error', 'Field 2 error']);
toast.serverError('ERR-12345');
toast.authError();

// Clear error toasts
toast.clearErrors();
```

## Best Practices

### Component Level
```tsx
// Use ErrorBoundary for component sections
<ErrorBoundary fallback={<CustomErrorFallback />}>
  <CriticalComponent />
</ErrorBoundary>

// Handle async operations
const handleSubmit = async () => {
  try {
    await submitForm();
    toast.success('Form submitted successfully');
  } catch (error) {
    handleError(error);
  }
};
```

### API Integration
```tsx
// Use hooks for API calls with error handling
const { data, error, isError, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  // Error handling is automatic through global configuration
});

if (isError) {
  return <InlineError message="Failed to load users" onRetry={refetch} />;
}
```

### Form Validation
```tsx
// Handle validation errors specifically
const handleValidationError = (errors: Record<string, string[]>) => {
  Object.entries(errors).forEach(([field, messages]) => {
    setFieldError(field, messages[0]);
  });
  
  toast.validationError('Please fix the following errors:', 
    formatValidationErrors(errors)
  );
};
```

## Development vs Production

### Development Mode
- Shows technical error details
- Displays stack traces
- Includes debug information
- Full error logging

### Production Mode
- User-friendly messages only
- Error correlation IDs
- Automatic error reporting
- Minimal technical details

## Testing

Test error handling scenarios:

```tsx
import { ErrorHandlingExample } from '@/components/error/ErrorHandlingExample';

// Use the example component to test different error scenarios
<ErrorHandlingExample />
```

## Monitoring Integration

The system supports integration with monitoring services:

```tsx
// Configure error reporting
errorHandler.setAuthRedirectCallback(() => {
  // Custom auth redirect logic
  window.location.href = '/login';
});

// Errors are automatically reported to monitoring services in production
```

## Accessibility

- Error messages use appropriate ARIA labels
- Focus management for error states
- Screen reader compatible error announcements
- Keyboard navigation support for error actions

This error handling system provides a robust foundation for managing errors consistently across the application while maintaining a good user experience.