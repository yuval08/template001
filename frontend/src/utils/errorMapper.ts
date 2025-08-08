import { AppError, ErrorCategory, ErrorSeverity } from '@/shared/types/errors';

/**
 * User-friendly error messages mapped from technical error codes
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection and try again.',
  'TIMEOUT_ERROR': 'The request took too long to complete. Please try again.',
  'CONNECTION_REFUSED': 'Cannot connect to the server. Please try again later.',

  // Authentication errors
  'UNAUTHORIZED': 'Your session has expired. Please log in again.',
  'INVALID_CREDENTIALS': 'Invalid username or password. Please try again.',
  'ACCESS_DENIED': 'You don\'t have permission to access this resource.',
  'INSUFFICIENT_PERMISSIONS': 'You don\'t have the required permissions for this action.',

  // Validation errors
  'VALIDATION_ERROR': 'Please correct the highlighted fields and try again.',
  'FIELD_REQUIRED': 'This field is required.',
  'INVALID_FORMAT': 'The format of this field is invalid.',
  'INVALID_EMAIL': 'Please enter a valid email address.',
  'INVALID_LENGTH': 'The length of this field is invalid.',
  'INVALID_RANGE': 'The value is outside the allowed range.',
  'DUPLICATE_VALUE': 'This value already exists.',

  // Business logic errors
  'ENTITY_NOT_FOUND': 'The requested item could not be found.',
  'ENTITY_ALREADY_EXISTS': 'An item with this information already exists.',
  'BUSINESS_RULE_VIOLATION': 'This action violates business rules.',
  'INVALID_OPERATION': 'This operation is not allowed in the current state.',
  'DUPLICATE_OPERATION': 'This operation has already been performed.',
  'RESOURCE_LIMIT_EXCEEDED': 'You have reached the maximum limit for this resource.',

  // Server errors
  'INTERNAL_ERROR': 'An unexpected error occurred. Please try again later.',
  'SERVER_ERROR': 'Server error occurred. Our team has been notified.',
  'EXTERNAL_SERVICE_UNAVAILABLE': 'An external service is currently unavailable. Please try again later.',
  'CONFIGURATION_ERROR': 'System configuration error. Please contact support.',

  // File operation errors
  'FILE_STORE_ERROR': 'Error occurred while processing the file.',
  'FILE_NOT_FOUND': 'The requested file could not be found.',
  'INVALID_FILE_TYPE': 'This file type is not supported.',
  'INVALID_FILE_SIZE': 'The file size exceeds the maximum allowed limit.',

  // Generic fallbacks
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
};

/**
 * Recovery suggestions for different error types
 */
export const RECOVERY_SUGGESTIONS: Record<string, string[]> = {
  'NETWORK_ERROR': [
    'Check your internet connection',
    'Try refreshing the page',
    'Contact support if the problem persists'
  ],
  'TIMEOUT_ERROR': [
    'Try the operation again',
    'Check your internet connection',
    'Try again in a few minutes'
  ],
  'UNAUTHORIZED': [
    'Log in again',
    'Clear your browser cache',
    'Contact support if you continue having issues'
  ],
  'ACCESS_DENIED': [
    'Contact your administrator for access',
    'Verify you have the correct permissions',
    'Try logging out and back in'
  ],
  'VALIDATION_ERROR': [
    'Review the highlighted fields',
    'Ensure all required information is provided',
    'Check the format of your inputs'
  ],
  'SERVER_ERROR': [
    'Try again in a few minutes',
    'Refresh the page',
    'Contact support if the error persists'
  ],
  'FILE_STORE_ERROR': [
    'Try uploading the file again',
    'Check the file size and format',
    'Contact support if the problem continues'
  ],
};

/**
 * Error categorization for different handling strategies
 */
export function categorizeError(error: AppError): ErrorCategory {
  if (error.type === 'NetworkError') return ErrorCategory.Network;
  if (error.type === 'ValidationError') return ErrorCategory.Validation;
  if (error.type === 'AuthenticationError') return ErrorCategory.Authentication;
  if (error.type === 'BusinessError') return ErrorCategory.Business;
  if (error.type === 'ServerError') return ErrorCategory.Server;
  if (error.type === 'NotFoundError') return ErrorCategory.Client;
  
  return ErrorCategory.Unknown;
}

/**
 * Determine error severity for appropriate UI treatment
 */
export function determineErrorSeverity(error: AppError): ErrorSeverity {
  switch (error.type) {
    case 'ValidationError':
      return ErrorSeverity.Low;
    case 'BusinessError':
    case 'NotFoundError':
      return ErrorSeverity.Medium;
    case 'AuthenticationError':
    case 'ServerError':
      return ErrorSeverity.High;
    case 'NetworkError':
      return ErrorSeverity.Medium;
    default:
      return ErrorSeverity.Medium;
  }
}

/**
 * Get user-friendly error message from error object
 */
export function getUserFriendlyMessage(error: AppError): string {
  // Try to get error code specific message
  const errorCode = 'errorCode' in error ? error.errorCode : error.type.toUpperCase();
  
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  // Fall back to error type based message
  const typeBasedMessage = ERROR_MESSAGES[error.type.toUpperCase()];
  if (typeBasedMessage) {
    return typeBasedMessage;
  }

  // Use the original error message if it's user-friendly (not too technical)
  if (error.message && !isTechnicalMessage(error.message)) {
    return error.message;
  }

  // Final fallback
  return ERROR_MESSAGES['UNKNOWN_ERROR'] || 'An unexpected error occurred';
}

/**
 * Get recovery suggestions for an error
 */
export function getRecoverySuggestions(error: AppError): string[] {
  const errorCode = 'errorCode' in error ? error.errorCode : error.type.toUpperCase();
  
  if (errorCode && RECOVERY_SUGGESTIONS[errorCode]) {
    return RECOVERY_SUGGESTIONS[errorCode];
  }

  const typeBasedSuggestions = RECOVERY_SUGGESTIONS[error.type.toUpperCase()];
  if (typeBasedSuggestions) {
    return typeBasedSuggestions;
  }

  // Default suggestions
  return [
    'Try the operation again',
    'Refresh the page',
    'Contact support if the problem persists'
  ];
}

/**
 * Check if a message appears to be technical (not user-friendly)
 */
function isTechnicalMessage(message: string): boolean {
  const technicalIndicators = [
    'HTTP',
    'fetch',
    'Promise',
    'undefined',
    'null',
    'NaN',
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'at Object.',
    'at async',
    'stack trace',
  ];

  return technicalIndicators.some(indicator => 
    message.toLowerCase().includes(indicator.toLowerCase())
  );
}

/**
 * Get validation error messages in a user-friendly format
 */
export function formatValidationErrors(errors: Record<string, string[]>): string[] {
  const messages: string[] = [];
  
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    const fieldName = formatFieldName(field);
    fieldErrors.forEach(error => {
      // If error already mentions the field, use as-is
      if (error.toLowerCase().includes(field.toLowerCase())) {
        messages.push(error);
      } else {
        // Prepend field name to the error
        messages.push(`${fieldName}: ${error}`);
      }
    });
  });

  return messages;
}

/**
 * Format field name for user display
 */
function formatFieldName(fieldName: string): string {
  // Convert camelCase or snake_case to readable format
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Error message configuration for different contexts
 */
export interface ErrorMessageConfig {
  showTechnicalDetails: boolean;
  showRecoverySuggestions: boolean;
  showCorrelationId: boolean;
  maxMessageLength: number;
}

/**
 * Get formatted error information for display
 */
export function getErrorDisplayInfo(error: AppError, config?: Partial<ErrorMessageConfig>) {
  const fullConfig: ErrorMessageConfig = {
    showTechnicalDetails: process.env.NODE_ENV === 'development',
    showRecoverySuggestions: true,
    showCorrelationId: true,
    maxMessageLength: 200,
    ...config,
  };

  const userMessage = getUserFriendlyMessage(error);
  const suggestions = fullConfig.showRecoverySuggestions ? getRecoverySuggestions(error) : [];
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error);
  const correlationId = 'correlationId' in error ? error.correlationId : undefined;

  return {
    message: userMessage.length > fullConfig.maxMessageLength 
      ? userMessage.substring(0, fullConfig.maxMessageLength) + '...' 
      : userMessage,
    suggestions,
    category,
    severity,
    correlationId: fullConfig.showCorrelationId ? correlationId : undefined,
    technicalDetails: fullConfig.showTechnicalDetails ? {
      type: error.type,
      originalMessage: error.message,
      stack: error.stack,
    } : undefined,
  };
}