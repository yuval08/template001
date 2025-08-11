import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: LucideIcon;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideFooter?: boolean;
  customFooter?: React.ReactNode;
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg', 
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
};

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  submitVariant = 'default',
  icon: Icon,
  className,
  maxWidth = 'md',
  hideFooter = false,
  customFooter,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(maxWidthClasses[maxWidth], className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto">
            {children}
          </div>
          
          {!hideFooter && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {customFooter || (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    {cancelText}
                  </Button>
                  <Button
                    type="submit"
                    variant={submitVariant}
                    disabled={submitDisabled || isSubmitting}
                    loading={isSubmitting}
                  >
                    {submitText}
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};