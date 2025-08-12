import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getCookie, setCookie } from '@/utils/cookies';

// Import translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enLayout from './locales/en/layout.json';
import enDashboard from './locales/en/dashboard.json';
import enUsers from './locales/en/users.json';
import enProjects from './locales/en/projects.json';
import enNotifications from './locales/en/notifications.json';
import enShowcase from './locales/en/showcase.json';
import enSearch from './locales/en/search.json';

import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esLayout from './locales/es/layout.json';
import esDashboard from './locales/es/dashboard.json';
import esUsers from './locales/es/users.json';
import esProjects from './locales/es/projects.json';
import esNotifications from './locales/es/notifications.json';
import esShowcase from './locales/es/showcase.json';
import esSearch from './locales/es/search.json';

// Environment configuration
const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE || 'es';
const multiLanguageEnabled = import.meta.env.VITE_MULTI_LANGUAGE_ENABLED === 'true';

// Cookie-based language detection
const LANGUAGE_COOKIE_NAME = 'app-language';
const getStoredLanguage = () => {
  if (typeof document !== 'undefined') {
    return getCookie(LANGUAGE_COOKIE_NAME) || defaultLanguage;
  }
  return defaultLanguage;
};

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    layout: enLayout,
    dashboard: enDashboard,
    users: enUsers,
    projects: enProjects,
    notifications: enNotifications,
    showcase: enShowcase,
    search: enSearch,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    layout: esLayout,
    dashboard: esDashboard,
    users: esUsers,
    projects: esProjects,
    notifications: esNotifications,
    showcase: esShowcase,
    search: esSearch,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: defaultLanguage,

    interpolation: {
      escapeValue: false,
      // Custom format function for date/number formatting that preserves locale
      format: function(value, format, lng) {
        // Preserve local machine formatting by using browser locale
        // instead of forcing i18n language-specific formatting
        if (format === 'date') {
          return new Date(value).toLocaleDateString();
        }
        if (format === 'datetime') {
          return new Date(value).toLocaleString();
        }
        if (format === 'number') {
          return new Intl.NumberFormat().format(value);
        }
        if (format === 'currency') {
          return new Intl.NumberFormat(undefined, { 
            style: 'currency', 
            currency: 'USD' 
          }).format(value);
        }
        return value;
      }
    },

    // Default namespace
    defaultNS: 'common',
    
    // Return null for missing keys in development to easily spot them
    returnNull: process.env.NODE_ENV === 'development',
    
    // Pluralization support for Spanish
    pluralSeparator: '_',
    keySeparator: '.',
    nsSeparator: ':',
    
    // Spanish pluralization rules
    // Spanish uses: one (n = 1), other (n != 1)
    // This is the default rule that i18next uses for Spanish
    // Examples: "1 usuario", "0 usuarios", "2 usuarios"
    
    // Custom plural rules for Spanish if needed
    // We'll use the default i18next Spanish rules which handle:
    // - zero: n = 0 (uses 'other' form in Spanish)
    // - one: n = 1
    // - other: n != 1
    
    debug: process.env.NODE_ENV === 'development',
    
    // Enhanced reaction to missing keys
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: process.env.NODE_ENV === 'development' ? (lng, ns, key) => {
      console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`);
    } : undefined,
  });

// Save language changes to cookie
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined' && multiLanguageEnabled) {
    setCookie(LANGUAGE_COOKIE_NAME, lng, 365); // Expires in 1 year
  }
});

// Configuration helper functions
export const getIsMultiLanguageEnabled = () => multiLanguageEnabled;
export const getDefaultLanguage = () => defaultLanguage;
export const getAvailableLanguages = () => ['en', 'es'];

/**
 * Date/Number Formatting Approach:
 * 
 * This i18n setup preserves local machine date/number formatting by:
 * 1. Using browser's default locale (undefined) in Intl APIs
 * 2. Not forcing language-specific date formats (e.g., Spanish format for Spanish UI)
 * 3. Providing custom interpolation formats that respect user's system locale
 * 
 * For components, use @/utils/formatters or @/utils/locale utilities
 * which automatically detect and use the user's browser/system locale.
 */

export default i18n;