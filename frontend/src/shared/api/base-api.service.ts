import { ApiError } from '@/shared/types/api';
import { AppError, NetworkError, ValidationError, BusinessError, AuthenticationError, NotFoundError, ServerError, DEFAULT_RETRY_CONFIG, RetryConfig, ErrorContext } from '@/shared/types/errors';
import { toast } from '@/stores/toastStore';

/**
 * Base API service class providing common HTTP functionality with enhanced error handling
 * All entity-specific services should extend this class
 */
export class BaseApiService {
  protected readonly baseURL: string;
  private retryConfig: RetryConfig;
  private requestInterceptors: Array<(request: RequestInit) => RequestInit | Promise<RequestInit>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(baseURL?: string, retryConfig?: Partial<RetryConfig>) {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Add request interceptor
   */
  public addRequestInterceptor(interceptor: (request: RequestInit) => RequestInit | Promise<RequestInit>) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  public addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Get authentication headers for API requests
   * Uses cookie-based authentication
   */
  protected getAuthHeaders(): Record<string, string> {
    const correlationId = this.generateCorrelationId();
    return {
      'Content-Type': 'application/json',
      'X-Correlation-Id': correlationId,
    };
  }

  /**
   * Generate correlation ID for request tracking
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create error context for logging and reporting
   */
  private createErrorContext(url: string, method: string): ErrorContext {
    return {
      url,
      method,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Enhanced error processing with proper error types
   */
  private createAppError(response: Response, errorData: any, context: ErrorContext): AppError {
    const { status } = response;
    const message = errorData.message || `HTTP ${status}: ${response.statusText}`;
    const errorCode = errorData.errorCode || 'UNKNOWN_ERROR';
    const correlationId = errorData.correlationId || response.headers.get('X-Correlation-Id');

    switch (status) {
      case 400:
        if (errorData.errors && Object.keys(errorData.errors).length > 0) {
          const error = new Error(message) as ValidationError;
          error.type = 'ValidationError';
          error.errors = errorData.errors;
          error.errorCode = errorCode;
          return error;
        }
        
        const businessError = new Error(message) as BusinessError;
        businessError.type = 'BusinessError';
        businessError.errorCode = errorCode;
        businessError.correlationId = correlationId;
        return businessError;

      case 401:
        const authError = new Error(message) as AuthenticationError;
        authError.type = 'AuthenticationError';
        authError.statusCode = 401;
        return authError;

      case 403:
        const forbiddenError = new Error(message) as AuthenticationError;
        forbiddenError.type = 'AuthenticationError';
        forbiddenError.statusCode = 403;
        return forbiddenError;

      case 404:
        const notFoundError = new Error(message) as NotFoundError;
        notFoundError.type = 'NotFoundError';
        notFoundError.resource = errorData.resource || 'Resource';
        notFoundError.resourceId = errorData.resourceId;
        return notFoundError;

      case 408:
      case 429:
      case 500:
      case 502:
      case 503:
      case 504:
        const serverError = new Error(message) as ServerError;
        serverError.type = 'ServerError';
        serverError.statusCode = status;
        serverError.correlationId = correlationId;
        serverError.isRetryable = [408, 429, 502, 503, 504].includes(status);
        return serverError;

      default:
        const unknownError = new Error(message) as ServerError;
        unknownError.type = 'ServerError';
        unknownError.statusCode = status;
        unknownError.correlationId = correlationId;
        unknownError.isRetryable = false;
        return unknownError;
    }
  }

  /**
   * Handle API response and error processing with enhanced error types
   */
  protected async handleResponse<T>(response: Response, context: ErrorContext): Promise<T> {
    // Apply response interceptors
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    if (!processedResponse.ok) {
      const errorData = await processedResponse.json().catch(() => ({}));
      const error = this.createAppError(processedResponse, errorData, context);
      
      // Log error for debugging
      console.error('API Error:', error, { context, errorData });
      
      throw error;
    }

    try {
      return await processedResponse.json();
    } catch (parseError) {
      // Handle cases where response is not JSON
      return processedResponse as unknown as T;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: AppError): boolean {
    if ('isRetryable' in error && error.isRetryable) return true;
    if (error.type === 'NetworkError' && error.isRetryable) return true;
    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with enhanced error handling, retry logic, and interceptors
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const context = this.createErrorContext(url, method);

    // Apply request interceptors
    let config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }

    return this.executeWithRetry(url, config, context);
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(url: string, config: RequestInit, context: ErrorContext): Promise<T> {
    let lastError: AppError | null = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        return await this.handleResponse<T>(response, context);
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = new Error('Network request failed') as NetworkError;
          networkError.type = 'NetworkError';
          networkError.isRetryable = true;
          lastError = networkError;
        } else if (error instanceof Error) {
          lastError = error as AppError;
        } else {
          const unknownError = new Error('Unknown error occurred') as ServerError;
          unknownError.type = 'ServerError';
          unknownError.statusCode = 0;
          unknownError.isRetryable = false;
          lastError = unknownError;
        }

        // Check if we should retry
        const shouldRetry = attempt < this.retryConfig.maxAttempts && this.isRetryableError(lastError);
        
        if (shouldRetry) {
          const delay = this.calculateRetryDelay(attempt);
          console.warn(`Request failed (attempt ${attempt}/${this.retryConfig.maxAttempts}). Retrying in ${delay}ms...`, {
            error: lastError,
            url,
            attempt,
          });
          
          await this.sleep(delay);
          continue;
        } else {
          // Final attempt failed or error is not retryable
          break;
        }
      }
    }

    // All retries exhausted, throw the last error
    if (lastError) {
      throw lastError;
    }

    // This should never happen, but just in case
    throw new Error('Request failed for unknown reasons');
  }

  /**
   * GET request
   */
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * File upload request with enhanced error handling
   */
  protected async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const context = this.createErrorContext(url, 'POST');

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
          'X-Correlation-Id': this.generateCorrelationId(),
        },
      });

      return this.handleResponse<T>(response, context);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error('Failed to upload file: Network error') as NetworkError;
        networkError.type = 'NetworkError';
        networkError.isRetryable = true;
        throw networkError;
      }
      
      throw error;
    }
  }

  /**
   * File download request with enhanced error handling
   */
  protected async downloadFile(endpoint: string): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`;
    const context = this.createErrorContext(url, 'GET');

    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = this.createAppError(response, errorData, context);
        throw error;
      }

      return response.blob();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error('Failed to download file: Network error') as NetworkError;
        networkError.type = 'NetworkError';
        networkError.isRetryable = true;
        throw networkError;
      }
      
      throw error;
    }
  }
}