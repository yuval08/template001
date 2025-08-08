import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { 
  CreateUserRequest, 
  UpdateUserProfileRequest,
  UpdateUserRoleRequest,
  CreateInvitationRequest
} from '@/types/api';
import { toast } from '@/stores/toastStore';

// Query Keys
export const userQueryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  invitations: ['users', 'invitations'] as const,
};

// Users hooks
export const useUsers = (params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  roleFilter?: string;
  isActiveFilter?: boolean;
} = {}) => {
  return useQuery({
    queryKey: [...userQueryKeys.users, params],
    queryFn: () => apiClient.getUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userQueryKeys.user(id),
    queryFn: () => apiClient.getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUserRequest) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create user', error.message);
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserProfileRequest }) => 
      apiClient.updateUserProfile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.user(id) });
      toast.success('User profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update user profile', error.message);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRoleRequest }) => 
      apiClient.updateUserRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.user(id) });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update user role', error.message);
    },
  });
};

// Invitation hooks
export const useInvitations = (params: {
  pageNumber?: number;
  pageSize?: number;
} = {}) => {
  return useQuery({
    queryKey: [...userQueryKeys.invitations, params],
    queryFn: () => apiClient.getInvitations(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => apiClient.createInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.invitations });
      toast.success('Invitation sent successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to send invitation', error.message);
    },
  });
};