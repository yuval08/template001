import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { parseISO } from 'date-fns/parseISO';
import { 
  formatDateLocale, 
  formatDateTimeLocale, 
  formatRelativeTimeLocale,
  formatNumberLocale,
  formatCurrencyLocale,
  formatPercentageLocale
} from './locale';

/**
 * Locale-aware date formatting (RECOMMENDED)
 * Uses browser/system locale for consistent local machine formatting
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
  return formatDateLocale(date, options);
};

/**
 * Locale-aware date and time formatting (RECOMMENDED)
 * Uses browser/system locale for consistent local machine formatting
 */
export const formatDateTime = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
  return formatDateTimeLocale(date, options);
};

/**
 * Locale-aware relative time formatting (RECOMMENDED)
 * Uses browser/system locale for proper "time ago" formatting
 */
export const formatRelativeTime = (date: string | Date) => {
  return formatRelativeTimeLocale(date);
};

/**
 * Legacy date formatting using date-fns (for backward compatibility)
 * Consider migrating to formatDate() for better locale support
 * @deprecated Use formatDate() with options instead
 */
export const formatDatePattern = (date: string | Date, pattern = 'MMM dd, yyyy') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern);
};

/**
 * Legacy relative time formatting using date-fns (for backward compatibility)
 * Consider migrating to formatRelativeTime() for better locale support
 * @deprecated Use formatRelativeTime() instead
 */
export const formatRelativeTimePattern = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Locale-aware currency formatting (RECOMMENDED)
 * Uses browser/system locale for consistent local formatting
 */
export const formatCurrency = (amount: number, currency = 'USD', options?: Intl.NumberFormatOptions) => {
  return formatCurrencyLocale(amount, currency, options);
};

/**
 * Locale-aware percentage formatting (RECOMMENDED)
 * Uses browser/system locale for consistent local formatting
 */
export const formatPercentage = (value: number, options?: Intl.NumberFormatOptions) => {
  return formatPercentageLocale(value, options);
};

/**
 * Locale-aware number formatting (RECOMMENDED)
 * Uses browser/system locale for consistent local formatting
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
  return formatNumberLocale(value, options);
};

/**
 * Legacy percentage formatting (for backward compatibility)
 * Consider migrating to formatPercentage() for better locale support
 * @deprecated Use formatPercentage() instead
 */
export const formatPercentageFixed = (value: number, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelCaseToTitle = (str: string) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const formatPhoneNumber = (phoneNumber: string) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};