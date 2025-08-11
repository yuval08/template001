/**
 * Advanced TypeScript utility types for enhanced type safety and developer experience
 */

/**
 * Make specific properties required while keeping others optional
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional while keeping others required
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Strict version of Omit that ensures the keys exist in the source type
 */
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

/**
 * Strict version of Pick that ensures the keys exist in the source type
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * Extract non-nullable properties from a type
 */
export type NonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Create a type with all properties as readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Create a type with all properties as mutable recursively
 */
export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

/**
 * Create a type with all properties as optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Create a type with all properties as required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of a type that have values assignable to U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Extract keys of a type that have function values
 */
export type FunctionKeys<T> = KeysOfType<T, Function>;

/**
 * Extract keys of a type that have non-function values
 */
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

/**
 * Extract properties that are functions
 */
export type FunctionProperties<T> = Pick<T, FunctionKeys<T>>;

/**
 * Extract properties that are not functions
 */
export type NonFunctionProperties<T> = Pick<T, NonFunctionKeys<T>>;

/**
 * Create a union type from array values
 */
export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

/**
 * Create a union type from object values
 */
export type ValueOf<T> = T[keyof T];

/**
 * Create a type that allows either T or a Promise<T>
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Create a type that unwraps a Promise<T> to T
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Conditional types for enhanced type inference
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;

/**
 * Type-level equality check
 */
export type Equals<T, U> = T extends U ? (U extends T ? true : false) : false;

/**
 * Create a discriminated union helper
 */
export type DiscriminatedUnion<K extends PropertyKey, T extends Record<K, PropertyKey>> = {
  [P in T[K]]: T & Record<K, P>;
}[T[K]];

/**
 * Flatten a type to show all its properties in IntelliSense
 */
export type Flatten<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

/**
 * Create a type-safe enum from a const object
 */
export type Enum<T extends Record<keyof T, string | number>> = T[keyof T];

/**
 * Create a nominal type (similar to branded types but simpler)
 */
export type Nominal<T, K> = T & { __nominal: K };

/**
 * Create a type that excludes null and undefined but preserves the optional nature
 */
export type NonNullableOptional<T> = {
  [P in keyof T]: T[P] extends null | undefined ? never : T[P];
};

/**
 * JSON-serializable types
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Ensure a type is JSON-serializable
 */
export type EnsureJson<T> = T extends JsonValue ? T : never;

/**
 * Create a type that represents the result of a validation
 */
export type ValidationResult<T, E = string> = 
  | { success: true; data: T }
  | { success: false; errors: E[] };

/**
 * Create a type for API pagination parameters
 */
export interface UtilityPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create a type for paginated responses
 */
export interface UtilityPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Type guard utility creator
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Create a type that represents a factory function
 */
export type Factory<T, Args extends unknown[] = []> = (...args: Args) => T;

/**
 * Create a type that represents a builder pattern
 */
export type Builder<T> = {
  build(): T;
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => Builder<T>;
};

/**
 * Create a type for event handlers
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * Create a type for async event handlers
 */
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * Create a type that represents a state machine
 */
export type StateMachine<States extends string, Events extends string> = {
  currentState: States;
  transition: (event: Events) => States | null;
  canTransition: (event: Events) => boolean;
};

/**
 * Create a type for configuration objects with default values
 */
export type ConfigWithDefaults<T, D extends DeepPartial<T>> = T & D;

/**
 * Utility type to ensure exhaustive handling in switch statements
 */
export type Exhaustive<T> = T extends never ? T : never;

/**
 * Helper function for exhaustive checking
 */
export function assertExhaustive(value: never): never {
  throw new Error(`Unhandled case: ${value}`);
}

/**
 * Create a type that represents a cache entry
 */
export interface CacheEntry<T> {
  value: T;
  expiry: number;
  created: number;
}

/**
 * Create a type for retry options
 */
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffFactor?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}