import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler } from '../errorHandler';
import { toast } from '@/stores/toastStore';
import { NetworkError, ValidationError, BusinessError } from '@/shared/types/errors';

// Mock the toast store
vi.mock('@/stores/toastStore', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    networkError: vi.fn(),
    authError: vi.fn(),
    serverError: vi.fn(),
    validationError: vi.fn(),
    clearErrors: vi.fn(),
  },
}));

// Mock console methods
const originalConsole = global.console;
beforeEach(() => {
  global.console = {
    ...originalConsole,
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };
  vi.clearAllMocks();
});

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
  });

  describe('handleError', () => {
    it('should handle network errors correctly', () => {
      const networkError = new Error('Network failed') as NetworkError;
      networkError.type = 'NetworkError';
      networkError.isRetryable = true;

      errorHandler.handleError(networkError);

      expect(toast.networkError).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Network Error:', expect.any(Object));
    });

    it('should handle validation errors correctly', () => {
      const validationError = new Error('Validation failed') as ValidationError;
      validationError.type = 'ValidationError';
      validationError.errorCode = 'VALIDATION_ERROR';
      validationError.errors = {
        email: ['Email is required'],
        password: ['Password too short'],
      };

      errorHandler.handleValidationError(validationError);

      expect(toast.validationError).toHaveBeenCalledWith(
        'Please correct the following errors:',
        ['Email: Email is required', 'Password: Password too short'],
        expect.any(Number)
      );
    });

    it('should handle business errors correctly', () => {
      const businessError = new Error('Business rule violated') as BusinessError;
      businessError.type = 'BusinessError';
      businessError.errorCode = 'BUSINESS_RULE_VIOLATION';

      errorHandler.handleError(businessError);

      expect(toast.warning).toHaveBeenCalledWith(
        'Business Rule Violation',
        expect.stringContaining('Business rule violated'),
        expect.any(Number)
      );
    });

    it('should normalize regular errors to AppErrors', () => {
      const regularError = new Error('Regular error');

      errorHandler.handleError(regularError);

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Application Error:', expect.any(Object));
    });

    it('should handle string errors', () => {
      const stringError = 'Something went wrong';

      errorHandler.handleError(stringError);

      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it('should handle unknown error types', () => {
      const unknownError = { weird: 'object' };

      errorHandler.handleError(unknownError);

      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('error logging', () => {
    it('should log errors with appropriate levels', () => {
      const validationError = new Error('Validation failed') as ValidationError;
      validationError.type = 'ValidationError';

      errorHandler.handleError(validationError);

      expect(console.warn).toHaveBeenCalledWith('Validation Error:', expect.any(Object));
    });

    it('should include context in error logs', () => {
      const error = new Error('Test error');

      errorHandler.handleError(error);

      expect(console.error).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          message: 'Test error',
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          url: expect.any(String),
        })
      );
    });
  });

  describe('authentication error handling', () => {
    it('should clear errors and set redirect timeout for auth errors', () => {
      vi.useFakeTimers();
      const mockRedirect = vi.fn();
      errorHandler.setAuthRedirectCallback(mockRedirect);

      const authError = new Error('Unauthorized') as any;
      authError.type = 'AuthenticationError';
      authError.statusCode = 401;

      errorHandler.handleError(authError);

      expect(toast.clearErrors).toHaveBeenCalled();
      expect(toast.authError).toHaveBeenCalled();

      // Fast-forward time to trigger redirect
      vi.advanceTimersByTime(2000);

      expect(mockRedirect).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});