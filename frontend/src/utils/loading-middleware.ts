import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query';
import { loadingActions, LoadingPriority } from '@/stores';

export interface LoadingMiddlewareOptions {
  /**
   * Default priority for loading operations
   */
  defaultPriority?: LoadingPriority;
  
  /**
   * Timeout for loading operations (in milliseconds)
   */
  defaultTimeout?: number;
  
  /**
   * Whether to track query loading states
   */
  trackQueries?: boolean;
  
  /**
   * Whether to track mutation loading states
   */
  trackMutations?: boolean;
  
  /**
   * Function to generate loading keys from query/mutation keys
   */
  keyGenerator?: (key: readonly unknown[]) => string;
  
  /**
   * Filter to determine which queries/mutations to track
   */
  shouldTrack?: (key: readonly unknown[], meta?: Record<string, any>) => boolean;
}

const defaultOptions: Required<LoadingMiddlewareOptions> = {
  defaultPriority: 'normal',
  defaultTimeout: 30000, // 30 seconds
  trackQueries: true,
  trackMutations: true,
  keyGenerator: (key: readonly unknown[]) => [...key].join(':'),
  shouldTrack: () => true
};

/**
 * Creates React Query middleware for automatic loading state tracking
 */
export function createLoadingMiddleware(options: LoadingMiddlewareOptions = {}) {
  const config = { ...defaultOptions, ...options };
  
  const queryCache = new QueryCache({
    onSuccess: (data, query) => {
      if (!config.trackQueries) return;
      
      const key = config.keyGenerator([...query.queryKey]);
      if (config.shouldTrack([...query.queryKey], query.meta)) {
        loadingActions.stopLoading(key);
      }
    },
    
    onError: (error, query) => {
      if (!config.trackQueries) return;
      
      const key = config.keyGenerator([...query.queryKey]);
      if (config.shouldTrack([...query.queryKey], query.meta)) {
        loadingActions.stopLoading(key);
      }
    },
    
    onSettled: (data, error, query) => {
      if (!config.trackQueries) return;
      
      const key = config.keyGenerator([...query.queryKey]);
      if (config.shouldTrack([...query.queryKey], query.meta)) {
        loadingActions.stopLoading(key);
      }
    }
  });
  
  const mutationCache = new MutationCache({
    onMutate: (variables, mutation) => {
      if (!config.trackMutations) return;
      
      const key = config.keyGenerator([...(mutation.options.mutationKey || ['mutation'])]);
      if (config.shouldTrack([...(mutation.options.mutationKey || [])], mutation.meta)) {
        const priority = (mutation.meta?.loadingPriority as LoadingPriority) || config.defaultPriority;
        const timeout = (mutation.meta?.loadingTimeout as number) || config.defaultTimeout;
        
        loadingActions.startLoading(key, {
          priority,
          timeout,
          metadata: {
            type: 'mutation',
            variables,
            mutationKey: mutation.options.mutationKey
          }
        });
      }
    },
    
    onSuccess: (data, variables, context, mutation) => {
      if (!config.trackMutations) return;
      
      const key = config.keyGenerator([...(mutation.options.mutationKey || ['mutation'])]);
      if (config.shouldTrack([...(mutation.options.mutationKey || [])], mutation.meta)) {
        loadingActions.stopLoading(key);
      }
    },
    
    onError: (error, variables, context, mutation) => {
      if (!config.trackMutations) return;
      
      const key = config.keyGenerator([...(mutation.options.mutationKey || ['mutation'])]);
      if (config.shouldTrack([...(mutation.options.mutationKey || [])], mutation.meta)) {
        loadingActions.stopLoading(key);
      }
    },
    
    onSettled: (data, error, variables, context, mutation) => {
      if (!config.trackMutations) return;
      
      const key = config.keyGenerator([...(mutation.options.mutationKey || ['mutation'])]);
      if (config.shouldTrack([...(mutation.options.mutationKey || [])], mutation.meta)) {
        loadingActions.stopLoading(key);
      }
    }
  });
  
  return {
    queryCache,
    mutationCache,
    
    /**
     * Creates a QueryClient with loading middleware configured
     */
    createQueryClient: (queryClientOptions: { defaultOptions?: any } = {}) => {
      return new QueryClient({
        queryCache,
        mutationCache,
        defaultOptions: {
          queries: {
            // Add default query options
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            ...(queryClientOptions.defaultOptions?.queries || {})
          },
          mutations: {
            // Add default mutation options
            retry: 1,
            ...(queryClientOptions.defaultOptions?.mutations || {})
          }
        },
        ...queryClientOptions
      });
    }
  };
}

/**
 * Enhanced query/mutation options with loading tracking
 */
export interface LoadingTrackingOptions {
  /**
   * Loading priority for this operation
   */
  loadingPriority?: LoadingPriority;
  
  /**
   * Timeout for this operation
   */
  loadingTimeout?: number;
  
  /**
   * Whether to track loading for this operation
   */
  trackLoading?: boolean;
  
  /**
   * Custom loading key
   */
  loadingKey?: string;
}

/**
 * Helper function to add loading tracking to query options
 */
export function withLoadingTracking<T extends Record<string, any>>(
  queryOptions: T,
  loadingOptions: LoadingTrackingOptions = {}
): T {
  const {
    loadingPriority = 'normal',
    loadingTimeout = 30000,
    trackLoading = true,
    loadingKey
  } = loadingOptions;
  
  if (!trackLoading) {
    return queryOptions;
  }
  
  const key = loadingKey || (queryOptions.queryKey ? 
    Array.isArray(queryOptions.queryKey) ? queryOptions.queryKey.join(':') : String(queryOptions.queryKey) :
    'unknown'
  );
  
  return {
    ...queryOptions,
    meta: {
      ...queryOptions.meta,
      loadingPriority,
      loadingTimeout,
      loadingKey: key
    },
    onMutate: (variables: any) => {
      // Start loading for mutations
      if (queryOptions.mutationKey || queryOptions.mutationFn) {
        loadingActions.startLoading(key, {
          priority: loadingPriority,
          timeout: loadingTimeout,
          metadata: { type: 'mutation', variables }
        });
      }
      
      return queryOptions.onMutate?.(variables);
    },
    onSuccess: (data: any, variables?: any, context?: any) => {
      // Stop loading on success
      loadingActions.stopLoading(key);
      return queryOptions.onSuccess?.(data, variables, context);
    },
    onError: (error: any, variables?: any, context?: any) => {
      // Stop loading on error
      loadingActions.stopLoading(key);
      return queryOptions.onError?.(error, variables, context);
    },
    onSettled: (data: any, error: any, variables?: any, context?: any) => {
      // Ensure loading is stopped
      loadingActions.stopLoading(key);
      return queryOptions.onSettled?.(data, error, variables, context);
    }
  };
}

/**
 * Default loading middleware instance
 */
export const loadingMiddleware = createLoadingMiddleware();

/**
 * Default QueryClient with loading tracking
 */
export const queryClientWithLoading = loadingMiddleware.createQueryClient();