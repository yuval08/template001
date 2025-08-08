import { CrudService } from '@/shared/api';
import { 
  User, 
  DetailedUser, 
  UsersResponse, 
  PendingInvitationsResponse,
  UserQueryParams 
} from '../types';
import { 
  CreateUserDto,
  UpdateUserDto,
  UpdateUserProfileDto,
  UpdateUserRoleDto,
  CreateInvitationDto,
  UserDtoMapper 
} from '../dtos';

/**
 * User service handling all user-related API operations
 * Extends CrudService for standard CRUD operations with user-specific extensions
 */
export class UserService extends CrudService<User, CreateUserDto, UpdateUserDto> {
  protected readonly entityPath = '/api/users';
  
  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    return this.deleteEntity(id);
  }

  /**
   * Get users with user-specific query parameters
   */
  async getUsers(params: UserQueryParams = {}): Promise<UsersResponse> {
    const queryParams = this.buildUserQueryParams(params);
    return this.get<UsersResponse>(this.entityPath, queryParams);
  }

  /**
   * Get detailed user information by ID
   */
  async getDetailedUser(id: string): Promise<DetailedUser> {
    return this.get<DetailedUser>(`${this.entityPath}/${id}`);
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(id: string, data: UpdateUserProfileDto): Promise<void> {
    return this.put<void>(`${this.entityPath}/${id}`, data);
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, data: UpdateUserRoleDto): Promise<void> {
    return this.put<void>(`${this.entityPath}/${id}/role`, data);
  }

  /**
   * Get pending invitations
   */
  async getInvitations(params: {
    pageNumber?: number;
    pageSize?: number;
  } = {}): Promise<PendingInvitationsResponse> {
    const queryParams = this.buildQueryParams(params);
    return this.get<PendingInvitationsResponse>(`${this.entityPath}/invitations`, queryParams);
  }

  /**
   * Create new invitation
   */
  async createInvitation(data: CreateInvitationDto): Promise<void> {
    return this.post<void>(`${this.entityPath}/invite`, data);
  }

  /**
   * Business logic methods using DTOs for clean separation
   */
  async createUserFromForm(formData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
    jobTitle?: string;
  }): Promise<User> {
    const dto = UserDtoMapper.createUserToDto(formData);
    return this.create(dto);
  }

  async updateUserFromForm(id: string, formData: {
    firstName: string;
    lastName: string;
    department?: string;
    jobTitle?: string;
    isActive: boolean;
  }): Promise<User> {
    const dto = UserDtoMapper.updateUserToDto(formData);
    return this.update(id, dto);
  }

  async updateUserProfileFromForm(id: string, formData: {
    userId: string;
    firstName: string;
    lastName: string;
    department?: string;
    jobTitle?: string;
    isActive: boolean;
  }): Promise<void> {
    const dto = UserDtoMapper.updateUserProfileToDto(formData);
    return this.updateUserProfile(id, dto);
  }

  async updateUserRoleFromForm(id: string, formData: {
    userId: string;
    newRole: string;
    updatedById: string;
  }): Promise<void> {
    const dto = UserDtoMapper.updateUserRoleToDto(formData);
    return this.updateUserRole(id, dto);
  }

  async createInvitationFromForm(formData: {
    email: string;
    intendedRole: string;
    invitedById: string;
    expirationDays?: number;
  }): Promise<void> {
    const dto = UserDtoMapper.createInvitationToDto(formData);
    return this.createInvitation(dto);
  }

  /**
   * Build query parameters specific to user queries
   */
  private buildUserQueryParams(params: UserQueryParams): Record<string, any> {
    const queryParams: Record<string, any> = {};
    
    if (params.pageNumber !== undefined) {
      queryParams.pageNumber = params.pageNumber;
    }
    if (params.pageSize !== undefined) {
      queryParams.pageSize = params.pageSize;
    }
    if (params.search !== undefined) {
      queryParams.searchTerm = params.search; // Backend expects 'searchTerm'
    }
    if (params.roleFilter !== undefined) {
      queryParams.roleFilter = params.roleFilter;
    }
    if (params.isActiveFilter !== undefined) {
      queryParams.isActiveFilter = params.isActiveFilter;
    }

    return queryParams;
  }
}