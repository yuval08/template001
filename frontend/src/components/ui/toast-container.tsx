import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

const ToastIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg shadow-lg border bg-background text-foreground animate-in slide-in-from-top-2',
            {
              'border-green-200 bg-green-50 dark:bg-green-950/50 dark:border-green-800': toast.type === 'success',
              'border-red-200 bg-red-50 dark:bg-red-950/50 dark:border-red-800': toast.type === 'error',
              'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/50 dark:border-yellow-800': toast.type === 'warning',
              'border-blue-200 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-800': toast.type === 'info',
            }
          )}
        >
          <ToastIcon type={toast.type} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold">{toast.title}</h4>
            {toast.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};