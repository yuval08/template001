import React, { useEffect, ReactNode } from 'react';
import { themeService } from '../services/theme.service';

interface StoreProviderProps {
  children: ReactNode;
  enableDevtools?: boolean;
  enableLogging?: boolean;
}

/**
 * Store Provider that initializes all store services
 * and provides them to the component tree
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({
  children,
  enableDevtools = process.env.NODE_ENV === 'development',
  enableLogging = process.env.NODE_ENV === 'development',
}) => {
  useEffect(() => {
    // Initialize theme service
    themeService.initialize();

    // Cleanup on unmount
    return () => {
      themeService.cleanup();
    };
  }, []);

  // Set development flags
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__STORE_DEVTOOLS_ENABLED__ = enableDevtools;
      (window as unknown as Record<string, unknown>).__STORE_LOGGING_ENABLED__ = enableLogging;
    }
  }, [enableDevtools, enableLogging]);

  return <>{children}</>;
};

/**
 * Hook to get store configuration
 */
export const useStoreConfig = () => {
  const isDevToolsEnabled = typeof window !== 'undefined' 
    ? (window as unknown as Record<string, unknown>).__STORE_DEVTOOLS_ENABLED__ ?? false
    : false;
  
  const isLoggingEnabled = typeof window !== 'undefined'
    ? (window as unknown as Record<string, unknown>).__STORE_LOGGING_ENABLED__ ?? false
    : false;

  return {
    devtools: isDevToolsEnabled,
    logging: isLoggingEnabled,
  };
};