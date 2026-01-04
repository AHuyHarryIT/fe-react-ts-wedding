import type { Role } from './role';

export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface CreateUserRequest {
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

export interface AssignRolesToUserRequest {
  roleIds: string[];
}

export interface AssignUsersToRoleRequest {
  userIds: string[];
}

export interface ChangeUserPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
