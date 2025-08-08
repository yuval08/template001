/**
 * Type guard utilities for runtime type validation and type safety
 */

/**
 * Primitive type guards
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number => 
  typeof value === 'number' && !Number.isNaN(value);

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isFunction = (value: unknown): value is Function => typeof value === 'function';

export const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);

export const isNull = (value: unknown): value is null => value === null;

export const isUndefined = (value: unknown): value is undefined => value === undefined;

export const isNullOrUndefined = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

export const isNonNullable = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

/**
 * Advanced type guards
 */
export const isDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

export const isError = (value: unknown): value is Error =>
  value instanceof Error;

export const isPromise = <T = unknown>(value: unknown): value is Promise<T> =>
  isObject(value) && isFunction((value as any).then);

export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;

/**
 * JSON type guards
 */
export const isJsonPrimitive = (value: unknown): value is string | number | boolean | null =>
  isString(value) || isNumber(value) || isBoolean(value) || isNull(value);

export const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  isObject(value) && Object.keys(value).every(isString);

export const isJsonArray = (value: unknown): value is unknown[] =>
  isArray(value);

export const isJsonValue = (value: unknown): value is 
  | string 
  | number 
  | boolean 
  | null 
  | Record<string, unknown>
  | unknown[] => {
  if (isJsonPrimitive(value)) return true;
  if (isJsonArray(value)) return value.every(isJsonValue);
  if (isJsonObject(value)) return Object.values(value).every(isJsonValue);
  return false;
};

/**
 * API response type guards
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  details?: Record<string, unknown>;
}

export const isApiSuccessResponse = <T>(
  response: unknown
): response is ApiSuccessResponse<T> =>
  isObject(response) && 
  'success' in response && 
  response.success === true &&
  'data' in response;

export const isApiErrorResponse = (response: unknown): response is ApiErrorResponse =>
  isObject(response) &&
  'success' in response &&
  response.success === false &&
  'error' in response &&
  isString(response.error);

/**
 * Email validation type guard
 */
export const isValidEmail = (value: unknown): value is string =>
  isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * URL validation type guard
 */
export const isValidUrl = (value: unknown): value is string => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * UUID validation type guard
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string =>
  isString(value) && UUID_REGEX.test(value);

/**
 * File type validation type guards
 */
export const isFile = (value: unknown): value is File => value instanceof File;

export const isBlob = (value: unknown): value is Blob => value instanceof Blob;

export const isFormData = (value: unknown): value is FormData => 
  value instanceof FormData;

/**
 * HTTP status validation type guards
 */
export const isSuccessStatus = (status: unknown): status is number =>
  isNumber(status) && status >= 200 && status < 300;

export const isClientErrorStatus = (status: unknown): status is number =>
  isNumber(status) && status >= 400 && status < 500;

export const isServerErrorStatus = (status: unknown): status is number =>
  isNumber(status) && status >= 500 && status < 600;

/**
 * Environment type guards
 */
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const isTest = (): boolean => process.env.NODE_ENV === 'test';

/**
 * Generic object property existence checks
 */
export const hasProperty = <T extends PropertyKey>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> =>
  isObject(obj) && prop in obj;

export const hasProperties = <T extends PropertyKey>(
  obj: unknown,
  ...props: T[]
): obj is Record<T, unknown> =>
  isObject(obj) && props.every(prop => prop in obj);

/**
 * Array type guards with element validation
 */
export const isArrayOf = <T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] =>
  isArray(value) && value.every(guard);

export const isNonEmptyArray = <T>(value: T[]): value is [T, ...T[]] =>
  value.length > 0;

/**
 * Form validation type guards
 */
export interface FormData {
  [key: string]: string | number | boolean | File | undefined;
}

export const isValidFormData = (value: unknown): value is FormData =>
  isObject(value) && 
  Object.values(value).every(val => 
    isString(val) || 
    isNumber(val) || 
    isBoolean(val) || 
    isFile(val) || 
    isUndefined(val)
  );

/**
 * Pagination type guards
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const isValidPaginationMeta = (value: unknown): value is PaginationMeta =>
  isObject(value) &&
  hasProperties(value, 'page', 'limit', 'total', 'totalPages') &&
  isNumber(value.page) && value.page > 0 &&
  isNumber(value.limit) && value.limit > 0 &&
  isNumber(value.total) && value.total >= 0 &&
  isNumber(value.totalPages) && value.totalPages >= 0;

/**
 * Error type guards
 */
export const isNetworkError = (error: unknown): error is Error & { code?: string } =>
  isError(error) && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    (isObject(error) && 'code' in error && error.code === 'NETWORK_ERROR')
  );

export const isTimeoutError = (error: unknown): error is Error =>
  isError(error) && (
    error.message.includes('timeout') ||
    error.name === 'TimeoutError'
  );

/**
 * DOM type guards
 */
export const isElement = (value: unknown): value is Element =>
  value instanceof Element;

export const isHTMLElement = (value: unknown): value is HTMLElement =>
  value instanceof HTMLElement;

export const isInputElement = (value: unknown): value is HTMLInputElement =>
  value instanceof HTMLInputElement;

/**
 * Utility to create custom type guards with validation
 */
export function createTypeGuard<T>(
  validator: (value: unknown) => boolean,
  errorMessage?: string
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    const isValid = validator(value);
    if (!isValid && errorMessage && isDevelopment()) {
      console.warn(`Type guard validation failed: ${errorMessage}`, value);
    }
    return isValid;
  };
}

/**
 * Compose multiple type guards with AND logic
 */
export function andTypeGuards<T, U>(
  guard1: (value: unknown) => value is T,
  guard2: (value: unknown) => value is U
): (value: unknown) => value is T & U {
  return (value: unknown): value is T & U =>
    guard1(value) && guard2(value);
}

/**
 * Compose multiple type guards with OR logic
 */
export function orTypeGuards<T, U>(
  guard1: (value: unknown) => value is T,
  guard2: (value: unknown) => value is U
): (value: unknown) => value is T | U {
  return (value: unknown): value is T | U =>
    guard1(value) || guard2(value);
}

/**
 * Negated type guard
 */
export function notTypeGuard<T>(
  guard: (value: unknown) => value is T
): (value: unknown) => boolean {
  return (value: unknown): boolean => !guard(value);
}

/**
 * Type assertion with error throwing
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage = 'Type assertion failed'
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(errorMessage);
  }
}