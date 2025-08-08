import { PaginatedResponse } from '@/shared/types/api';
import { User, PendingInvitation } from './user.types';

export interface UsersResponse extends PaginatedResponse<User> {}

export interface PendingInvitationsResponse extends PaginatedResponse<PendingInvitation> {}

export interface UserQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  roleFilter?: string;
  isActiveFilter?: boolean;
}