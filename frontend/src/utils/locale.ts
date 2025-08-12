/**
 * Locale-aware formatting utilities
 * 
 * This module provides locale-aware date and number formatting that respects
 * the user's system/browser locale while maintaining compatibility with the
 * i18n system. The approach prioritizes local machine date formatting over
 * forcing language-specific formats.
 * 
 * Design decisions:
 * - Uses browser's navigator.language as primary locale source
 * - Falls back to i18n language setting with appropriate locale mapping
 * - Preserves existing local machine date formatting behavior
 * - Uses Intl API for consistent, modern formatting
 */

import i18n from '@/i18n';

/**
 * Gets the user's preferred locale for formatting
 * Priority: Browser locale > i18n language > fallback
 */
export const getUserLocale = (): string => {
  // Primary: Use browser/system locale (preserves local machine formatting)
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  // Secondary: Map i18n language to appropriate locale
  const i18nLanguage = i18n.language || 'en';
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'es': 'es-ES',
    // Add more mappings as needed
  };

  return localeMap[i18nLanguage] || 'en-US';
};

/**
 * Gets the user's preferred locale for date formatting specifically
 * This can be different from number formatting if needed
 */
export const getDateLocale = (): string => {
  return getUserLocale();
};

/**
 * Gets the user's preferred locale for number formatting specifically
 */
export const getNumberLocale = (): string => {
  return getUserLocale();
};

/**
 * Formats a date using the user's locale preferences
 * Uses Intl.DateTimeFormat for consistent, locale-aware formatting
 */
export const formatDateLocale = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default options that work well for most use cases
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat(getDateLocale(), defaultOptions).format(dateObj);
};

/**
 * Formats a date and time using the user's locale preferences
 */
export const formatDateTimeLocale = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options
  };

  return formatDateLocale(date, defaultOptions);
};

/**
 * Formats relative time (e.g., "2 hours ago") using the user's locale
 */
export const formatRelativeTimeLocale = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Use Intl.RelativeTimeFormat for proper locale support
  const rtf = new Intl.RelativeTimeFormat(getDateLocale(), { 
    numeric: 'auto',
    style: 'long' 
  });

  // Define time intervals in seconds
  const intervals = [
    { unit: 'year' as const, seconds: 31536000 },
    { unit: 'month' as const, seconds: 2592000 },
    { unit: 'day' as const, seconds: 86400 },
    { unit: 'hour' as const, seconds: 3600 },
    { unit: 'minute' as const, seconds: 60 }
  ];

  // Find the appropriate interval
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return rtf.format(-count, interval.unit);
    }
  }

  // Less than a minute ago
  return rtf.format(-diffInSeconds, 'second');
};

/**
 * Formats a number using the user's locale preferences
 */
export const formatNumberLocale = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat(getNumberLocale(), options).format(value);
};

/**
 * Formats currency using the user's locale preferences
 * Note: Currency code should match the user's region for best results
 */
export const formatCurrencyLocale = (
  amount: number,
  currency = 'USD',
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    ...options
  };

  return formatNumberLocale(amount, defaultOptions);
};

/**
 * Formats a percentage using the user's locale preferences
 */
export const formatPercentageLocale = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options
  };

  return formatNumberLocale(value, defaultOptions);
};

/**
 * Gets locale-specific formatting patterns for debugging/testing
 */
export const getLocaleInfo = () => {
  const locale = getUserLocale();
  const sampleDate = new Date('2024-03-15T14:30:00');
  const sampleNumber = 1234.56;

  return {
    locale,
    dateFormat: formatDateLocale(sampleDate),
    dateTimeFormat: formatDateTimeLocale(sampleDate),
    relativeTimeFormat: formatRelativeTimeLocale(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
    numberFormat: formatNumberLocale(sampleNumber),
    currencyFormat: formatCurrencyLocale(sampleNumber),
    percentageFormat: formatPercentageLocale(0.1234)
  };
};