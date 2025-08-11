import React, { useEffect } from 'react';
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
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update the user&apos;s profile information. Email and role cannot be changed here.
            {isSelfEdit && isCurrentlyActive && (
              <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
                Warning: You cannot deactivate your own account.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-gray-50 dark:bg-gray-800" />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
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
              <Label htmlFor="lastName">Last Name *</Label>
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
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...form.register('department')}
              placeholder="e.g., Engineering, Marketing, Sales"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              {...form.register('jobTitle')}
              placeholder="e.g., Senior Developer, Project Manager"
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
            <Label htmlFor="isActive">User is active</Label>
            {isSelfEdit && isCurrentlyActive && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                Cannot deactivate yourself
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
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};