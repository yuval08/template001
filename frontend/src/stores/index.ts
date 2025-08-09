// Core stores
export { useAuthStore, authSelectors, authActions } from './core/auth.store';
export { useThemeStore, themeSelectors, themeActions, getThemeState } from './core/theme.store';
export { useNotificationStore, notificationSelectors, notificationActions } from './core/notification.store';

// UI stores
export { useUIStore, uiSelectors, uiActions } from './ui/ui.store';

// Domain stores
export { useProjectStore, projectSelectors, projectActions } from './domain/project.store';

// Services
export { themeService } from './services/theme.service';
export { notificationService } from './services/notification.service';

// Types
export type * from './types';

// Middleware
export * from './middleware';