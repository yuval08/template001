# Form Handling Guide

Use React Hook Form with Zod validation for all forms in the application.

## Basic Form Setup

### 1. Define Schema with Zod

```typescript
import { z } from 'zod';

const formSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address'),
  age: z.number()
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Invalid age'),
  role: z.enum(['admin', 'user', 'guest']),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  startDate: z.date(),
});

// Infer TypeScript type from schema
type FormData = z.infer<typeof formSchema>;
```

### 2. Create Form Component

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function YourForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
      role: 'user',
      isActive: true,
      description: '',
      tags: [],
      startDate: new Date(),
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Handle form submission
      console.log('Form data:', data);
      
      // Call API
      // await createEntity(data);
      
      // Reset form on success
      form.reset();
    } catch (error) {
      // Handle error
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Text Input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormDescription>
                This is your display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Input */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number Input */}
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select Dropdown */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Switch/Toggle */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  Enable or disable the user account
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Textarea */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}
```

## Advanced Form Patterns

### Dialog Form

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
}

export function FormDialog({ isOpen, onClose, onSubmit, initialData }: FormDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || defaultFormValues,
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (isOpen && initialData) {
      form.reset(initialData);
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      // Handle error (show toast, etc.)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Create'} Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Form fields */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### Form with File Upload

```tsx
const fileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ),
});

<FormField
  control={form.control}
  name="file"
  render={({ field: { onChange, value, ...field } }) => (
    <FormItem>
      <FormLabel>Upload File</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onChange(file);
            }
          }}
          {...field}
        />
      </FormControl>
      <FormDescription>
        PDF or Word documents up to 5MB
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Form with Dynamic Fields

```tsx
import { useFieldArray } from 'react-hook-form';

const dynamicSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    value: z.string().min(1, 'Value is required'),
  })).min(1, 'At least one item is required'),
});

function DynamicForm() {
  const form = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      items: [{ name: '', value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <FormField
              control={form.control}
              name={`items.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`items.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => remove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ name: '', value: '' })}
        >
          Add Item
        </Button>
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Validation Utilities

Common validation patterns to reuse:

```typescript
// utils/validation.ts
import { z } from 'zod';

// Email validation
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required');

// Name validation
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// Phone validation
export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// URL validation
export const urlSchema = z.string()
  .url('Invalid URL')
  .startsWith('https://', 'URL must use HTTPS');

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);
```

## Form State Management

### Watch Form Values

```tsx
const watchedValue = form.watch('fieldName');
const allValues = form.watch(); // Watch all values

useEffect(() => {
  // React to form value changes
  console.log('Field changed:', watchedValue);
}, [watchedValue]);
```

### Conditional Fields

```tsx
<FormField
  control={form.control}
  name="hasDiscount"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <FormLabel>Apply Discount</FormLabel>
    </FormItem>
  )}
/>

{form.watch('hasDiscount') && (
  <FormField
    control={form.control}
    name="discountAmount"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Discount Amount</FormLabel>
        <FormControl>
          <Input type="number" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}
```

### Form Errors

```tsx
// Set error manually
form.setError('fieldName', {
  type: 'manual',
  message: 'Custom error message',
});

// Set multiple errors
form.setError('root', {
  type: 'manual',
  message: 'Form submission failed',
});

// Clear errors
form.clearErrors('fieldName');
form.clearErrors(); // Clear all
```

## Best Practices

1. **Always validate on both client and server**
2. **Use Zod schemas for type safety**
3. **Provide clear error messages**
4. **Show loading states during submission**
5. **Reset form after successful submission**
6. **Use proper input types** (email, number, date, etc.)
7. **Add helpful descriptions** for complex fields
8. **Implement proper accessibility** with labels and ARIA attributes
9. **Handle edge cases** (network errors, validation failures)
10. **Test form validation** thoroughly