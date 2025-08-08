import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ThemeStore, Theme } from '../types';

const initialState = {
  theme: 'system' as const,
  systemTheme: 'light' as const,
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setTheme: (theme: Theme) => set({ theme }),
        
        setSystemTheme: (systemTheme: 'light' | 'dark') => set({ systemTheme }),
      }),
      {
        name: 'theme-storage',
        version: 1,
      }
    ),
    { name: 'ThemeStore' }
  )
);

// Selectors
export const themeSelectors = {
  theme: () => useThemeStore((state) => state.theme),
  systemTheme: () => useThemeStore((state) => state.systemTheme),
  resolvedTheme: () => useThemeStore((state) => 
    state.theme === 'system' ? state.systemTheme : state.theme
  ),
};

// Actions
export const themeActions = {
  setTheme: (theme: Parameters<ThemeStore['setTheme']>[0]) => useThemeStore.getState().setTheme(theme),
  setSystemTheme: (theme: Parameters<ThemeStore['setSystemTheme']>[0]) => useThemeStore.getState().setSystemTheme(theme),
};