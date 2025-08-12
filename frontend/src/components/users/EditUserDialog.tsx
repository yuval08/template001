import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, UpdateUserProfile } from '@/types/user';
import { nameSchema } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';

const updateUserProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  isActive: z.boolean(),
});

type UpdateUserProfileFormData = z.infer<typeof updateUserProfileSchema>;

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserProfile) => void;
  isSubmitting: boolean;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation('users');
  const { user: currentUser } = useAuth();
  const form = useForm<UpdateUserProfileFormData>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      department: '',
      jobTitle: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department || '',
        jobTitle: user.jobTitle || '',
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const handleSubmit = (data: UpdateUserProfileFormData) => {
    if (!user) return;
    
    onSubmit({
      userId: user.id,
      ...data,
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!user) return null;

  const isSelfEdit = user.email === currentUser?.email;
  const isCurrentlyActive = user.isActive;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('dialogs.edit_user.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.edit_user.description')}
            {isSelfEdit && isCurrentlyActive && (
              <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
                {t('dialogs.edit_user.warning_self_deactivate')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('dialogs.edit_user.email')}</Label>
            <Input value={user.email} disabled className="bg-gray-50 dark:bg-gray-800" />
            <p className="text-xs text-gray-500">{t('dialogs.edit_user.email_readonly')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('dialogs.edit_user.first_name')} *</Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                className={form.formState.errors.firstName ? 'border-red-500' : ''}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t('dialogs.edit_user.last_name')} *</Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                className={form.formState.errors.lastName ? 'border-red-500' : ''}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t('dialogs.edit_user.department')}</Label>
            <Input
              id="department"
              {...form.register('department')}
              placeholder={t('dialogs.create_user.department_placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">{t('dialogs.edit_user.job_title')}</Label>
            <Input
              id="jobTitle"
              {...form.register('jobTitle')}
              placeholder={t('dialogs.create_user.job_title_placeholder')}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => {
                // Prevent self-deactivation
                if (isSelfEdit && isCurrentlyActive && !checked) {
                  return; // Don't allow unchecking if it's self-edit and currently active
                }
                form.setValue('isActive', checked);
              }}
              disabled={isSelfEdit && isCurrentlyActive && form.watch('isActive')}
            />
            <Label htmlFor="isActive">{t('dialogs.edit_user.is_active')}</Label>
            {isSelfEdit && isCurrentlyActive && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                {t('dialogs.edit_user.cannot_deactivate_yourself')}
              </span>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText={t('common:buttons.saving')}
            >
              {t('dialogs.edit_user.update_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};