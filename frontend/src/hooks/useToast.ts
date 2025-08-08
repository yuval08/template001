// DEPRECATED: This implementation is deprecated. Please use useToast.refactored.ts
// This file is kept for backward compatibility only.

import { useToastStore, toast } from '@/stores/toastStore';

export const useToast = () => {
  const { items } = useToastStore();

  return {
    toasts: items, // Keep backward compatibility
    addToast: toast.info.bind(toast), // Legacy compatibility
    removeToast: toast.remove.bind(toast),
    clearAll: toast.clear.bind(toast),
    toast,
  };
};