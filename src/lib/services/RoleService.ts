import { api } from '../client';
import type {
  PaginationParams,
  PaginatedResponse,
  StandardResponse,
} from '../common';
import type { MessageResponse } from '../types';

export interface Permission {
  id: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: RolePermission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export const roleApi = {
  // Get all roles with pagination
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Role>> => {
    const response = await api.get<PaginatedResponse<Role>>('/roles', {
      params,
    });
    return response.data;
  },

  // Get a single role by ID
  getOne: async (id: string): Promise<StandardResponse<Role>> => {
    const response = await api.get<StandardResponse<Role>>(`/roles/${id}`);
    return response.data;
  },

  // Create a new role
  create: async (data: CreateRoleRequest): Promise<StandardResponse<Role>> => {
    const response = await api.post<StandardResponse<Role>>('/roles', data);
    return response.data;
  },

  // Update a role
  update: async (
    id: string,
    data: UpdateRoleRequest
  ): Promise<StandardResponse<Role>> => {
    const response = await api.patch<StandardResponse<Role>>(
      `/roles/${id}`,
      data
    );
    return response.data;
  },

  // Delete a role
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/roles/${id}`);
    return response.data;
  },

  // Assign permissions to a role
  assignPermissions: async (
    id: string,
    data: AssignPermissionsRequest
  ): Promise<StandardResponse<Role>> => {
    const response = await api.post<StandardResponse<Role>>(
      `/roles/${id}/permissions/assign`,
      data
    );
    return response.data;
  },

  // Revoke permissions from a role
  revokePermissions: async (
    id: string,
    data: AssignPermissionsRequest
  ): Promise<StandardResponse<Role>> => {
    const response = await api.post<StandardResponse<Role>>(
      `/roles/${id}/permissions/revoke`,
      data
    );
    return response.data;
  },

  // Get permissions for a role
  getPermissions: async (
    id: string
  ): Promise<StandardResponse<Permission[]>> => {
    const response = await api.get<StandardResponse<Permission[]>>(
      `/roles/${id}/permissions`
    );
    return response.data;
  },
};
