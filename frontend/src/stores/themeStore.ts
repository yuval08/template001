import { Theme } from '@/types';

// DEPRECATED: This file is deprecated. Please use the new store structure from @/stores
// This file is kept for backward compatibility only.

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Re-export the new theme store with backward compatibility
export { useThemeStore } from './core/theme.store';

// The theme initialization and DOM manipulation is now handled by the themeService
// Import and use themeService.initialize() in your app root instead of relying on 
// module-level side effects