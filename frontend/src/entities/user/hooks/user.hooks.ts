import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserQueryParams } from '../types';
import { toast } from '@/stores/toastStore';
import { getUserService } from '@/shared/services';

/**
 * Query Keys for user-related queries
 */
export const userQueryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  invitations: ['users', 'invitations'] as const,
  usersList: (params: UserQueryParams) => [...userQueryKeys.users, params] as const,
};

/**
 * Hook to fetch paginated users with filtering
 */
export const useUsers = (params: UserQueryParams = {}) => {
  return useQuery({
    queryKey: userQueryKeys.usersList(params),
    queryFn: () => getUserService().getUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch detailed user by ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userQueryKeys.user(id),
    queryFn: () => getUserService().getDetailedUser(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      department?: string;
      jobTitle?: string;
    }) => getUserService().createUserFromForm(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users });
      toast.success({ title: 'User created successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to create user', description: error.message });
    },
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        userId: string;
        firstName: string;
        lastName: string;
        department?: string;
        jobTitle?: string;
        isActive: boolean;
      }
    }) => getUserService().updateUserProfileFromForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.user(id) });
      toast.success({ title: 'User profile updated successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to update user profile', description: error.message });
    },
  });
};

/**
 * Hook to update user role
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        userId: string;
        newRole: string;
        updatedById: string;
      }
    }) => getUserService().updateUserRoleFromForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.user(id) });
      toast.success({ title: 'User role updated successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to update user role', description: error.message });
    },
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getUserService().deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.users });
      toast.success({ title: 'User deleted successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to delete user', description: error.message });
    },
  });
};

/**
 * Hook to fetch pending invitations
 */
export const useInvitations = (params: {
  pageNumber?: number;
  pageSize?: number;
} = {}) => {
  return useQuery({
    queryKey: [...userQueryKeys.invitations, params],
    queryFn: () => getUserService().getInvitations(params),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to create a new invitation
 */
export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: {
      email: string;
      intendedRole: string;
      invitedById: string;
      expirationDays?: number;
    }) => getUserService().createInvitationFromForm(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.invitations });
      toast.success({ title: 'Invitation sent successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to send invitation', description: error.message });
    },
  });
};