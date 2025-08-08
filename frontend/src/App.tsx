import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from './router';
import { useSignalR } from '@/hooks/useSignalR';
import { AuthProvider } from '@/providers/AuthProvider';
import '@/stores/themeStore'; // Initialize theme store

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SignalRProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </SignalRProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;