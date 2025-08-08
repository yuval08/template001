export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused';
  endDate?: string;
}

export interface FileUploadRequest {
  file: File;
  category?: string;
  metadata?: Record<string, any>;
}

export interface TableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: {
    id: string;
    desc: boolean;
  }[];
  columnFilters: {
    id: string;
    value: unknown;
  }[];
  globalFilter: string;
}