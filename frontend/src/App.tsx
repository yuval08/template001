import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from './router';
import { useSignalR } from '@/hooks/useSignalR';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { errorHandler, createErrorHandler } from '@/utils/errorHandler';
import { StoreProvider } from '@/stores/providers/StoreProvider';
import { GlobalLoadingIndicator } from '@/components/ui/global-loading-indicator';
import { createLoadingMiddleware } from '@/utils/loading-middleware';

// Create loading middleware with optimized settings
const loadingMiddleware = createLoadingMiddleware({
  defaultPriority: 'normal',
  defaultTimeout: 30000,
  trackQueries: true,
  trackMutations: true,
});

// Enhanced query client with loading middleware and error handling
export const queryClient = loadingMiddleware.createQueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: any) => {
        // Don't retry on authentication errors
        if (error?.type === 'AuthenticationError') return false;
        // Don't retry on validation errors
        if (error?.type === 'ValidationError') return false;
        // Don't retry on business errors
        if (error?.type === 'BusinessError') return false;
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: 'always', // Always check if data needs refresh on mount
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for this duration
      gcTime: 10 * 60 * 1000, // 10 minutes - keep cache for this duration (formerly cacheTime)
      networkMode: 'offlineFirst', // Use cache first, then network
    },
    mutations: {
      retry: (failureCount: number, error: any) => {
        // Similar retry logic for mutations
        if (error?.type === 'AuthenticationError') return false;
        if (error?.type === 'ValidationError') return false;
        if (error?.type === 'BusinessError') return false;
        return failureCount < 1; // Only retry once for mutations
      },
    },
  },
});

// SignalR initialization component
const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSignalR(); // Initialize SignalR connection
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary 
      onError={createErrorHandler({ 
        showToast: true, 
        logError: true 
      })}
    >
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SignalRProvider>
              <RouterProvider router={router} />
              <GlobalLoadingIndicator />
              <ReactQueryDevtools initialIsOpen={false} />
            </SignalRProvider>
          </AuthProvider>
        </QueryClientProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
}

export default App;