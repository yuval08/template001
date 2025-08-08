import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeStore } from '../types';
import { devtools, logger } from '../middleware';

const initialState = {
  theme: 'system' as const,
  systemTheme: 'light' as const,
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    { name: 'ThemeStore', enabled: process.env.NODE_ENV === 'development' }
  )(
    logger(
      { name: 'Theme', enabled: process.env.NODE_ENV === 'development', collapsed: true }
    )(
      persist(
        (set, get) => ({
          ...initialState,
          
          setTheme: (theme) => set({ theme }),
          
          setSystemTheme: (systemTheme) => set({ systemTheme }),
        }),
        {
          name: 'theme-storage',
          version: 1,
        }
      )
    )
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