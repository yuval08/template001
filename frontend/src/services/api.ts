import { useAuthStore } from '@/stores/authStore';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ApiError,
  CreateUserRequest,
  UpdateUserProfileRequest,
  UpdateUserRoleRequest,
  CreateInvitationRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  FileUploadRequest,
} from '@/types/api';
import { 
  User, 
  DetailedUser, 
  UsersResponse, 
  PendingInvitationsResponse,
  Project, 
  ProjectSummary, 
  FileUploadResponse 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    // Only return content-type header since we're using cookie-based auth
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: ApiError = {
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
        errors: errorData.errors,
      };
      throw error;
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    return this.handleResponse<T>(response);
  }

  // Users API
  async getUsers(params: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    roleFilter?: string;
    isActiveFilter?: boolean;
  } = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.pageNumber !== undefined) {
      searchParams.append('pageNumber', String(params.pageNumber));
    }
    if (params.pageSize !== undefined) {
      searchParams.append('pageSize', String(params.pageSize));
    }
    if (params.search !== undefined) {
      searchParams.append('searchTerm', params.search);
    }
    if (params.roleFilter !== undefined) {
      searchParams.append('roleFilter', params.roleFilter);
    }
    if (params.isActiveFilter !== undefined) {
      searchParams.append('isActiveFilter', String(params.isActiveFilter));
    }

    return this.request<UsersResponse>(
      `/api/users?${searchParams.toString()}`
    );
  }

  async getUser(id: string): Promise<DetailedUser> {
    return this.request<DetailedUser>(`/api/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserProfile(id: string, data: UpdateUserProfileRequest): Promise<void> {
    return this.request<void>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<void> {
    return this.request<void>(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Invitations API
  async getInvitations(params: {
    pageNumber?: number;
    pageSize?: number;
  } = {}): Promise<PendingInvitationsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.pageNumber !== undefined) {
      searchParams.append('pageNumber', String(params.pageNumber));
    }
    if (params.pageSize !== undefined) {
      searchParams.append('pageSize', String(params.pageSize));
    }

    return this.request<PendingInvitationsResponse>(
      `/api/users/invitations?${searchParams.toString()}`
    );
  }

  async createInvitation(data: CreateInvitationRequest): Promise<void> {
    return this.request<void>('/api/users/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Projects API
  async getProjects(params: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<Project>> {
    const searchParams = new URLSearchParams();
    
    // Map frontend params to backend expected params
    if (params.pageNumber !== undefined) {
      searchParams.append('page', String(params.pageNumber));
    }
    if (params.pageSize !== undefined) {
      searchParams.append('pageSize', String(params.pageSize));
    }
    if (params.search !== undefined) {
      searchParams.append('search', params.search);
    }
    // Note: backend doesn't support status, sortBy, sortDirection yet

    return this.request<PaginatedResponse<Project>>(
      `/api/projects?${searchParams.toString()}`
    );
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>(`/api/projects/${id}`);
  }

  async createProject(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectSummary(): Promise<ApiResponse<ProjectSummary>> {
    return this.request<ApiResponse<ProjectSummary>>('/api/projects/summary');
  }

  // File upload API
  async uploadFile(data: FileUploadRequest): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', data.file);
    
    if (data.category) {
      formData.append('category', data.category);
    }
    
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    const { user } = useAuthStore.getState();
    const headers: Record<string, string> = {};
    
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/files`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers,
      body: formData,
    });

    return this.handleResponse<ApiResponse<FileUploadResponse>>(response);
  }

  async downloadFile(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/files/${id}`, {
      credentials: 'include', // Include cookies for authentication
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response.blob();
  }

  // Reports API
  async getSampleReport(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/reports/sample`, {
      credentials: 'include', // Include cookies for authentication
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get sample report: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();