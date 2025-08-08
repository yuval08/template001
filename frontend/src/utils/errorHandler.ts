import { AppError } from '@/shared/types/errors';
import { getErrorDisplayInfo, formatValidationErrors, ErrorMessageConfig } from './errorMapper';
import { toast } from '@/stores/toastStore';

/**
 * Global error handling options
 */
export interface ErrorHandlingOptions {
  showToast?: boolean;
  logError?: boolean;
  redirectOnAuth?: boolean;
  showRecovery?: boolean;
  toastDuration?: number;
  messageConfig?: Partial<ErrorMessageConfig>;
}

/**
 * Default error handling options
 */
const DEFAULT_ERROR_OPTIONS: Required<ErrorHandlingOptions> = {
  showToast: true,
  logError: true,
  redirectOnAuth: true,
  showRecovery: true,
  toastDuration: 6000,
  messageConfig: {},
};

/**
 * Global error handler - main entry point for handling all application errors
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private authRedirectCallback?: () => void;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Set callback for authentication redirects
   */
  setAuthRedirectCallback(callback: () => void) {
    this.authRedirectCallback = callback;
  }

  /**
   * Handle any application error with comprehensive error processing
   */
  handleError(error: unknown, options?: Partial<ErrorHandlingOptions>): void {
    const opts = { ...DEFAULT_ERROR_OPTIONS, ...options };
    const appError = this.normalizeError(error);

    if (opts.logError) {
      this.logError(appError);
    }

    if (opts.showToast) {
      this.showErrorToast(appError, opts);
    }

    if (opts.redirectOnAuth && appError.type === 'AuthenticationError') {
      this.handleAuthenticationError();
    }
  }

  /**
   * Handle API errors specifically (called from API interceptors)
   */
  handleApiError(error: AppError, options?: Partial<ErrorHandlingOptions>): void {
    this.handleError(error, options);
  }

  /**
   * Handle validation errors with field-specific formatting
   */
  handleValidationError(error: AppError, options?: Partial<ErrorHandlingOptions>): void {
    if (error.type !== 'ValidationError') {
      this.handleError(error, options);
      return;
    }

    const opts = { ...DEFAULT_ERROR_OPTIONS, ...options };
    const validationErrors = 'errors' in error ? error.errors : {};
    const formattedErrors = formatValidationErrors(validationErrors);

    if (opts.logError) {
      console.error('Validation Error:', error, { validationErrors });
    }

    if (opts.showToast) {
      toast.validationError(
        'Please correct the following errors:',
        formattedErrors,
        opts.toastDuration
      );
    }
  }

  /**
   * Handle network errors with retry suggestions
   */
  handleNetworkError(error: AppError, options?: Partial<ErrorHandlingOptions>): void {
    if (error.type !== 'NetworkError') {
      this.handleError(error, options);
      return;
    }

    const opts = { ...DEFAULT_ERROR_OPTIONS, ...options };

    if (opts.logError) {
      console.error('Network Error:', error);
    }

    if (opts.showToast) {
      toast.networkError(opts.toastDuration);
    }
  }

  /**
   * Normalize any error to AppError format
   */
  private normalizeError(error: unknown): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      // Convert regular Error to AppError
      const appError = error as AppError;
      appError.type = 'ServerError';
      return appError;
    }

    // Handle string errors or unknown types
    const fallbackError = new Error(
      typeof error === 'string' ? error : 'An unknown error occurred'
    ) as AppError;
    fallbackError.type = 'ServerError';
    return fallbackError;
  }

  /**
   * Check if error is already an AppError
   */
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'type' in error;
  }

  /**
   * Log error with appropriate level and context
   */
  private logError(error: AppError): void {
    const context = {
      type: error.type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    switch (error.type) {
      case 'ValidationError':
        console.warn('Validation Error:', context);
        break;
      case 'NetworkError':
        console.error('Network Error:', context);
        break;
      case 'AuthenticationError':
        console.warn('Authentication Error:', context);
        break;
      case 'ServerError':
        console.error('Server Error:', context);
        break;
      default:
        console.error('Application Error:', context);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, context);
    }
  }

  /**
   * Show appropriate toast notification for error
   */
  private showErrorToast(error: AppError, options: Required<ErrorHandlingOptions>): void {
    const displayInfo = getErrorDisplayInfo(error, options.messageConfig);

    const description = options.showRecovery && displayInfo.suggestions.length > 0
      ? `${displayInfo.message}\n\nSuggestions:\n• ${displayInfo.suggestions.join('\n• ')}`
      : displayInfo.message;

    switch (error.type) {
      case 'ValidationError':
        if ('errors' in error && error.errors) {
          this.handleValidationError(error, options);
        } else {
          toast.error({ title: 'Validation Error', description, duration: options.toastDuration });
        }
        break;

      case 'NetworkError':
        toast.networkError(options.toastDuration);
        break;

      case 'AuthenticationError':
        toast.authError(options.toastDuration);
        break;

      case 'ServerError':
        const correlationId = 'correlationId' in error ? error.correlationId : undefined;
        toast.serverError(correlationId, options.toastDuration);
        break;

      case 'BusinessError':
        toast.warning({ title: 'Business Rule Violation', description: displayInfo.message, duration: options.toastDuration });
        break;

      case 'NotFoundError':
        toast.error({ title: 'Not Found', description: displayInfo.message, duration: options.toastDuration });
        break;

      default:
        toast.error({ title: 'Error', description: displayInfo.message, duration: options.toastDuration });
    }
  }

  /**
   * Handle authentication errors with redirect
   */
  private handleAuthenticationError(): void {
    // Clear any existing toasts to avoid clutter
    toast.clearErrors();
    
    // Show auth error toast
    toast.authError(8000);

    // Redirect to login after a delay
    setTimeout(() => {
      if (this.authRedirectCallback) {
        this.authRedirectCallback();
      } else {
        window.location.href = '/login';
      }
    }, 2000);
  }

  /**
   * Report error to external monitoring service
   */
  private async reportErrorToService(error: AppError, context: any): Promise<void> {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      // For now, just send to a custom endpoint
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          error: {
            type: error.type,
            message: error.message,
            stack: error.stack,
          },
          context,
        }),
      }).catch(() => {
        // Silently fail if error reporting fails
        console.debug('Failed to report error to monitoring service');
      });
    } catch (reportingError) {
      console.debug('Error reporting failed:', reportingError);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

/**
 * Convenience function for handling errors throughout the app
 */
export function handleError(error: unknown, options?: Partial<ErrorHandlingOptions>): void {
  errorHandler.handleError(error, options);
}

/**
 * Hook for handling errors in React components
 */
export function useErrorHandler() {
  return {
    handleError: (error: unknown, options?: Partial<ErrorHandlingOptions>) => 
      errorHandler.handleError(error, options),
    handleApiError: (error: AppError, options?: Partial<ErrorHandlingOptions>) => 
      errorHandler.handleApiError(error, options),
    handleValidationError: (error: AppError, options?: Partial<ErrorHandlingOptions>) => 
      errorHandler.handleValidationError(error, options),
    handleNetworkError: (error: AppError, options?: Partial<ErrorHandlingOptions>) => 
      errorHandler.handleNetworkError(error, options),
  };
}

/**
 * Error boundary helper for React components
 */
export function createErrorHandler(options?: Partial<ErrorHandlingOptions>) {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    errorHandler.handleError(error, {
      ...options,
      logError: true, // Always log errors from error boundaries
    });
  };
}