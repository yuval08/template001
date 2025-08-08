import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  FileUploadRequest 
} from '@/types/api';
import { toast } from '@/stores/toastStore';

// Query Keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectSummary: ['projects', 'summary'] as const,
};

// Users hooks
export const useUsers = (params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} = {}) => {
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => apiClient.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => apiClient.getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserRequest) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create user', error.message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      apiClient.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update user', error.message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete user', error.message);
    },
  });
};

// Projects hooks
export const useProjects = (params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} = {}) => {
  return useQuery({
    queryKey: [...queryKeys.projects, params],
    queryFn: () => apiClient.getProjects(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => apiClient.getProject(id),
    enabled: !!id,
  });
};

export const useProjectSummary = () => {
  return useQuery({
    queryKey: queryKeys.projectSummary,
    queryFn: () => apiClient.getProjectSummary(),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create project', error.message);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) => 
      apiClient.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update project', error.message);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectSummary });
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete project', error.message);
    },
  });
};

// File upload hooks
export const useFileUpload = () => {
  return useMutation({
    mutationFn: (data: FileUploadRequest) => apiClient.uploadFile(data),
    onSuccess: () => {
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to upload file', error.message);
    },
  });
};

export const useDownloadFile = () => {
  return useMutation({
    mutationFn: (id: string) => apiClient.downloadFile(id),
    onError: (error: any) => {
      toast.error('Failed to download file', error.message);
    },
  });
};

// Reports hooks
export const useSampleReport = () => {
  return useMutation({
    mutationFn: () => apiClient.getSampleReport(),
    onError: (error: any) => {
      toast.error('Failed to get sample report', error.message);
    },
  });
};