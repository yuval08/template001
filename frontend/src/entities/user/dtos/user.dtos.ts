/**
 * Data Transfer Objects for User entity API communication
 * These DTOs handle the transformation between API requests/responses and domain models
 */

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  jobTitle?: string;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
}

export interface UpdateUserProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
}

export interface UpdateUserRoleDto {
  userId: string;
  newRole: string;
  updatedById: string;
}

export interface CreateInvitationDto {
  email: string;
  intendedRole: string;
  invitedById: string;
  expirationDays?: number;
}

/**
 * Mappers to transform between DTOs and domain models
 */
export class UserDtoMapper {
  static createUserToDto(data: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
    jobTitle?: string;
  }): CreateUserDto {
    return {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      department: data.department,
      jobTitle: data.jobTitle,
    };
  }

  static updateUserToDto(data: {
    firstName: string;
    lastName: string;
    department?: string;
    jobTitle?: string;
    isActive: boolean;
  }): UpdateUserDto {
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      jobTitle: data.jobTitle,
      isActive: data.isActive,
    };
  }

  static updateUserProfileToDto(data: {
    userId: string;
    firstName: string;
    lastName: string;
    department?: string;
    jobTitle?: string;
    isActive: boolean;
  }): UpdateUserProfileDto {
    return {
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      jobTitle: data.jobTitle,
      isActive: data.isActive,
    };
  }

  static updateUserRoleToDto(data: {
    userId: string;
    newRole: string;
    updatedById: string;
  }): UpdateUserRoleDto {
    return {
      userId: data.userId,
      newRole: data.newRole,
      updatedById: data.updatedById,
    };
  }

  static createInvitationToDto(data: {
    email: string;
    intendedRole: string;
    invitedById: string;
    expirationDays?: number;
  }): CreateInvitationDto {
    return {
      email: data.email,
      intendedRole: data.intendedRole,
      invitedById: data.invitedById,
      expirationDays: data.expirationDays,
    };
  }
}