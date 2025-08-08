import { notificationActions, notificationSelectors } from '../core/notification.store';
import { NotificationItem } from '../types';

type NotificationOptions = Omit<NotificationItem, 'id' | 'timestamp'>;
type QuickNotificationOptions = {
  title: string;
  description?: string;
  duration?: number;
};

class NotificationService {
  /**
   * Add a success notification
   */
  success(options: QuickNotificationOptions): string {
    return notificationActions.add({
      ...options,
      type: 'success',
    });
  }

  /**
   * Add an error notification with longer default duration
   */
  error(options: QuickNotificationOptions): string {
    return notificationActions.add({
      ...options,
      type: 'error',
      duration: options.duration || 8000,
    });
  }

  /**
   * Add a warning notification
   */
  warning(options: QuickNotificationOptions): string {
    return notificationActions.add({
      ...options,
      type: 'warning',
      duration: options.duration || 6000,
    });
  }

  /**
   * Add an info notification
   */
  info(options: QuickNotificationOptions): string {
    return notificationActions.add({
      ...options,
      type: 'info',
    });
  }

  /**
   * Add a validation error notification with formatted errors
   */
  validationError(title: string, errors: string[], duration?: number): string {
    const description = errors.length > 1 
      ? `${errors.length} validation errors:\n• ${errors.join('\n• ')}`
      : errors[0];

    return notificationActions.add({
      title,
      description,
      type: 'error',
      duration: duration || 10000,
    });
  }

  /**
   * Add a network error notification
   */
  networkError(duration?: number): string {
    return notificationActions.add({
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'error',
      duration: duration || 8000,
    });
  }

  /**
   * Add a server error notification with optional correlation ID
   */
  serverError(correlationId?: string, duration?: number): string {
    const description = correlationId 
      ? `An unexpected server error occurred. Error ID: ${correlationId}`
      : 'An unexpected server error occurred. Please try again later.';

    return notificationActions.add({
      title: 'Server Error',
      description,
      type: 'error',
      duration: duration || 8000,
    });
  }

  /**
   * Add an authentication error notification
   */
  authError(duration?: number): string {
    return notificationActions.add({
      title: 'Authentication Required',
      description: 'Your session has expired. Please log in again.',
      type: 'warning',
      duration: duration || 6000,
    });
  }

  /**
   * Add a permission error notification
   */
  permissionError(duration?: number): string {
    return notificationActions.add({
      title: 'Access Denied',
      description: 'You don\'t have permission to perform this action.',
      type: 'error',
      duration: duration || 6000,
    });
  }

  /**
   * Add a loading notification that doesn't auto-dismiss
   */
  loading(title: string, description?: string): string {
    return notificationActions.add({
      title,
      description,
      type: 'info',
      duration: 0, // Don't auto-dismiss
    });
  }

  /**
   * Remove a specific notification
   */
  remove(id: string): void {
    notificationActions.remove(id);
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    notificationActions.clear();
  }

  /**
   * Clear all error notifications
   */
  clearErrors(): void {
    const errorNotifications = notificationSelectors.byType('error');
    errorNotifications.forEach(notification => {
      notificationActions.remove(notification.id);
    });
  }

  /**
   * Show a notification and return a promise that resolves when it's dismissed
   */
  async showAndWait(options: NotificationOptions): Promise<void> {
    return new Promise((resolve) => {
      const id = notificationActions.add(options);
      
      // If no duration specified, resolve immediately
      if (!options.duration || options.duration <= 0) {
        resolve();
        return;
      }

      // Wait for auto-dismissal
      setTimeout(() => {
        resolve();
      }, options.duration);
    });
  }

  /**
   * Get current notification count
   */
  getCount(): number {
    return notificationSelectors.items().length;
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return notificationSelectors.unreadCount();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();