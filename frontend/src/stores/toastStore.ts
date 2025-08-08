import { Toast } from '@/types';

// DEPRECATED: This file is deprecated. Please use the new store structure from @/stores
// This file is kept for backward compatibility only.

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

// Re-export the new notification store with backward compatibility
export { useNotificationStore as useToastStore } from './core/notification.store';
export { notificationService as toast } from './services/notification.service';

// The toast helper functions are now provided by notificationService
// Please use the new notificationService or the updated useToast hook