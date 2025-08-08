import type { UserId } from '@/shared/types/branded';

export interface User {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DetailedUser {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  lastLoginAt?: string;
  isProvisioned: boolean;
  invitedAt?: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt?: string;
  invitedBy?: User;
  projectsCount: number;
}

export interface PendingInvitation {
  id: string;
  email: string;
  intendedRole: string;
  invitedBy: User;
  invitedAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
}

export const UserRoles = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

/**
 * Business logic for user role display
 */
export const getUserRoleLabel = (role: string): string => {
  switch (role) {
    case UserRoles.ADMIN:
      return 'Administrator';
    case UserRoles.MANAGER:
      return 'Manager';
    case UserRoles.EMPLOYEE:
      return 'Employee';
    default:
      return role;
  }
};

export const getUserRoleDescription = (role: string): string => {
  switch (role) {
    case UserRoles.ADMIN:
      return 'Full system access';
    case UserRoles.MANAGER:
      return 'Project management access';
    case UserRoles.EMPLOYEE:
      return 'Standard user access';
    default:
      return 'Custom role';
  }
};

export const getUserRoleBadgeColor = (role: string): string => {
  switch (role) {
    case UserRoles.ADMIN:
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case UserRoles.MANAGER:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case UserRoles.EMPLOYEE:
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
  }
};