import { useCallback, useEffect } from 'react';
import { useLoadingStore, LoadingPriority } from '@/stores';

export interface UseLoadingOptions {
  priority?: LoadingPriority;
  timeout?: number;
  autoStart?: boolean;
  metadata?: Record<string, any>;
}

export interface UseLoadingReturn {
  isLoading: boolean;
  start: (customKey?: string) => string;
  stop: (customKey?: string) => void;
  toggle: (customKey?: string) => void;
}

/**
 * Hook for managing loading states with automatic cleanup
 * 
 * @param key - The loading key identifier
 * @param options - Loading configuration options
 * @returns Loading state and control functions
 * 
 * @example
 * ```tsx
 * const { isLoading, start, stop } = useLoading('user-fetch', {
 *   priority: 'high',
 *   timeout: 30000
 * });
 * 
 * const handleFetch = async () => {
 *   start();
 *   try {
 *     await fetchUsers();
 *   } finally {
 *     stop();
 *   }
 * };
 * ```
 */
export function useLoading(
  key: string, 
  options: UseLoadingOptions = {}
): UseLoadingReturn {
  const { 
    priority = 'normal',
    timeout,
    autoStart = false,
    metadata 
  } = options;
  
  const store = useLoadingStore();
  
  const start = useCallback((customKey?: string) => {
    const loadingKey = customKey || key;
    return store.startLoading(loadingKey, {
      priority,
      timeout,
      metadata
    });
  }, [key, priority, timeout, metadata, store]);
  
  const stop = useCallback((customKey?: string) => {
    const loadingKey = customKey || key;
    store.stopLoading(loadingKey);
  }, [key, store]);
  
  const toggle = useCallback((customKey?: string) => {
    const loadingKey = customKey || key;
    if (store.isLoading(loadingKey)) {
      stop(loadingKey);
    } else {
      start(loadingKey);
    }
  }, [key, start, stop, store]);
  
  const isLoading = store.isLoading(key);
  
  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      const id = start();
      return () => stop();
    }
    return undefined;
  }, [autoStart, start, stop]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  
  return {
    isLoading,
    start,
    stop,
    toggle
  };
}

/**
 * Hook for checking global loading states
 * 
 * @returns Global loading state information
 * 
 * @example
 * ```tsx
 * const { globalLoading, criticalLoading } = useGlobalLoading();
 * 
 * if (criticalLoading) {
 *   return <CriticalLoadingOverlay />;
 * }
 * ```
 */
export function useGlobalLoading() {
  const globalLoading = useLoadingStore(state => state.globalLoading);
  const criticalLoading = useLoadingStore(state => state.criticalLoading);
  const items = useLoadingStore(state => state.items);
  
  const getLoadingByPriority = useCallback((priority: LoadingPriority) => {
    return Object.values(items).filter(item => item.priority === priority);
  }, [items]);
  
  const getLoadingByKey = useCallback((key: string) => {
    return Object.values(items).filter(item => item.key === key);
  }, [items]);
  
  return {
    globalLoading,
    criticalLoading,
    items,
    getLoadingByPriority,
    getLoadingByKey
  };
}

/**
 * Hook for managing loading state with React Query mutations
 * Automatically tracks mutation loading states
 * 
 * @param key - The loading key identifier
 * @param options - Loading configuration options
 * @returns Loading controls and React Query helpers
 * 
 * @example
 * ```tsx
 * const { mutationOptions } = useLoadingMutation('create-user', {
 *   priority: 'high'
 * });
 * 
 * const createUserMutation = useMutation({
 *   ...mutationOptions,
 *   mutationFn: createUser
 * });
 * ```
 */
export function useLoadingMutation(
  key: string,
  options: UseLoadingOptions = {}
) {
  const { start, stop, isLoading } = useLoading(key, options);
  
  const mutationOptions = {
    onMutate: () => {
      start();
    },
    onSettled: () => {
      stop();
    }
  };
  
  return {
    isLoading,
    start,
    stop,
    mutationOptions
  };
}

/**
 * Hook for managing loading state with React Query queries
 * Automatically tracks query loading states
 * 
 * @param key - The loading key identifier
 * @param enabled - Whether the query should run
 * @param options - Loading configuration options
 * @returns Loading controls and React Query helpers
 * 
 * @example
 * ```tsx
 * const { queryOptions } = useLoadingQuery('fetch-users', isAuthenticated, {
 *   priority: 'normal'
 * });
 * 
 * const usersQuery = useQuery({
 *   ...queryOptions,
 *   queryFn: fetchUsers
 * });
 * ```
 */
export function useLoadingQuery(
  key: string,
  enabled: boolean = true,
  options: UseLoadingOptions = {}
) {
  const { start, stop, isLoading } = useLoading(key, options);
  
  const queryOptions = {
    enabled,
    onSuccess: () => {
      stop();
    },
    onError: () => {
      stop();
    },
    onSettled: () => {
      stop();
    }
  };
  
  // Start loading when query is enabled
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
  }, [enabled, start, stop]);
  
  return {
    isLoading,
    start,
    stop,
    queryOptions
  };
}