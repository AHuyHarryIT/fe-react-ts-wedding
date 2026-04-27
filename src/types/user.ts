import type { Role } from './role';
import type { Job } from './job';

export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  staffJobs?:
    | {
        jobId: string;
        job?: Pick<Job, 'id' | 'name'> | null;
      }[]
    | null;
  jobId?: string | null;
  jobs?: Pick<Job, 'id' | 'name' | 'description' | 'isActive'>[] | null;
  job?: Pick<Job, 'id' | 'name' | 'description' | 'isActive'> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface CreateUserRequest {
  id: string;
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  jobIds?: string[];
  jobId?: string | null;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  jobIds?: string[];
  jobId?: string | null;
  roleIds?: string[];
  isActive?: boolean;
}

export interface ResetUserPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface ResetUserPasswordResponse {
  message: string;
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
