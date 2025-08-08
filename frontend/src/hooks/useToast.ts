import { useToastStore, toast } from '@/stores/toastStore';

export const useToast = () => {
  const { toasts, addToast, removeToast, clearAll } = useToastStore();

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    toast,
  };
};