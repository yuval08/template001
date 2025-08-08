import { CrudService } from '@/shared/api';
import { 
  Project, 
  ProjectsResponse, 
  ProjectResponse, 
  ProjectSummaryResponse,
  ProjectQueryParams 
} from '../types';
import { 
  CreateProjectDto,
  UpdateProjectDto,
  ProjectDtoMapper 
} from '../dtos';

/**
 * Project service handling all project-related API operations
 */
export class ProjectService extends CrudService<Project, CreateProjectDto, UpdateProjectDto> {
  protected readonly entityPath = '/api/projects';

  /**
   * Get projects with project-specific query parameters
   */
  async getProjects(params: ProjectQueryParams = {}): Promise<ProjectsResponse> {
    const queryParams = this.buildProjectQueryParams(params);
    return this.get<ProjectsResponse>(this.entityPath, queryParams);
  }

  /**
   * Get project by ID with wrapped response
   */
  async getProject(id: string): Promise<ProjectResponse> {
    return this.get<ProjectResponse>(`${this.entityPath}/${id}`);
  }

  /**
   * Create project with wrapped response
   */
  async createProject(data: CreateProjectDto): Promise<ProjectResponse> {
    return this.post<ProjectResponse>(this.entityPath, data);
  }

  /**
   * Update project with wrapped response
   */
  async updateProject(id: string, data: UpdateProjectDto): Promise<ProjectResponse> {
    return this.put<ProjectResponse>(`${this.entityPath}/${id}`, data);
  }

  /**
   * Delete project with wrapped response
   */
  async deleteProject(id: string): Promise<void> {
    return this.deleteEntity(id);
  }

  /**
   * Get project summary statistics
   */
  async getProjectSummary(): Promise<ProjectSummaryResponse> {
    return this.get<ProjectSummaryResponse>(`${this.entityPath}/summary`);
  }

  /**
   * Business logic methods using DTOs for clean separation
   */
  async createProjectFromForm(formData: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
  }): Promise<ProjectResponse> {
    const dto = ProjectDtoMapper.createProjectToDto(formData);
    return this.createProject(dto);
  }

  async updateProjectFromForm(id: string, formData: {
    name?: string;
    description?: string;
    status?: 'active' | 'completed' | 'paused';
    endDate?: string;
  }): Promise<ProjectResponse> {
    const dto = ProjectDtoMapper.updateProjectToDto(formData);
    return this.updateProject(id, dto);
  }

  /**
   * Build query parameters specific to project queries
   */
  private buildProjectQueryParams(params: ProjectQueryParams): Record<string, any> {
    const queryParams: Record<string, any> = {};
    
    // Map frontend params to backend expected params
    if (params.pageNumber !== undefined) {
      queryParams.page = params.pageNumber; // Backend expects 'page'
    }
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }
    if (params.search !== undefined) {
      queryParams.search = params.search;
    }
    if (params.status !== undefined) {
      queryParams.status = params.status;
    }
    if (params.sortBy !== undefined) {
      queryParams.sortBy = params.sortBy;
    }
    if (params.sortDirection !== undefined) {
      queryParams.sortDirection = params.sortDirection;
    }

    return queryParams;
  }
}