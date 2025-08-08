import { BaseApiService } from '@/shared/api';
import { ApiResponse } from '@/shared/types/api';
import { FileUploadResponse } from '../types';
import { FileUploadDto, FileDtoMapper } from '../dtos';

/**
 * File service handling file upload and download operations
 */
export class FileService extends BaseApiService {
  private readonly filesPath = '/api/files';

  /**
   * Upload a file
   */
  async uploadFileData(data: FileUploadDto): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', data.file);
    
    if (data.category) {
      formData.append('category', data.category);
    }
    
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    return super.uploadFile<ApiResponse<FileUploadResponse>>(this.filesPath, formData);
  }

  /**
   * Download a file
   */
  async downloadFile(id: string): Promise<Blob> {
    return super.downloadFile(`${this.filesPath}/${id}`);
  }

  /**
   * Business logic methods using DTOs for clean separation
   */
  async uploadFileFromForm(formData: {
    file: File;
    category?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<FileUploadResponse>> {
    const dto = FileDtoMapper.uploadFileToDto(formData);
    return this.uploadFileData(dto);
  }
}