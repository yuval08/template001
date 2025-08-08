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
  role: string;
  department?: string;
  jobTitle?: string;
}

export interface UpdateUserProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
}

export interface UpdateUserRoleRequest {
  userId: string;
  newRole: string;
  updatedById: string;
}

export interface CreateInvitationRequest {
  email: string;
  intendedRole: string;
  invitedById: string;
  expirationDays?: number;
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
  metadata?: Record<string, unknown>;
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