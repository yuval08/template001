import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectQueryParams } from '../types';
import { toast } from '@/stores/toastStore';
import { getProjectService } from '@/shared/services';

/**
 * Query Keys for project-related queries
 */
export const projectQueryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectSummary: ['projects', 'summary'] as const,
  projectsList: (params: ProjectQueryParams) => [...projectQueryKeys.projects, params] as const,
};

/**
 * Hook to fetch paginated projects with filtering
 */
export const useProjects = (params: ProjectQueryParams = {}) => {
  return useQuery({
    queryKey: projectQueryKeys.projectsList(params),
    queryFn: () => getProjectService().getProjects(params),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch project by ID
 */
export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectQueryKeys.project(id),
    queryFn: () => getProjectService().getProject(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch project summary statistics
 */
export const useProjectSummary = () => {
  return useQuery({
    queryKey: projectQueryKeys.projectSummary,
    queryFn: () => getProjectService().getProjectSummary(),
  });
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: {
      name: string;
      description: string;
      startDate: string;
      endDate?: string;
    }) => getProjectService().createProjectFromForm(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectSummary });
      toast.success({ title: 'Project created successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to create project', description: error.message });
    },
  });
};

/**
 * Hook to update a project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        name?: string;
        description?: string;
        status?: 'active' | 'completed' | 'paused';
        endDate?: string;
      }
    }) => getProjectService().updateProjectFromForm(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.project(id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectSummary });
      toast.success({ title: 'Project updated successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to update project', description: error.message });
    },
  });
};

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getProjectService().deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectSummary });
      toast.success({ title: 'Project deleted successfully' });
    },
    onError: (error: any) => {
      toast.error({ title: 'Failed to delete project', description: error.message });
    },
  });
};