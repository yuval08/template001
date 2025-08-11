# Network Status & Offline Detection System

This document describes the comprehensive network status and offline detection system implemented in the application.

## Overview

The network status system provides real-time monitoring of internet connectivity, automatic retry mechanisms for failed requests, and graceful offline state handling to ensure a robust user experience even with unstable network conditions.

## Components

### 1. Network Status Hook (`useNetworkStatus`)

**Location**: `src/hooks/useNetworkStatus.ts`

A comprehensive React hook that monitors network connectivity and provides detailed connection information.

#### Features:
- **Real-time connectivity monitoring** using browser `online`/`offline` events
- **Connection quality detection** using Network Information API
- **Periodic connectivity verification** with actual server pings
- **Detailed connection metrics** (speed, latency, connection type)
- **Human-readable status descriptions**

#### Usage:
```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const MyComponent = () => {
  const { 
    isOnline, 
    isSlowConnection,
    effectiveType,
    getConnectionDescription,
    checkConnectivity 
  } = useNetworkStatus();
  
  // Use connection status in your component logic
};
```

#### Return Values:
- `isOnline: boolean` - Current online/offline status
- `isSlowConnection: boolean` - Whether connection is considered slow
- `connectionType: string | null` - Connection type (wifi, cellular, etc.)
- `effectiveType: string | null` - Effective connection type (slow-2g, 2g, 3g, 4g)
- `downlink: number | null` - Download speed in Mbps
- `rtt: number | null` - Round-trip time in milliseconds
- `lastOnlineAt: Date | null` - Timestamp of last online state
- `lastOfflineAt: Date | null` - Timestamp of last offline state
- `checkConnectivity(): Promise<boolean>` - Manual connectivity check
- `getConnectionDescription(): string` - Human-readable status

### 2. Network Status Indicator (`NetworkStatusIndicator`)

**Location**: `src/components/NetworkStatusIndicator.tsx`

Visual indicators that show the current network status to users.

#### Components:

##### `NetworkStatusIndicator`
- **Compact mode**: Icon-only indicator with tooltip
- **Detailed mode**: Full status display with badges and retry button
- **Responsive design** with appropriate colors and icons

##### `NetworkStatusBanner`
- **Critical offline notifications** displayed at the top of the application
- **Automatic retry functionality** with progress indicators
- **Dismissible** for temporary offline states

#### Usage:
```typescript
// Compact indicator (for topbar)
<NetworkStatusIndicator />

// Detailed indicator with retry button
<NetworkStatusIndicator 
  showDetails={true} 
  showRetryButton={true}
  onRetry={handleRetry}
/>

// Critical offline banner
<NetworkStatusBanner 
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

### 3. Offline App Lock (`OfflineAppLock`)

**Location**: `src/components/OfflineAppLock.tsx`

A full-screen overlay that appears when the application goes offline for extended periods, preventing user frustration and data loss.

#### Features:
- **Configurable delay** before showing the lock screen
- **Optional offline mode** for limited functionality
- **Automatic dismissal** when connection is restored
- **Retry functionality** with connectivity testing
- **Offline duration tracking** and troubleshooting tips

#### Usage:
```typescript
<OfflineAppLock 
  lockDelay={10000} // 10 seconds
  allowOfflineMode={true}
  customMessage="Connection lost. Please check your internet."
  onRetryActions={async () => {
    // Custom actions when coming back online
    await refreshData();
  }}
  onContinueOffline={() => {
    // Handle offline mode activation
    setOfflineMode(true);
  }}
/>
```

#### Hook: `useOfflineAppLock`
```typescript
const { isLocked, isInOfflineMode, continueOffline, unlock } = useOfflineAppLock({
  enabled: true,
  lockDelay: 5000,
  allowOfflineMode: false
});
```

### 4. Network Retry Utilities (`networkRetry`)

**Location**: `src/utils/networkRetry.ts`

Comprehensive retry mechanisms for handling transient network failures.

#### Features:
- **Exponential backoff** with configurable delays
- **Jitter support** to prevent thundering herd problems
- **Custom retry conditions** based on error types
- **Network-aware retries** (don't retry when offline)
- **Comprehensive logging** and error reporting

#### Core Functions:

##### `withRetry<T>(fn, options): Promise<RetryResult<T>>`
Generic retry wrapper for any async function:
```typescript
const result = await withRetry(
  () => apiCall(),
  {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    shouldRetry: (error, attempt) => error.name === 'NetworkError'
  }
);
```

##### `fetchWithRetry(url, init?, retryOptions?): Promise<Response>`
Retry-enabled fetch wrapper:
```typescript
const response = await fetchWithRetry('/api/data', {
  method: 'POST',
  body: JSON.stringify(data)
}, {
  maxAttempts: 5,
  onRetry: (error, attempt) => {
    console.log(`Retrying request (${attempt}/5):`, error.message);
  }
});
```

##### `useRetry()` Hook
React hook for retry functionality:
```typescript
const { isRetrying, retryCount, lastError, executeWithRetry, reset } = useRetry();

const handleSubmit = async () => {
  try {
    await executeWithRetry(() => submitForm(), { maxAttempts: 3 });
  } catch (error) {
    console.error('Form submission failed after retries:', error);
  }
};
```

## Integration Points

### 1. Main Layout Integration

The network status system is integrated at the application layout level:

```typescript
// src/components/layout/Layout.tsx
export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Network Status Banner for critical offline states */}
      <NetworkStatusBanner onRetry={handleRetryActions} />
      
      {/* Offline App Lock for extended offline periods */}
      <OfflineAppLock 
        lockDelay={10000}
        allowOfflineMode={true}
        onRetryActions={handleRetryActions}
      />
      
      {/* Rest of layout */}
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar /> {/* Contains NetworkStatusIndicator */}
          <main>{/* Page content */}</main>
        </div>
      </div>
    </div>
  );
};
```

### 2. API Service Integration

The existing `BaseApiService` has been enhanced to work with the network status system:

```typescript
// src/shared/api/base-api.service.ts
private isRetryableError(error: AppError): boolean {
  // Don't retry if we're offline
  if (!navigator.onLine) return false;
  
  if ('isRetryable' in error && error.isRetryable) return true;
  if (error.type === 'NetworkError' && error.isRetryable) return true;
  return false;
}
```

This prevents unnecessary retry attempts when the application is offline, improving performance and user experience.

## Configuration

### Network Status Hook Configuration

The `useNetworkStatus` hook is self-configuring but includes several built-in parameters:

- **Connectivity verification interval**: 30 seconds
- **Connectivity test timeout**: 5 seconds
- **Slow connection threshold**: < 1 Mbps or > 2000ms RTT

### Offline App Lock Configuration

Default configuration values:
- **Lock delay**: 10 seconds
- **Allow offline mode**: `true` for read-only operations
- **Retry attempts**: Unlimited (user-initiated)

### Retry Configuration

Default retry parameters:
- **Max attempts**: 3
- **Base delay**: 1000ms
- **Max delay**: 30000ms
- **Backoff multiplier**: 2x
- **Jitter**: ±25%

## Error Handling

The network status system provides comprehensive error handling:

### Error Types Detected:
1. **Network errors** - Complete loss of connectivity
2. **Slow connection warnings** - Performance degradation alerts
3. **Server errors** - 5xx responses that may be network-related
4. **Timeout errors** - Request timeouts due to poor connectivity

### Error Recovery Strategies:
1. **Automatic retries** with exponential backoff
2. **User-initiated retries** through UI controls  
3. **Graceful degradation** to offline mode when possible
4. **Clear user communication** about network issues

## Best Practices

### For Developers

1. **Always use the network status hook** in components that make API calls
2. **Implement offline fallbacks** for critical functionality
3. **Show appropriate loading states** during network operations
4. **Provide retry mechanisms** for failed operations
5. **Test offline scenarios** during development

### For Users

The system provides clear guidance to users through:
- **Visual status indicators** in the interface
- **Informative error messages** with troubleshooting tips
- **Retry buttons** for failed operations
- **Offline mode options** when appropriate

## Testing

### Manual Testing Scenarios

1. **Disconnect network** - Verify offline detection and UI updates
2. **Reconnect network** - Verify automatic recovery and retry functionality
3. **Simulate slow connection** - Use browser dev tools to throttle network
4. **Server unavailability** - Test retry behavior with server errors

### Browser Dev Tools

Use Chrome DevTools Network tab:
- **Offline** - Simulate complete network loss
- **Slow 3G/Fast 3G** - Test slow connection detection
- **Add latency** - Test timeout and retry behavior

## Future Enhancements

Potential improvements to the network status system:

1. **Service Worker integration** for true offline functionality
2. **Background sync** for queuing operations while offline
3. **Progressive Web App features** for better offline experience
4. **Analytics integration** for network performance monitoring
5. **User preference storage** for retry and offline mode settings

## Troubleshooting

### Common Issues

1. **False offline detection**
   - Verify CORS configuration for health check endpoint
   - Check if `/api/health` endpoint is accessible

2. **Retry loops**
   - Ensure offline detection is working correctly
   - Verify retry conditions are properly configured

3. **UI not updating**
   - Check that components are using the network status hook
   - Verify event listeners are properly attached

### Debug Information

The system provides comprehensive logging:
- Network status changes are logged to console
- Retry attempts are logged with detailed information
- Connection quality metrics are available for debugging

Enable debug logging by setting localStorage flag:
```javascript
localStorage.setItem('debug-network', 'true');
```