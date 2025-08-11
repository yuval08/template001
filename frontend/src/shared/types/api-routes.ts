/**
 * Template literal types for type-safe API route construction
 */

import type { UserId, ProjectId, FileId, ReportId, InvitationId } from './branded';

/**
 * Base API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  version: 'v1';
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API endpoint patterns using template literal types
 */
export type ApiEndpoint = 
  // Authentication endpoints
  | '/auth/login'
  | '/auth/logout'
  | '/auth/refresh'
  | '/auth/profile'
  
  // User endpoints
  | '/users'
  | '/users/:id'
  | `/users/${UserId}`
  | `/users/${UserId}/profile`
  | `/users/${UserId}/role`
  
  // Project endpoints
  | '/projects'
  | '/projects/:id'
  | `/projects/${ProjectId}`
  | `/projects/${ProjectId}/members`
  | `/projects/${ProjectId}/files`
  
  // File endpoints
  | '/files'
  | '/files/:id'
  | `/files/${FileId}`
  | `/files/${FileId}/download`
  | '/files/upload'
  
  // Report endpoints
  | '/reports'
  | '/reports/:id'
  | `/reports/${ReportId}`
  | `/reports/${ReportId}/download`
  | '/reports/generate'
  
  // Invitation endpoints
  | '/invitations'
  | `/invitations/${InvitationId}`
  | '/invitations/accept'
  | '/invitations/decline';

/**
 * Route parameter extraction utility
 */
export type ExtractRouteParams<T extends string> = 
  string extends T ? Record<string, string> :
  T extends `${string}/:${infer Param}/${infer Rest}` ? { [K in Param | keyof ExtractRouteParams<Rest>]: string } :
  T extends `${string}/:${infer Param}` ? { [K in Param]: string } :
  {};

/**
 * API route builder for type-safe route construction
 */
export class ApiRouteBuilder {
  constructor(private config: ApiConfig) {}

  /**
   * Build a complete API URL with type safety
   */
  build<T extends ApiEndpoint>(endpoint: T): string;
  build<T extends string>(endpoint: T, params: ExtractRouteParams<T>): string;
  build(endpoint: string, params?: Record<string, string>): string {
    let url = `${this.config.baseUrl}/api/${this.config.version}${endpoint}`;
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(value));
      });
    }
    
    return url;
  }

  /**
   * Build a route with query parameters
   */
  buildWithQuery<T extends ApiEndpoint>(
    endpoint: T,
    query?: Record<string, string | number | boolean>
  ): string {
    const baseUrl = this.build(endpoint);
    
    if (!query || Object.keys(query).length === 0) {
      return baseUrl;
    }
    
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    
    return `${baseUrl}?${searchParams.toString()}`;
  }
}

/**
 * Strongly typed API method configuration
 */
export interface ApiMethodConfig<TEndpoint extends ApiEndpoint = ApiEndpoint> {
  endpoint: TEndpoint;
  method: HttpMethod;
  requiresAuth?: boolean;
  timeout?: number;
}

/**
 * API method configurations with compile-time validation
 */
export const API_METHODS = {
  // Auth methods
  LOGIN: { endpoint: '/auth/login', method: 'POST', requiresAuth: false } as const,
  LOGOUT: { endpoint: '/auth/logout', method: 'POST', requiresAuth: true } as const,
  REFRESH_TOKEN: { endpoint: '/auth/refresh', method: 'POST', requiresAuth: false } as const,
  GET_PROFILE: { endpoint: '/auth/profile', method: 'GET', requiresAuth: true } as const,
  
  // User methods
  GET_USERS: { endpoint: '/users', method: 'GET', requiresAuth: true } as const,
  GET_USER: { endpoint: '/users/:id' as const, method: 'GET', requiresAuth: true } as const,
  CREATE_USER: { endpoint: '/users', method: 'POST', requiresAuth: true } as const,
  UPDATE_USER: { endpoint: '/users/:id' as const, method: 'PUT', requiresAuth: true } as const,
  DELETE_USER: { endpoint: '/users/:id' as const, method: 'DELETE', requiresAuth: true } as const,
  
  // Project methods
  GET_PROJECTS: { endpoint: '/projects', method: 'GET', requiresAuth: true } as const,
  GET_PROJECT: { endpoint: '/projects/:id' as const, method: 'GET', requiresAuth: true } as const,
  CREATE_PROJECT: { endpoint: '/projects', method: 'POST', requiresAuth: true } as const,
  UPDATE_PROJECT: { endpoint: '/projects/:id' as const, method: 'PUT', requiresAuth: true } as const,
  DELETE_PROJECT: { endpoint: '/projects/:id' as const, method: 'DELETE', requiresAuth: true } as const,
  
  // File methods
  GET_FILES: { endpoint: '/files', method: 'GET', requiresAuth: true } as const,
  GET_FILE: { endpoint: '/files/:id' as const, method: 'GET', requiresAuth: true } as const,
  UPLOAD_FILE: { endpoint: '/files/upload', method: 'POST', requiresAuth: true, timeout: 30000 } as const,
  DELETE_FILE: { endpoint: '/files/:id' as const, method: 'DELETE', requiresAuth: true } as const,
  
  // Report methods
  GET_REPORTS: { endpoint: '/reports', method: 'GET', requiresAuth: true } as const,
  GET_REPORT: { endpoint: '/reports/:id' as const, method: 'GET', requiresAuth: true } as const,
  GENERATE_REPORT: { endpoint: '/reports/generate', method: 'POST', requiresAuth: true, timeout: 60000 } as const,
  
  // Invitation methods
  GET_INVITATIONS: { endpoint: '/invitations', method: 'GET', requiresAuth: true } as const,
  CREATE_INVITATION: { endpoint: '/invitations', method: 'POST', requiresAuth: true } as const,
  ACCEPT_INVITATION: { endpoint: '/invitations/accept', method: 'POST', requiresAuth: false } as const,
  DECLINE_INVITATION: { endpoint: '/invitations/decline', method: 'POST', requiresAuth: false } as const
} satisfies Record<string, ApiMethodConfig>;

/**
 * Type-safe method for getting API configuration
 */
export function getApiMethod<K extends keyof typeof API_METHODS>(
  key: K
): typeof API_METHODS[K] {
  return API_METHODS[key];
}

/**
 * Utility types for API responses
 */
export type TypedApiResponse<T = unknown> = {
  data: T;
  success: true;
  message?: string;
  timestamp: string;
} | {
  success: false;
  error: string;
  errorCode: string;
  correlationId: string;
  timestamp: string;
  details?: Record<string, unknown>;
};

/**
 * Type predicate for successful API responses
 */
export function isSuccessResponse<T>(
  response: TypedApiResponse<T>
): response is TypedApiResponse<T> & { success: true } {
  return response.success === true;
}

/**
 * Type predicate for error API responses
 */
export function isErrorResponse<T>(
  response: TypedApiResponse<T>
): response is TypedApiResponse<T> & { success: false } {
  return response.success === false;
}