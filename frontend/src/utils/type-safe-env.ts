/**
 * Type-safe environment variable access with validation and fallbacks
 */

import { isString, isNonNullable } from '@/shared/types/type-guards';
import type { Brand } from '@/shared/types/branded';

/**
 * Environment variable validation result
 */
type EnvValidationResult<T> = {
  success: true;
  value: T;
} | {
  success: false;
  error: string;
  key: string;
};

/**
 * Environment variable parser type
 */
type EnvParser<T> = (value: string) => T | null;

/**
 * Required environment variables with their types
 */
interface RequiredEnvVars {
  VITE_API_BASE_URL: string;
  VITE_OIDC_AUTHORITY: string;
  VITE_OIDC_CLIENT_ID: string;
  VITE_OIDC_REDIRECT_URI: string;
  VITE_OIDC_SCOPE: string;
  VITE_SIGNALR_URL: string;
}

/**
 * Optional environment variables with their types and defaults
 */
interface OptionalEnvVars {
  VITE_APP_TITLE: string;
  VITE_API_TIMEOUT: number;
  VITE_ENABLE_LOGGING: boolean;
  VITE_ENABLE_DEVTOOLS: boolean;
  VITE_MAX_FILE_SIZE: number;
  VITE_PAGINATION_SIZE: number;
  VITE_CACHE_TTL: number;
  VITE_RETRY_ATTEMPTS: number;
  VITE_ENABLE_ANALYTICS: boolean;
  VITE_SENTRY_DSN: string;
}

/**
 * Default values for optional environment variables
 */
const ENV_DEFAULTS: OptionalEnvVars = {
  VITE_APP_TITLE: 'Intranet Application',
  VITE_API_TIMEOUT: 30000,
  VITE_ENABLE_LOGGING: false,
  VITE_ENABLE_DEVTOOLS: false,
  VITE_MAX_FILE_SIZE: 10485760, // 10MB
  VITE_PAGINATION_SIZE: 20,
  VITE_CACHE_TTL: 300000, // 5 minutes
  VITE_RETRY_ATTEMPTS: 3,
  VITE_ENABLE_ANALYTICS: false,
  VITE_SENTRY_DSN: '',
};

/**
 * Environment variable parsers
 */
const parsers: Record<string, EnvParser<unknown>> = {
  string: (value: string) => value,
  number: (value: string) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },
  boolean: (value: string) => {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
    return null;
  },
  url: (value: string) => {
    try {
      new URL(value);
      return value;
    } catch {
      return null;
    }
  },
};

/**
 * Validate a required environment variable
 */
function validateRequired<K extends keyof RequiredEnvVars>(
  key: K,
  parser: EnvParser<RequiredEnvVars[K]>
): EnvValidationResult<RequiredEnvVars[K]> {
  const rawValue = import.meta.env[key];
  
  if (!isString(rawValue) || rawValue.trim() === '') {
    return {
      success: false,
      error: `Required environment variable ${key} is not set or is empty`,
      key,
    };
  }

  const parsedValue = parser(rawValue.trim());
  if (parsedValue === null) {
    return {
      success: false,
      error: `Required environment variable ${key} has invalid format`,
      key,
    };
  }

  return {
    success: true,
    value: parsedValue,
  };
}

/**
 * Validate an optional environment variable with default
 */
function validateOptional<K extends keyof OptionalEnvVars>(
  key: K,
  parser: EnvParser<OptionalEnvVars[K]>,
  defaultValue: OptionalEnvVars[K]
): EnvValidationResult<OptionalEnvVars[K]> {
  const rawValue = import.meta.env[key];
  
  if (!isString(rawValue) || rawValue.trim() === '') {
    return {
      success: true,
      value: defaultValue,
    };
  }

  const parsedValue = parser(rawValue.trim());
  if (parsedValue === null) {
    console.warn(`Optional environment variable ${key} has invalid format, using default`);
    return {
      success: true,
      value: defaultValue,
    };
  }

  return {
    success: true,
    value: parsedValue,
  };
}

/**
 * Complete environment configuration
 */
export type EnvConfig = RequiredEnvVars & OptionalEnvVars;

/**
 * Environment validation result for the complete config
 */
export type FullEnvValidationResult = {
  success: true;
  config: EnvConfig;
} | {
  success: false;
  errors: string[];
};

/**
 * Validate all environment variables
 */
function validateEnvironment(): FullEnvValidationResult {
  const errors: string[] = [];
  const config: Partial<EnvConfig> = {};

  // Validate required variables
  const requiredValidations: Array<[keyof RequiredEnvVars, EnvParser<unknown>]> = [
    ['VITE_API_BASE_URL', parsers.url!],
    ['VITE_OIDC_AUTHORITY', parsers.url!],
    ['VITE_OIDC_CLIENT_ID', parsers.string!],
    ['VITE_OIDC_REDIRECT_URI', parsers.url!],
    ['VITE_OIDC_SCOPE', parsers.string!],
    ['VITE_SIGNALR_URL', parsers.url!],
  ];

  for (const [key, parser] of requiredValidations) {
    const result = validateRequired(key, parser as EnvParser<RequiredEnvVars[typeof key]>);
    if (result.success) {
      (config as Record<string, unknown>)[key] = result.value;
    } else {
      errors.push(result.error);
    }
  }

  // Validate optional variables
  const optionalValidations: Array<[keyof OptionalEnvVars, EnvParser<unknown>]> = [
    ['VITE_APP_TITLE', parsers.string!],
    ['VITE_API_TIMEOUT', parsers.number!],
    ['VITE_ENABLE_LOGGING', parsers.boolean!],
    ['VITE_ENABLE_DEVTOOLS', parsers.boolean!],
    ['VITE_MAX_FILE_SIZE', parsers.number!],
    ['VITE_PAGINATION_SIZE', parsers.number!],
    ['VITE_CACHE_TTL', parsers.number!],
    ['VITE_RETRY_ATTEMPTS', parsers.number!],
    ['VITE_ENABLE_ANALYTICS', parsers.boolean!],
    ['VITE_SENTRY_DSN', parsers.string!],
  ];

  for (const [key, parser] of optionalValidations) {
    const defaultValue = ENV_DEFAULTS[key];
    const result = validateOptional(key, parser as EnvParser<OptionalEnvVars[typeof key]>, defaultValue);
    if (result.success) {
      (config as Record<string, unknown>)[key] = result.value;
    } else {
      errors.push(result.error);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, config: config as EnvConfig };
}

/**
 * Cached environment configuration
 */
let cachedEnvConfig: EnvConfig | null = null;

/**
 * Get validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  if (cachedEnvConfig !== null) {
    return cachedEnvConfig;
  }

  const validation = validateEnvironment();
  if (!validation.success) {
    const errorMessage = `Environment validation failed:\n${validation.errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  cachedEnvConfig = validation.config;
  return validation.config;
}

/**
 * Type-safe environment variable getter
 */
export function getEnv<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  const config = getEnvConfig();
  return config[key];
}

/**
 * Type-safe environment variable getter with fallback
 */
export function getEnvWithFallback<K extends keyof EnvConfig, F>(
  key: K,
  fallback: F
): EnvConfig[K] | F {
  try {
    return getEnv(key);
  } catch {
    return fallback;
  }
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.MODE === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.MODE === 'production';
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return import.meta.env.MODE === 'test';
}

/**
 * Get build information
 */
export interface BuildInfo {
  mode: string;
  timestamp: string;
  version: string;
}

export function getBuildInfo(): BuildInfo {
  return {
    mode: import.meta.env.MODE,
    timestamp: import.meta.env.VITE_BUILD_TIMESTAMP || new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
}

/**
 * Branded environment variable types
 */
export type ApiUrl = Brand<string, 'ApiUrl'>;
export type AuthorityUrl = Brand<string, 'AuthorityUrl'>;
export type ClientId = Brand<string, 'ClientId'>;
export type SignalRUrl = Brand<string, 'SignalRUrl'>;

/**
 * Type-safe branded environment variable getters
 */
export function getApiUrl(): ApiUrl {
  return getEnv('VITE_API_BASE_URL') as ApiUrl;
}

export function getAuthorityUrl(): AuthorityUrl {
  return getEnv('VITE_OIDC_AUTHORITY') as AuthorityUrl;
}

export function getClientId(): ClientId {
  return getEnv('VITE_OIDC_CLIENT_ID') as ClientId;
}

export function getSignalRUrl(): SignalRUrl {
  return getEnv('VITE_SIGNALR_URL') as SignalRUrl;
}

/**
 * Validate environment on module load in development
 */
if (isDevelopment()) {
  try {
    getEnvConfig();
    console.log('✅ Environment validation passed');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
  }
}

/**
 * Export validated environment configuration for use in other modules
 */
export const ENV = getEnvConfig();