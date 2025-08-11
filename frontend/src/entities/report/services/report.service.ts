import { BaseApiService } from '@/shared/api';

/**
 * Report service handling report generation and download
 */
export class ReportService extends BaseApiService {
  private readonly reportsPath = '/api/reports';

  /**
   * Get sample report
   */
  async getSampleReport(): Promise<Blob> {
    return super.downloadFile(`${this.reportsPath}/sample`);
  }

  /**
   * Generate and download custom report
   */
  async generateReport(type: string, params?: Record<string, any>): Promise<Blob> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return super.downloadFile(`${this.reportsPath}/${type}${queryParams}`);
  }
}