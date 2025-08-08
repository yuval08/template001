import { themeActions, themeSelectors } from '../core/theme.store';
import { Theme } from '../types';

class ThemeService {
  private mediaQuery: MediaQueryList | undefined;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
    }
  }

  /**
   * Initialize theme service - sets up listeners and applies initial theme
   */
  initialize() {
    if (this.initialized || typeof window === 'undefined') return;

    // Set initial system theme
    this.updateSystemTheme();
    
    // Listen for system theme changes
    this.mediaQuery?.addEventListener('change', this.handleSystemThemeChange);
    
    // Apply current theme to DOM
    this.applyTheme();
    
    this.initialized = true;
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
    this.initialized = false;
  }

  /**
   * Set theme and apply to DOM
   */
  setTheme(theme: Theme) {
    themeActions.setTheme(theme);
    this.applyTheme();
  }

  /**
   * Get current resolved theme (accounts for system preference)
   */
  getResolvedTheme(): 'light' | 'dark' {
    return themeSelectors.resolvedTheme();
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme() {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    const resolvedTheme = this.getResolvedTheme();
    
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Update meta theme-color for mobile browsers
    this.updateThemeColor(resolvedTheme);
  }

  /**
   * Handle system theme changes
   */
  private handleSystemThemeChange() {
    this.updateSystemTheme();
    
    // If using system theme, re-apply
    if (themeSelectors.theme() === 'system') {
      this.applyTheme();
    }
  }

  /**
   * Update system theme state
   */
  private updateSystemTheme() {
    if (!this.mediaQuery) return;
    
    const systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
    themeActions.setSystemTheme(systemTheme);
  }

  /**
   * Update theme-color meta tag for mobile browsers
   */
  private updateThemeColor(theme: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#0f172a' : '#ffffff';
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.getElementsByTagName('head')[0]?.appendChild(meta);
    }
  }
}

// Export singleton instance
export const themeService = new ThemeService();