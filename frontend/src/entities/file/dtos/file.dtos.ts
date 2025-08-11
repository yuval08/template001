export interface FileUploadDto {
  file: File;
  category?: string;
  metadata?: Record<string, any>;
}

export class FileDtoMapper {
  static uploadFileToDto(data: {
    file: File;
    category?: string;
    metadata?: Record<string, any>;
  }): FileUploadDto {
    return {
      file: data.file,
      category: data.category,
      metadata: data.metadata,
    };
  }
}