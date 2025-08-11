/**
 * Enhanced error types for frontend error handling
 */

export interface DetailedApiError {
  message: string;
  statusCode: number;
  errorCode: string;
  correlationId: string;
  errors?: Record<string, string[]>;
  details?: string;
  timestamp: string;
}

export interface NetworkError extends Error {
  type: 'NetworkError';
  isRetryable: boolean;
  statusCode?: number;
}

export interface ValidationError extends Error {
  type: 'ValidationError';
  errors: Record<string, string[]>;
  errorCode: string;
}

export interface BusinessError extends Error {
  type: 'BusinessError';
  errorCode: string;
  correlationId?: string;
}

export interface AuthenticationError extends Error {
  type: 'AuthenticationError';
  statusCode: 401 | 403;
}

export interface NotFoundError extends Error {
  type: 'NotFoundError';
  resource: string;
  resourceId?: string;
}

export interface ServerError extends Error {
  type: 'ServerError';
  statusCode: number;
  correlationId?: string;
  isRetryable: boolean;
}

export type AppError = 
  | NetworkError 
  | ValidationError 
  | BusinessError 
  | AuthenticationError 
  | NotFoundError 
  | ServerError;

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

/**
 * Error categories for grouping and handling
 */
export enum ErrorCategory {
  Network = 'network',
  Validation = 'validation',
  Authentication = 'authentication',
  Authorization = 'authorization',
  Business = 'business',
  Server = 'server',
  Client = 'client',
  Unknown = 'unknown',
}

/**
 * Error context for additional information
 */
export interface ErrorContext {
  userId?: string;
  url: string;
  method: string;
  userAgent: string;
  timestamp: string;
  correlationId?: string;
  additionalInfo?: Record<string, unknown>;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
    'EXTERNAL_SERVICE_UNAVAILABLE',
  ],
};