/**
 * Network retry utilities for handling failed requests due to connectivity issues
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number;
  
  /**
   * Base delay between attempts in milliseconds
   * @default 1000
   */
  baseDelay?: number;
  
  /**
   * Maximum delay between attempts in milliseconds
   * @default 30000
   */
  maxDelay?: number;
  
  /**
   * Exponential backoff multiplier
   * @default 2
   */
  backoffMultiplier?: number;
  
  /**
   * Whether to add random jitter to delays
   * @default true
   */
  jitter?: boolean;
  
  /**
   * Function to determine if an error should trigger a retry
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  
  /**
   * Callback function called before each retry attempt
   */
  onRetry?: (error: Error, attempt: number) => void;
  
  /**
   * Callback function called when all retries are exhausted
   */
  onRetryExhausted?: (error: Error) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Default retry condition - retry on network errors and 5xx server errors
 */
const defaultShouldRetry = (error: Error, attempt: number): boolean => {
  // Don't retry after max attempts
  if (attempt >= 3) return false;
  
  // Retry on network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Retry on specific HTTP status codes
  if ('status' in error) {
    const status = (error as any).status;
    return status >= 500 || status === 408 || status === 429;
  }
  
  return false;
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
const calculateDelay = (
  attempt: number, 
  baseDelay: number, 
  maxDelay: number, 
  backoffMultiplier: number, 
  jitter: boolean
): number => {
  const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
  const delay = Math.min(exponentialDelay, maxDelay);
  
  if (jitter) {
    // Add random jitter ±25%
    const jitterAmount = delay * 0.25;
    return delay + (Math.random() - 0.5) * 2 * jitterAmount;
  }
  
  return delay;
};

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
    shouldRetry = defaultShouldRetry,
    onRetry,
    onRetryExhausted,
  } = options;

  const startTime = Date.now();
  let lastError: Error = new Error('Unknown error');
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      if (attempt >= maxAttempts || !shouldRetry(lastError, attempt)) {
        break;
      }
      
      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, baseDelay, maxDelay, backoffMultiplier, jitter);
      
      // Call retry callback
      onRetry?.(lastError, attempt);
      
      console.warn(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms:`, lastError.message);
      
      // Wait before next attempt
      await sleep(delay);
    }
  }

  // All retries exhausted
  onRetryExhausted?.(lastError);
  
  return {
    success: false,
    error: lastError,
    attempts: attempt,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Retry wrapper for fetch requests with network-aware logic
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  const result = await withRetry(
    async () => {
      const response = await fetch(url, init);
      
      // Check if response indicates a retryable error
      if (!response.ok && response.status >= 500) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }
      
      return response;
    },
    {
      ...retryOptions,
      shouldRetry: (error, attempt) => {
        // Custom retry logic for fetch requests
        if (!navigator.onLine) {
          // Don't retry if offline
          return false;
        }
        
        // Use custom retry logic if provided, otherwise use default
        return retryOptions?.shouldRetry 
          ? retryOptions.shouldRetry(error, attempt)
          : defaultShouldRetry(error, attempt);
      },
      onRetry: (error, attempt) => {
        console.log(`🔄 Retrying request to ${url} (attempt ${attempt}):`, error.message);
        retryOptions?.onRetry?.(error, attempt);
      },
    }
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data!;
}

/**
 * Hook for using retry functionality in React components
 */
import { useState, useCallback } from 'react';

export interface UseRetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
}

export const useRetry = () => {
  const [retryState, setRetryState] = useState<UseRetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  });

  const executeWithRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> => {
    setRetryState(prev => ({ ...prev, isRetrying: true, lastError: null }));

    const result = await withRetry(fn, {
      ...options,
      onRetry: (error, attempt) => {
        setRetryState(prev => ({ 
          ...prev, 
          retryCount: attempt,
          lastError: error,
        }));
        options?.onRetry?.(error, attempt);
      },
    });

    setRetryState(prev => ({
      ...prev,
      isRetrying: false,
      retryCount: result.attempts,
      lastError: result.error || null,
    }));

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }, []);

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
    });
  }, []);

  return {
    ...retryState,
    executeWithRetry,
    reset,
  };
};

/**
 * Create a retry-aware version of an API service method
 */
export function withRetryMethod<TArgs extends any[], TReturn>(
  method: (...args: TArgs) => Promise<TReturn>,
  retryOptions?: RetryOptions
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const result = await withRetry(
      () => method(...args),
      retryOptions
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  };
}