import { useEffect } from 'react';
import { themeSelectors, themeService, Theme } from '@/stores';

/**
 * Enhanced theme hook using refactored theme store
 * Provides theme state and actions with proper service integration
 */
export const useTheme = () => {
  const theme = themeSelectors.theme();
  const systemTheme = themeSelectors.systemTheme();
  const resolvedTheme = themeSelectors.resolvedTheme();

  // Initialize theme service on mount
  useEffect(() => {
    themeService.initialize();
    
    return () => {
      themeService.cleanup();
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    themeService.setTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    themeService.setTheme(newTheme);
  };

  const useSystemTheme = () => {
    themeService.setTheme('system');
  };

  const isSystemTheme = () => theme === 'system';

  const isDark = () => resolvedTheme === 'dark';

  const isLight = () => resolvedTheme === 'light';

  return {
    // State
    theme,
    systemTheme,
    resolvedTheme,
    
    // Computed state
    isSystemTheme: isSystemTheme(),
    isDark: isDark(),
    isLight: isLight(),
    
    // Actions
    setTheme,
    toggleTheme,
    useSystemTheme,
    
    // Utilities
    getResolvedTheme: themeService.getResolvedTheme.bind(themeService),
  };
};