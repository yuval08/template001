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

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface SearchParams {
  search?: string;
}

export interface SortParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface BaseQueryParams extends PaginationParams, SearchParams, SortParams {}

export interface CrudOperations<TEntity, TCreateDto, TUpdateDto> {
  getAll(params?: BaseQueryParams): Promise<PaginatedResponse<TEntity>>;
  getById(id: string): Promise<TEntity>;
  create(data: TCreateDto): Promise<TEntity>;
  update(id: string, data: TUpdateDto): Promise<TEntity>;
  deleteEntity(id: string): Promise<void>;
}