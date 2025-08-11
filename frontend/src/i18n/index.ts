import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getCookie, setCookie } from '@/utils/cookies';

// Import translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enUsers from './locales/en/users.json';
import enProjects from './locales/en/projects.json';
import enNotifications from './locales/en/notifications.json';

import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esDashboard from './locales/es/dashboard.json';
import esUsers from './locales/es/users.json';
import esProjects from './locales/es/projects.json';
import esNotifications from './locales/es/notifications.json';

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
    dashboard: enDashboard,
    users: enUsers,
    projects: enProjects,
    notifications: enNotifications,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    dashboard: esDashboard,
    users: esUsers,
    projects: esProjects,
    notifications: esNotifications,
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
    },

    // Default namespace
    defaultNS: 'common',
    
    // Return null for missing keys in development to easily spot them
    returnNull: process.env.NODE_ENV === 'development',
    
    // Pluralization support for Spanish
    pluralSeparator: '_',
    keySeparator: '.',
    nsSeparator: ':',

    debug: process.env.NODE_ENV === 'development',
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

export default i18n;