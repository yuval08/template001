import { BaseApiService } from './base-api.service';
import { errorHandler } from '@/utils/errorHandler';
import { AppError } from '@/shared/types/errors';

/**
 * Factory for creating API service instances with global error handling
 */
export class ApiServiceFactory {
  private static instance: ApiServiceFactory;

  private constructor() {}

  public static getInstance(): ApiServiceFactory {
    if (!ApiServiceFactory.instance) {
      ApiServiceFactory.instance = new ApiServiceFactory();
    }
    return ApiServiceFactory.instance;
  }

  /**
   * Create an API service instance with global error handling interceptors
   */
  createApiService(baseURL?: string): BaseApiService {
    const service = new BaseApiService(baseURL);

    // Add global request interceptor for auth redirect handling
    service.addRequestInterceptor(async (request) => {
      // You can add global request modifications here
      return request;
    });

    // Add global response interceptor for error handling
    service.addResponseInterceptor(async (response) => {
      if (!response.ok) {
        // Let the service handle the error creation and throwing
        // The error will be caught and handled by our global error handler
        return response;
      }

      return response;
    });

    return service;
  }

  /**
   * Configure global error handler with auth redirect
   */
  configureErrorHandler(authRedirectCallback: () => void) {
    errorHandler.setAuthRedirectCallback(authRedirectCallback);
  }
}

// Export singleton instance
export const apiServiceFactory = ApiServiceFactory.getInstance();

/**
 * Create a configured API service instance
 */
export function createApiService(baseURL?: string): BaseApiService {
  return apiServiceFactory.createApiService(baseURL);
}