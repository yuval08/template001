/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  
  // Application environment variables
  readonly VITE_API_BASE_URL: string;
  readonly VITE_OIDC_AUTHORITY: string;
  readonly VITE_OIDC_CLIENT_ID: string;
  readonly VITE_OIDC_REDIRECT_URI: string;
  readonly VITE_OIDC_SCOPE: string;
  readonly VITE_SIGNALR_URL: string;
  
  // Optional environment variables
  readonly VITE_APP_TITLE?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_ENABLE_LOGGING?: string;
  readonly VITE_ENABLE_DEVTOOLS?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_PAGINATION_SIZE?: string;
  readonly VITE_CACHE_TTL?: string;
  readonly VITE_RETRY_ATTEMPTS?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_BUILD_TIMESTAMP?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global type declarations for development
declare global {
  interface Window {
    __STORE_DEVTOOLS_ENABLED__?: boolean;
    __STORE_LOGGING_ENABLED__?: boolean;
  }
}