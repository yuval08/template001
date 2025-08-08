import { create } from 'zustand';
import { Toast } from '@/types';

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((toast) => toast.id !== id),
  })),
  
  clearAll: () => set({ toasts: [] }),
}));

// Helper function to easily add toasts
export const toast = {
  success: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'success',
    });
  },
  error: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'error',
    });
  },
  warning: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'warning',
    });
  },
  info: (title: string, description?: string) => {
    useToastStore.getState().addToast({
      title,
      description,
      type: 'info',
    });
  },
};