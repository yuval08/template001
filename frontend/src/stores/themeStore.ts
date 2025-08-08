import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Initialize theme on app load
const initializeTheme = () => {
  const { theme } = useThemeStore.getState();
  const root = window.document.documentElement;
  
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { theme } = useThemeStore.getState();
  if (theme === 'system') {
    initializeTheme();
  }
});

// Initialize on import
initializeTheme();