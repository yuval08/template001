import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { CreateUser, UserRoles, getUserRoleLabel, getUserRoleDescription } from '@/types/user';
import { nameSchema } from '@/utils/validation';
import { useAuth } from '@/hooks/useAuth';
import { getUserService } from '@/shared/services';
import { debounce } from 'lodash';

// Schema factory to use translations
const createUserSchemaFactory = (t: any) => z.object({
  emailPrefix: z.string()
    .min(1, t('validation.email_required'))
    .regex(/^[a-zA-Z0-9._-]+$/, t('validation.email_invalid_format')),
  firstName: nameSchema,
  lastName: nameSchema,
  role: z.string().min(1, t('validation.role_required')),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

type CreateUserFormData = z.infer<ReturnType<typeof createUserSchemaFactory>>;

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUser) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation('users');
  const { authConfig } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{ isAvailable: boolean; message: string } | null>(null);
  
  const createUserSchema = createUserSchemaFactory(t);
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      emailPrefix: '',
      firstName: '',
      lastName: '',
      role: '',
      department: '',
      jobTitle: '',
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

  const handleSubmit = async (data: CreateUserFormData) => {
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
      : data.emailPrefix; // Fallback if no domain is configured
    
    // Create the user data with the full email
    const userData: CreateUser = {
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      department: data.department,
      jobTitle: data.jobTitle,
    };
    
    try {
      await onSubmit(userData);
      // If successful, the parent component will close the dialog
    } catch (error: any) {
      // Extract error message from the error object
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Failed to create user. Please try again.';
      
      // Set server error to display in the dialog
      setServerError(errorMessage);
      
      // If it's a duplicate email error, also set form error on the email field
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('duplicate')) {
        form.setError('emailPrefix', {
          type: 'manual',
          message: t('dialogs.create_user.email_taken')
        });
      }
    }
  };

  // Reset form and errors when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        emailPrefix: '',
        firstName: '',
        lastName: '',
        role: '',
        department: '',
        jobTitle: '',
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
          <DialogTitle>{t('dialogs.create_user.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.create_user.description')}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('dialogs.create_user.first_name')} *</Label>
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
              <Label htmlFor="lastName">{t('dialogs.create_user.last_name')} *</Label>
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
            <Label htmlFor="emailPrefix">{t('dialogs.create_user.email')} *</Label>
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <Input
                  id="emailPrefix"
                  {...form.register('emailPrefix')}
                  placeholder={t('dialogs.create_user.email_placeholder')}
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
            <Label htmlFor="role">{t('dialogs.create_user.role')} *</Label>
            <Select
              value={form.watch('role') || ''}
              onValueChange={(value) => form.setValue('role', value, { shouldValidate: true })}
            >
              <SelectTrigger className={form.formState.errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('dialogs.create_user.role_placeholder')} />
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
            {form.formState.errors.role && (
              <p className="text-sm text-red-500">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t('dialogs.create_user.department')}</Label>
            <Input
              id="department"
              {...form.register('department')}
              placeholder={t('dialogs.create_user.department_placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">{t('dialogs.create_user.job_title')}</Label>
            <Input
              id="jobTitle"
              {...form.register('jobTitle')}
              placeholder={t('dialogs.create_user.job_title_placeholder')}
            />
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
              loadingText={t('buttons.creating')}
            >
              {t('dialogs.create_user.create_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};