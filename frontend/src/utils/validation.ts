import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .optional()
  .or(z.literal(''));

// User validation schemas
export const createUserSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required').optional(),
  isActive: z.boolean().optional(),
});

// Project validation schemas
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
  endDate: z.string().optional().or(z.literal('')),
});

// Form validation schemas
export const contactFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().optional(),
  website: urlSchema,
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  newsletter: z.boolean().default(false),
  contactMethod: z.enum(['email', 'phone', 'both']),
  budget: z.enum(['under-10k', '10k-50k', '50k-100k', 'over-100k']),
  timeline: z.enum(['asap', '1-month', '3-months', '6-months', 'flexible']),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.array(z.string()).min(1, 'Please select at least one category'),
  industry: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectSchema>;