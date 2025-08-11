import { BaseApiService } from './base-api.service';
import { PaginatedResponse, BaseQueryParams, CrudOperations } from '@/shared/types/api';

/**
 * Generic CRUD service providing standard REST operations
 * Entity-specific services can extend this class for common functionality
 */
export abstract class CrudService<TEntity, TCreateDto, TUpdateDto> 
  extends BaseApiService 
  implements CrudOperations<TEntity, TCreateDto, TUpdateDto> {
  
  protected abstract readonly entityPath: string;

  /**
   * Get all entities with pagination and filtering
   */
  async getAll(params: BaseQueryParams = {}): Promise<PaginatedResponse<TEntity>> {
    const queryParams = this.buildQueryParams(params);
    return this.get<PaginatedResponse<TEntity>>(this.entityPath, queryParams);
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<TEntity> {
    return this.get<TEntity>(`${this.entityPath}/${id}`);
  }

  /**
   * Create new entity
   */
  async create(data: TCreateDto): Promise<TEntity> {
    return this.post<TEntity>(this.entityPath, data);
  }

  /**
   * Update existing entity
   */
  async update(id: string, data: TUpdateDto): Promise<TEntity> {
    return this.put<TEntity>(`${this.entityPath}/${id}`, data);
  }

  /**
   * Delete entity
   */
  async deleteEntity(id: string): Promise<void> {
    return super.delete<void>(`${this.entityPath}/${id}`);
  }

  /**
   * Build query parameters for API requests
   * Override this method in subclasses for entity-specific parameter mapping
   */
  protected buildQueryParams(params: BaseQueryParams): Record<string, any> {
    const queryParams: Record<string, any> = {};

    if (params.pageNumber !== undefined) {
      queryParams.pageNumber = params.pageNumber;
    }
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }
    if (params.search !== undefined) {
      queryParams.search = params.search;
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