import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreateInvitation, UserRoles, getUserRoleLabel, getUserRoleDescription } from '@/types/user';
import type { UserId } from '@/shared/types/branded';
import { Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserService } from '@/shared/services';
import { debounce } from 'lodash';

const inviteUserSchema = z.object({
  emailPrefix: z.string()
    .min(1, 'Email username is required')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid email username format'),
  intendedRole: z.string().min(1, 'Role is required'),
  expirationDays: z.number().min(1, 'Must be at least 1 day').max(90, 'Cannot exceed 90 days'),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

interface InviteUserDialogProps {
  currentUserId: UserId;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvitation) => Promise<void>;
  isSubmitting: boolean;
}

export const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  currentUserId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { authConfig } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{ isAvailable: boolean; message: string } | null>(null);
  
  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      emailPrefix: '',
      intendedRole: '',
      expirationDays: 30,
    },
  });

  // Create debounced validation function
  const validateEmailDebounced = useCallback(
    debounce(async (emailPrefix: string) => {
      if (!emailPrefix) {
        setEmailValidation(null);
        return;
      }

      const fullEmail = authConfig.allowedDomain 
        ? `${emailPrefix}@${authConfig.allowedDomain}`
        : emailPrefix;

      setIsValidatingEmail(true);
      setEmailValidation(null);
      
      try {
        const result = await getUserService().validateEmail(fullEmail);
        setEmailValidation(result);
        
        // If email is not available, set form error
        if (!result.isAvailable) {
          form.setError('emailPrefix', {
            type: 'manual',
            message: result.message
          });
        } else {
          // Clear any previous errors
          form.clearErrors('emailPrefix');
        }
      } catch (error) {
        console.error('Error validating email:', error);
        // Don't show error for validation, just silently fail
      } finally {
        setIsValidatingEmail(false);
      }
    }, 500), // 500ms debounce
    [authConfig.allowedDomain, form]
  );

  // Watch email prefix changes for validation
  const emailPrefix = form.watch('emailPrefix');
  
  useEffect(() => {
    if (emailPrefix) {
      validateEmailDebounced(emailPrefix);
    } else {
      setEmailValidation(null);
    }
  }, [emailPrefix, validateEmailDebounced]);

  const handleSubmit = async (data: InviteUserFormData) => {
    // Clear any previous server errors
    setServerError(null);
    
    // Don't submit if email is not available
    if (emailValidation && !emailValidation.isAvailable) {
      form.setError('emailPrefix', {
        type: 'manual',
        message: emailValidation.message
      });
      return;
    }
    
    // Construct full email from prefix and domain
    const email = authConfig.allowedDomain 
      ? `${data.emailPrefix}@${authConfig.allowedDomain}`
      : data.emailPrefix;
    
    try {
      await onSubmit({
        email,
        intendedRole: data.intendedRole,
        invitedById: currentUserId,
        expirationDays: data.expirationDays,
      });
      // If successful, the parent component will close the dialog
    } catch (error: any) {
      // Extract error message from the error object
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Failed to send invitation. Please try again.';
      
      // Set server error to display in the dialog
      setServerError(errorMessage);
      
      // If it's a duplicate error, also set form error on the email field
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('already invited') ||
          errorMessage.toLowerCase().includes('pending invitation')) {
        form.setError('emailPrefix', {
          type: 'manual',
          message: 'This email already has a pending invitation or user account'
        });
      }
    }
  };

  // Reset form and errors when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        emailPrefix: '',
        intendedRole: '',
        expirationDays: 30,
      });
      setServerError(null);
      setEmailValidation(null);
      setIsValidatingEmail(false);
    }
  }, [isOpen, form]);

  const handleClose = () => {
    form.reset();
    setServerError(null);
    setEmailValidation(null);
    setIsValidatingEmail(false);
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
          {/* Server Error Alert */}
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="emailPrefix">Email Address *</Label>
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <Input
                  id="emailPrefix"
                  {...form.register('emailPrefix')}
                  placeholder="username"
                  className={`pr-8 ${
                    form.formState.errors.emailPrefix 
                      ? 'border-red-500' 
                      : emailValidation?.isAvailable === true 
                      ? 'border-green-500' 
                      : ''
                  }`}
                />
                {/* Validation indicator */}
                {isValidatingEmail && (
                  <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />
                )}
                {!isValidatingEmail && emailValidation && emailPrefix && (
                  emailValidation.isAvailable ? (
                    <CheckCircle className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="absolute right-2 top-2.5 h-4 w-4 text-red-500" />
                  )
                )}
              </div>
              {authConfig.allowedDomain && (
                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md border">
                  @{authConfig.allowedDomain}
                </span>
              )}
            </div>
            {/* Show validation message */}
            {!isValidatingEmail && emailValidation && emailPrefix && (
              <p className={`text-sm ${emailValidation.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {emailValidation.message}
              </p>
            )}
            {/* Show form errors (for initial validation) */}
            {form.formState.errors.emailPrefix && !emailValidation && (
              <p className="text-sm text-red-500">
                {form.formState.errors.emailPrefix.message}
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
              loading={isSubmitting}
              loadingText="Sending..."
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};