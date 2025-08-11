import { AuthUser } from '@/types';

// Base store interfaces
export interface BaseStore {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Auth specific types
export interface AuthState extends BaseStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authConfig: {
    googleEnabled: boolean;
    microsoftEnabled: boolean;
    allowedDomain?: string;
  } | null;
}

export interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthConfig: (config: AuthState['authConfig']) => void;
  logout: () => void;
  reset: () => void;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
}

export interface ThemeActions {
  setTheme: (theme: Theme) => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;
}

// Notification types
export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  timestamp: Date;
}

export interface NotificationState {
  items: NotificationItem[];
}

export interface NotificationActions {
  add: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => string;
  remove: (id: string) => void;
  clear: () => void;
  markAsRead: (id: string) => void;
}

// UI State types
export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  modals: Record<string, boolean>;
}

export interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
}

// Loading state types
export type LoadingPriority = 'critical' | 'high' | 'normal' | 'low';

export interface LoadingItem {
  id: string;
  key: string;
  priority: LoadingPriority;
  startTime: Date;
  timeout?: number;
  metadata?: Record<string, any>;
}

export interface LoadingState {
  items: Record<string, LoadingItem>;
  globalLoading: boolean;
  criticalLoading: boolean;
}

export interface LoadingActions {
  startLoading: (key: string, options?: {
    id?: string;
    priority?: LoadingPriority;
    timeout?: number;
    metadata?: Record<string, any>;
  }) => string;
  stopLoading: (keyOrId: string) => void;
  stopAllLoading: () => void;
  isLoading: (key?: string) => boolean;
  getLoadingItems: (key?: string) => LoadingItem[];
  clearExpiredItems: () => void;
}

// Combined store types
export type AuthStore = AuthState & AuthActions;
export type ThemeStore = ThemeState & ThemeActions;
export type NotificationStore = NotificationState & NotificationActions;
export type UIStore = UIState & UIActions;
export type LoadingStore = LoadingState & LoadingActions;