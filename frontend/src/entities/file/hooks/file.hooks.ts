import { useMutation } from '@tanstack/react-query';
import { toast } from '@/stores/toastStore';
import { getFileService } from '@/shared/services';

/**
 * Hook to upload a file
 */
export const useFileUpload = () => {
  return useMutation({
    mutationFn: (formData: {
      file: File;
      category?: string;
      metadata?: Record<string, any>;
    }) => getFileService().uploadFileFromForm(formData),
    onSuccess: () => {
      toast.success({ title: 'File uploaded successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to upload file', description: error.message });
    },
  });
};

/**
 * Hook to download a file
 */
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: (id: string) => getFileService().downloadFile(id),
    onError: (error: any) => {
      toast.error({ title: 'Failed to download file', description: error.message });
    },
  });
};