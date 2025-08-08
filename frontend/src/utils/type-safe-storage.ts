/**
 * Type-safe local storage utilities with validation and error handling
 */

import { isJsonValue, isString, isNonNullable } from '@/shared/types/type-guards';
import type { ValidationResult, TypeGuard } from '@/shared/types/utility-types';

/**
 * Storage operation result
 */
export type StorageResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code: StorageErrorCode };

/**
 * Storage error codes
 */
export enum StorageErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_FORMAT = 'INVALID_FORMAT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Storage configuration
 */
export interface StorageConfig<T> {
  key: string;
  validator?: TypeGuard<T>;
  defaultValue?: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  expirationMs?: number;
}

/**
 * Stored value with metadata
 */
interface StoredValue<T> {
  data: T;
  timestamp: number;
  expirationMs?: number;
  version: number;
}

/**
 * Default serialization and deserialization
 */
const DEFAULT_SERIALIZE = <T>(value: T): string => JSON.stringify(value);
const DEFAULT_DESERIALIZE = <T>(value: string): T => JSON.parse(value) as T;

/**
 * Storage version for data migration
 */
const STORAGE_VERSION = 1;

/**
 * Type-safe storage class
 */
export class TypeSafeStorage<T> {
  private readonly key: string;
  private readonly validator?: TypeGuard<T>;
  private readonly defaultValue?: T;
  private readonly serialize: (value: T) => string;
  private readonly deserialize: (value: string) => T;
  private readonly expirationMs?: number;

  constructor(config: StorageConfig<T>) {
    this.key = config.key;
    this.validator = config.validator;
    this.defaultValue = config.defaultValue;
    this.serialize = config.serialize || DEFAULT_SERIALIZE;
    this.deserialize = config.deserialize || DEFAULT_DESERIALIZE;
    this.expirationMs = config.expirationMs;
  }

  /**
   * Get value from storage with type safety
   */
  get(): StorageResult<T> {
    try {
      if (!this.isStorageSupported()) {
        return {
          success: false,
          error: 'Local storage is not supported',
          code: StorageErrorCode.NOT_SUPPORTED,
        };
      }

      const rawValue = localStorage.getItem(this.key);
      if (rawValue === null) {
        if (this.defaultValue !== undefined) {
          return { success: true, data: this.defaultValue };
        }
        return {
          success: false,
          error: `No value found for key: ${this.key}`,
          code: StorageErrorCode.NOT_FOUND,
        };
      }

      let storedValue: StoredValue<T>;
      try {
        storedValue = JSON.parse(rawValue) as StoredValue<T>;
      } catch {
        return {
          success: false,
          error: `Invalid JSON format for key: ${this.key}`,
          code: StorageErrorCode.INVALID_FORMAT,
        };
      }

      // Check expiration
      if (storedValue.expirationMs && storedValue.timestamp + storedValue.expirationMs < Date.now()) {
        this.remove(); // Clean up expired value
        if (this.defaultValue !== undefined) {
          return { success: true, data: this.defaultValue };
        }
        return {
          success: false,
          error: `Expired value for key: ${this.key}`,
          code: StorageErrorCode.NOT_FOUND,
        };
      }

      // Validate data if validator is provided
      if (this.validator && !this.validator(storedValue.data)) {
        return {
          success: false,
          error: `Validation failed for key: ${this.key}`,
          code: StorageErrorCode.VALIDATION_ERROR,
        };
      }

      return { success: true, data: storedValue.data };
    } catch (error) {
      return {
        success: false,
        error: `Error reading from storage: ${error}`,
        code: StorageErrorCode.SERIALIZATION_ERROR,
      };
    }
  }

  /**
   * Set value in storage with type safety
   */
  set(value: T): StorageResult<void> {
    try {
      if (!this.isStorageSupported()) {
        return {
          success: false,
          error: 'Local storage is not supported',
          code: StorageErrorCode.NOT_SUPPORTED,
        };
      }

      // Validate value if validator is provided
      if (this.validator && !this.validator(value)) {
        return {
          success: false,
          error: `Validation failed for value`,
          code: StorageErrorCode.VALIDATION_ERROR,
        };
      }

      const storedValue: StoredValue<T> = {
        data: value,
        timestamp: Date.now(),
        expirationMs: this.expirationMs,
        version: STORAGE_VERSION,
      };

      const serialized = JSON.stringify(storedValue);
      
      try {
        localStorage.setItem(this.key, serialized);
        return { success: true, data: undefined };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          return {
            success: false,
            error: 'Storage quota exceeded',
            code: StorageErrorCode.QUOTA_EXCEEDED,
          };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: `Error writing to storage: ${error}`,
        code: StorageErrorCode.SERIALIZATION_ERROR,
      };
    }
  }

  /**
   * Remove value from storage
   */
  remove(): void {
    if (this.isStorageSupported()) {
      localStorage.removeItem(this.key);
    }
  }

  /**
   * Check if value exists in storage
   */
  exists(): boolean {
    return this.isStorageSupported() && localStorage.getItem(this.key) !== null;
  }

  /**
   * Update value using a function
   */
  update(updater: (current: T) => T): StorageResult<T> {
    const currentResult = this.get();
    if (!currentResult.success) {
      return currentResult;
    }

    const newValue = updater(currentResult.data);
    const setResult = this.set(newValue);
    
    if (!setResult.success) {
      return setResult;
    }

    return { success: true, data: newValue };
  }

  /**
   * Clear all expired values (utility method)
   */
  static clearExpired(): void {
    if (!TypeSafeStorage.isStorageSupported()) return;

    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const rawValue = localStorage.getItem(key);
        if (!rawValue) continue;

        const storedValue = JSON.parse(rawValue) as StoredValue<unknown>;
        if (storedValue.expirationMs && 
            storedValue.timestamp + storedValue.expirationMs < Date.now()) {
          keysToRemove.push(key);
        }
      } catch {
        // Ignore invalid JSON
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!TypeSafeStorage.isStorageSupported()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }

    // Estimate total storage (typically 5-10MB for localStorage)
    const estimated = 5 * 1024 * 1024; // 5MB estimate
    const percentage = (used / estimated) * 100;

    return {
      used,
      available: estimated - used,
      percentage: Math.min(percentage, 100),
    };
  }

  /**
   * Check if storage is supported
   */
  private isStorageSupported(): boolean {
    return TypeSafeStorage.isStorageSupported();
  }

  /**
   * Static method to check storage support
   */
  static isStorageSupported(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a typed storage instance
 */
export function createStorage<T>(config: StorageConfig<T>): TypeSafeStorage<T> {
  return new TypeSafeStorage(config);
}

/**
 * Commonly used storage instances
 */

// User preferences storage
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  pageSize: number;
  enableNotifications: boolean;
}

export const userPreferencesStorage = createStorage<UserPreferences>({
  key: 'user-preferences',
  defaultValue: {
    theme: 'system',
    language: 'en',
    sidebarCollapsed: false,
    pageSize: 20,
    enableNotifications: true,
  },
  validator: (value): value is UserPreferences =>
    typeof value === 'object' &&
    value !== null &&
    ['light', 'dark', 'system'].includes((value as UserPreferences).theme) &&
    typeof (value as UserPreferences).language === 'string' &&
    typeof (value as UserPreferences).sidebarCollapsed === 'boolean' &&
    typeof (value as UserPreferences).pageSize === 'number' &&
    typeof (value as UserPreferences).enableNotifications === 'boolean',
});

// Auth token storage (with expiration)
export const authTokenStorage = createStorage<string>({
  key: 'auth-token',
  validator: isString,
  expirationMs: 24 * 60 * 60 * 1000, // 24 hours
});

// Recent searches storage
export const recentSearchesStorage = createStorage<string[]>({
  key: 'recent-searches',
  defaultValue: [],
  validator: (value): value is string[] =>
    Array.isArray(value) && value.every(isString),
  expirationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Draft data storage
export interface DraftData {
  id: string;
  type: 'project' | 'user' | 'report';
  data: Record<string, unknown>;
  lastModified: number;
}

export const draftDataStorage = createStorage<DraftData[]>({
  key: 'draft-data',
  defaultValue: [],
  validator: (value): value is DraftData[] =>
    Array.isArray(value) && value.every(item =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      ['project', 'user', 'report'].includes(item.type) &&
      typeof item.data === 'object' &&
      typeof item.lastModified === 'number'
    ),
  expirationMs: 30 * 24 * 60 * 60 * 1000, // 30 days
});

// Cache storage for API responses
export interface CacheEntry<T = unknown> {
  data: T;
  expiry: number;
}

export function createCacheStorage<T>(key: string, ttl: number = 5 * 60 * 1000) {
  return createStorage<CacheEntry<T>>({
    key: `cache-${key}`,
    validator: (value): value is CacheEntry<T> =>
      typeof value === 'object' &&
      value !== null &&
      'data' in value &&
      'expiry' in value &&
      typeof value.expiry === 'number',
    expirationMs: ttl,
  });
}

/**
 * Utility to migrate storage data between versions
 */
export function migrateStorage<T, U>(
  oldStorage: TypeSafeStorage<T>,
  newStorage: TypeSafeStorage<U>,
  migrator: (oldData: T) => U
): boolean {
  const oldResult = oldStorage.get();
  if (!oldResult.success) {
    return false;
  }

  const newData = migrator(oldResult.data);
  const newResult = newStorage.set(newData);
  
  if (newResult.success) {
    oldStorage.remove();
    return true;
  }
  
  return false;
}