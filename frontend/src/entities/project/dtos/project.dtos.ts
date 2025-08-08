/**
 * Data Transfer Objects for Project entity API communication
 */

export interface CreateProjectDto {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused';
  endDate?: string;
}

/**
 * Mappers to transform between DTOs and domain models
 */
export class ProjectDtoMapper {
  static createProjectToDto(data: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
  }): CreateProjectDto {
    return {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  static updateProjectToDto(data: {
    name?: string;
    description?: string;
    status?: 'active' | 'completed' | 'paused';
    endDate?: string;
  }): UpdateProjectDto {
    return {
      name: data.name,
      description: data.description,
      status: data.status,
      endDate: data.endDate,
    };
  }
}