import { useMutation } from '@tanstack/react-query';
import { toast } from '@/stores/toastStore';
import { getReportService } from '@/shared/services';

/**
 * Hook to get sample report
 */
export const useSampleReport = () => {
  return useMutation({
    mutationFn: () => getReportService().getSampleReport(),
    onError: (error: any) => {
      toast.error({ title: 'Failed to get sample report', description: error.message });
    },
  });
};

/**
 * Hook to generate custom report
 */
export const useGenerateReport = () => {
  return useMutation({
    mutationFn: ({ type, params }: { type: string; params?: Record<string, any> }) => 
      getReportService().generateReport(type, params),
    onSuccess: () => {
      toast.success({ title: 'Report generated successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to generate report', description: error.message });
    },
  });
};