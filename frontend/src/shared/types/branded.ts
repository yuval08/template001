/**
 * Branded type utilities for enhanced type safety
 * Creates opaque types that prevent value mixing between similar primitive types
 */

/**
 * Creates a branded type by attaching a phantom brand property
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/**
 * Utility to create a branded value with runtime validation
 */
export interface BrandValidator<T, B extends string> {
  (value: T): Brand<T, B> | null;
  is: (value: unknown) => value is Brand<T, B>;
  unsafe: (value: T) => Brand<T, B>;
}

/**
 * Factory function to create branded type validators
 */
export function createBrandValidator<T, B extends string>(
  brand: B,
  validator: (value: T) => boolean
): BrandValidator<T, B> {
  const brandValidator = (value: T): Brand<T, B> | null => {
    return validator(value) ? (value as Brand<T, B>) : null;
  };

  brandValidator.is = (value: unknown): value is Brand<T, B> => {
    return typeof value === typeof ({} as T) && validator(value as T);
  };

  brandValidator.unsafe = (value: T): Brand<T, B> => {
    return value as Brand<T, B>;
  };

  return brandValidator;
}

// Commonly used branded types
export type UserId = Brand<string, 'UserId'>;
export type ProjectId = Brand<string, 'ProjectId'>;
export type FileId = Brand<string, 'FileId'>;
export type ReportId = Brand<string, 'ReportId'>;
export type InvitationId = Brand<string, 'InvitationId'>;
export type CorrelationId = Brand<string, 'CorrelationId'>;
export type Token = Brand<string, 'Token'>;
export type Email = Brand<string, 'Email'>;
export type Url = Brand<string, 'Url'>;

// UUID validator
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Branded type validators
export const UserIdValidator = createBrandValidator<string, 'UserId'>(
  'UserId',
  (value) => UUID_REGEX.test(value)
);

export const ProjectIdValidator = createBrandValidator<string, 'ProjectId'>(
  'ProjectId',
  (value) => UUID_REGEX.test(value)
);

export const FileIdValidator = createBrandValidator<string, 'FileId'>(
  'FileId',
  (value) => UUID_REGEX.test(value)
);

export const ReportIdValidator = createBrandValidator<string, 'ReportId'>(
  'ReportId',
  (value) => UUID_REGEX.test(value)
);

export const InvitationIdValidator = createBrandValidator<string, 'InvitationId'>(
  'InvitationId',
  (value) => UUID_REGEX.test(value)
);

export const CorrelationIdValidator = createBrandValidator<string, 'CorrelationId'>(
  'CorrelationId',
  (value) => UUID_REGEX.test(value)
);

export const EmailValidator = createBrandValidator<string, 'Email'>(
  'Email',
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
);

export const UrlValidator = createBrandValidator<string, 'Url'>(
  'Url',
  (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
);

// Type guards for runtime validation
export const isBrandedType = <T, B extends string>(
  value: unknown,
  validator: BrandValidator<T, B>
): value is Brand<T, B> => {
  return validator.is(value);
};

/**
 * Utility type to extract the base type from a branded type
 */
export type Unbrand<T> = T extends Brand<infer U, string> ? U : T;

/**
 * Utility to safely convert a branded type back to its base type
 */
export const unbrand = <T extends Brand<unknown, string>>(value: T): Unbrand<T> => {
  return value as Unbrand<T>;
};