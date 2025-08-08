import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { contactFormSchema, ContactFormData } from '@/utils/validation';
import { useFileUpload } from '@/entities/file';
import { toast } from '@/stores/toastStore';
import { Upload, X } from 'lucide-react';
import ReactSelect from 'react-select';

const categoryOptions = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'education', label: 'Education' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
];

const Forms: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileUploadMutation = useFileUpload();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      newsletter: false,
      contactMethod: 'email',
      budget: 'under-10k',
      timeline: 'flexible',
      priority: 'medium',
      category: [],
      industry: '',
    },
  });

  const watchedCategory = watch('category');
  const watchedIndustry = watch('industry');
  const watchedPriority = watch('priority');

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', data);
      console.log('Uploaded files:', uploadedFiles);
      
      toast.success({ title: 'Form submitted successfully!', description: 'Thank you for your submission.' });
      reset();
      setUploadedFiles([]);
    } catch (error) {
      toast.error({ title: 'Submission failed', description: 'Please try again.' });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]!;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error({ title: 'File too large', description: 'Please select a file smaller than 5MB.' });
      return;
    }

    try {
      await fileUploadMutation.mutateAsync({
        file,
        category: 'form-attachments',
        metadata: {
          formType: 'contact',
          uploadedAt: new Date().toISOString(),
        },
      });

      setUploadedFiles([...uploadedFiles, file]);
      toast.success({ title: 'File uploaded successfully' });
    } catch (error) {
      toast.error({ title: 'File upload failed', description: 'Please try again.' });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Forms Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive form examples using React Hook Form, Zod validation, and various input types.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Form</CardTitle>
          <CardDescription>
            A comprehensive form showcasing all HTML input types, validation, and file upload functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register('company')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...register('website')}
                  className={errors.website ? 'border-red-500' : ''}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">{errors.website.message}</p>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                rows={4}
                {...register('message')}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>

            {/* Category (Multi-select) and Industry (Single-select) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Services of Interest * (Multi-select)</Label>
                <ReactSelect
                  isMulti
                  options={categoryOptions}
                  value={categoryOptions.filter(option => watchedCategory.includes(option.value))}
                  onChange={(selectedOptions) => {
                    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                    setValue('category', values, { shouldValidate: true });
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select services..."
                />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Industry (Single-select)</Label>
                <ReactSelect
                  options={industryOptions}
                  value={industryOptions.find(option => option.value === watchedIndustry)}
                  onChange={(selectedOption) => {
                    setValue('industry', selectedOption ? selectedOption.value : '', { shouldValidate: true });
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select industry..."
                  isClearable
                />
                {errors.industry && (
                  <p className="text-sm text-red-500">{errors.industry.message}</p>
                )}
              </div>
            </div>

            {/* Radio buttons */}
            <div className="space-y-2">
              <Label>Preferred Contact Method *</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="contact-email"
                    value="email"
                    {...register('contactMethod')}
                    className="text-primary focus:ring-primary"
                  />
                  <Label htmlFor="contact-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="contact-phone"
                    value="phone"
                    {...register('contactMethod')}
                    className="text-primary focus:ring-primary"
                  />
                  <Label htmlFor="contact-phone">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="contact-both"
                    value="both"
                    {...register('contactMethod')}
                    className="text-primary focus:ring-primary"
                  />
                  <Label htmlFor="contact-both">Both</Label>
                </div>
              </div>
            </div>

            {/* Select dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range *</Label>
                <select
                  id="budget"
                  {...register('budget')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-50k">$10,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="over-100k">Over $100,000</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Project Timeline *</Label>
                <select
                  id="timeline"
                  {...register('timeline')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="asap">ASAP</option>
                  <option value="1-month">Within 1 Month</option>
                  <option value="3-months">Within 3 Months</option>
                  <option value="6-months">Within 6 Months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            {/* Range/Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level: {watchedPriority}</Label>
              <input
                type="range"
                id="priority"
                min="1"
                max="3"
                step="1"
                value={watchedPriority === 'low' ? 1 : watchedPriority === 'medium' ? 2 : 3}
                onChange={(e) => {
                  const priorities = ['low', 'medium', 'high'];
                  setValue('priority', priorities[parseInt(e.target.value) - 1] as any);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span className={watchedPriority === 'low' ? 'text-primary font-semibold' : ''}>Low</span>
                <span className={watchedPriority === 'medium' ? 'text-primary font-semibold' : ''}>Medium</span>
                <span className={watchedPriority === 'high' ? 'text-primary font-semibold' : ''}>High</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Attachments</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload files or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, DOC, TXT, Images (Max 5MB)
                  </span>
                </label>
              </div>
              
              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files:</Label>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newsletter"
                {...register('newsletter')}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="newsletter">
                Subscribe to our newsletter for updates and offers
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || fileUploadMutation.isPending}
                className="w-full md:w-auto"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forms;