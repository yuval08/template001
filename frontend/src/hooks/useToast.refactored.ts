import { notificationSelectors, notificationService } from '@/stores';

/**
 * Enhanced toast hook using refactored notification store
 * Provides clean interface for toast notifications with improved error handling
 */
export const useToast = () => {
  const items = notificationSelectors.items();
  const unreadCount = notificationSelectors.unreadCount();

  return {
    // State
    toasts: items, // Keep backward compatibility
    items,
    unreadCount,
    
    // Quick notification methods
    success: notificationService.success.bind(notificationService),
    error: notificationService.error.bind(notificationService),
    warning: notificationService.warning.bind(notificationService),
    info: notificationService.info.bind(notificationService),
    
    // Specialized notification methods
    validationError: notificationService.validationError.bind(notificationService),
    networkError: notificationService.networkError.bind(notificationService),
    serverError: notificationService.serverError.bind(notificationService),
    authError: notificationService.authError.bind(notificationService),
    permissionError: notificationService.permissionError.bind(notificationService),
    loading: notificationService.loading.bind(notificationService),
    
    // Management methods
    remove: notificationService.remove.bind(notificationService),
    clear: notificationService.clear.bind(notificationService),
    clearErrors: notificationService.clearErrors.bind(notificationService),
    
    // Advanced methods
    showAndWait: notificationService.showAndWait.bind(notificationService),
    getCount: notificationService.getCount.bind(notificationService),
    getUnreadCount: notificationService.getUnreadCount.bind(notificationService),

    // Legacy compatibility methods
    addToast: (options: Parameters<typeof notificationService.info>[0]) => 
      notificationService.info(options),
    removeToast: notificationService.remove.bind(notificationService),
    clearAll: notificationService.clear.bind(notificationService),
    
    // Export the service for advanced usage
    toast: notificationService,
  };
};

// Export individual toast methods for convenience
export const toast = notificationService;