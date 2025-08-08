import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CreateInvitation, UserRoles, getUserRoleLabel, getUserRoleDescription } from '@/types/user';
import { emailSchema } from '@/utils/validation';
import { Mail } from 'lucide-react';

const inviteUserSchema = z.object({
  email: emailSchema,
  intendedRole: z.string().min(1, 'Role is required'),
  expirationDays: z.number().min(1, 'Must be at least 1 day').max(90, 'Cannot exceed 90 days'),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

interface InviteUserDialogProps {
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvitation) => void;
  isSubmitting: boolean;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  currentUserId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      intendedRole: '',
      expirationDays: 30,
    },
  });

  const handleSubmit = (data: InviteUserFormData) => {
    onSubmit({
      email: data.email,
      intendedRole: data.intendedRole,
      invitedById: currentUserId,
      expirationDays: data.expirationDays,
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite New User
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to a new user. They will receive a link to complete their account setup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="user@example.com"
              className={form.formState.errors.email ? 'border-red-500' : ''}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intendedRole">Intended Role *</Label>
            <Select
              value={form.watch('intendedRole')}
              onValueChange={(value) => form.setValue('intendedRole', value, { shouldValidate: true })}
            >
              <SelectTrigger className={form.formState.errors.intendedRole ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a role for this user" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRoles).map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex flex-col">
                      <span className="font-medium">{getUserRoleLabel(role)}</span>
                      <span className="text-xs text-gray-500">{getUserRoleDescription(role)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.intendedRole && (
              <p className="text-sm text-red-500">
                {form.formState.errors.intendedRole.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expirationDays">Invitation Expires In (Days)</Label>
            <Input
              id="expirationDays"
              type="number"
              min="1"
              max="90"
              {...form.register('expirationDays', { valueAsNumber: true })}
              className={form.formState.errors.expirationDays ? 'border-red-500' : ''}
            />
            {form.formState.errors.expirationDays && (
              <p className="text-sm text-red-500">
                {form.formState.errors.expirationDays.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              The user will have this many days to accept the invitation.
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              The user will receive an email with instructions to complete their account setup.
              They will need to sign in through your authentication provider to activate their account.
            </p>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};