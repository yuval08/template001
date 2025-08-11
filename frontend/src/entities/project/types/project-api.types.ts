import { PaginatedResponse, ApiResponse } from '@/shared/types/api';
import { Project, ProjectSummary } from './project.types';

export interface ProjectsResponse extends PaginatedResponse<Project> {}

export interface ProjectResponse extends ApiResponse<Project> {}

export interface ProjectSummaryResponse extends ApiResponse<ProjectSummary> {}

export interface ProjectQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}