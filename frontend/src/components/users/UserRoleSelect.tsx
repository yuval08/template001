import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, UpdateUserRole, UserRoles, getUserRoleLabel, getUserRoleDescription } from '@/types/user';
import type { UserId } from '@/shared/types/branded';
import { Shield } from 'lucide-react';

const updateUserRoleSchema = z.object({
  newRole: z.string().min(1, 'Role is required'),
});

type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>;

interface UserRoleSelectProps {
  user: User | null;
  currentUserId: UserId;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserRole) => void;
  isSubmitting: boolean;
}

export const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  user,
  currentUserId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<UpdateUserRoleFormData>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: {
      newRole: user?.role || '',
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        newRole: user.role,
      });
    }
  }, [user, form]);

  const handleSubmit = (data: UpdateUserRoleFormData) => {
    if (!user) return;
    
    onSubmit({
      userId: user.id,
      newRole: data.newRole,
      updatedById: currentUserId,
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!user) return null;

  const isSelfEdit = user.id === currentUserId;
  const isCurrentlyAdmin = user.role === UserRoles.ADMIN;
  const selectedRole = form.watch('newRole');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Update the role for <strong>{user.firstName} {user.lastName}</strong>.
            {isSelfEdit && isCurrentlyAdmin && (
              <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
                Warning: You cannot demote yourself from the admin role.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
              {getUserRoleLabel(user.role)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newRole">New Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => form.setValue('newRole', value, { shouldValidate: true })}
            >
              <SelectTrigger className={form.formState.errors.newRole ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a new role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRoles).map((role) => {
                  const isDisabled = isSelfEdit && isCurrentlyAdmin && role !== UserRoles.ADMIN;
                  return (
                    <SelectItem 
                      key={role} 
                      value={role}
                      disabled={isDisabled}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{getUserRoleLabel(role)}</span>
                        <span className="text-xs text-gray-500">{getUserRoleDescription(role)}</span>
                        {isDisabled && (
                          <span className="text-xs text-red-500">Cannot demote yourself</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {form.formState.errors.newRole && (
              <p className="text-sm text-red-500">
                {form.formState.errors.newRole.message}
              </p>
            )}
          </div>

          {selectedRole && selectedRole !== user.role && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Role Change:</strong> {getUserRoleLabel(user.role)} → {getUserRoleLabel(selectedRole)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {getUserRoleDescription(selectedRole)}
              </p>
            </div>
          )}

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
              disabled={isSubmitting || selectedRole === user.role}
            >
              {isSubmitting ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};