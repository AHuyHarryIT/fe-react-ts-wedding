import { api } from '../api/client';
import type {
  PaginationParams,
  PaginatedResponse,
  StandardResponse,
  MessageResponse,
  User,
  UserWithRoles,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesToUserRequest,
} from '@types';

export const userApi = {
  // Get all users with pagination
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', {
      params,
    });
    return response.data;
  },

  // Get a single user by ID
  getOne: async (id: string): Promise<StandardResponse<UserWithRoles>> => {
    const response = await api.get<StandardResponse<UserWithRoles>>(
      `/users/${id}`
    );
    return response.data;
  },

  // Create a new user
  create: async (data: CreateUserRequest): Promise<StandardResponse<User>> => {
    const response = await api.post<StandardResponse<User>>('/users', data);
    return response.data;
  },

  // Update a user
  update: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<StandardResponse<User>> => {
    const response = await api.patch<StandardResponse<User>>(
      `/users/${id}`,
      data
    );
    return response.data;
  },

  // Delete a user
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/users/${id}`);
    return response.data;
  },

  // Assign roles to user
  assignRoles: async (
    userId: string,
    data: AssignRolesToUserRequest
  ): Promise<StandardResponse<UserWithRoles>> => {
    const response = await api.post<StandardResponse<UserWithRoles>>(
      `/users/${userId}/roles`,
      data
    );
    return response.data;
  },

  // Remove roles from user
  removeRoles: async (
    userId: string,
    roleIds: string[]
  ): Promise<StandardResponse<UserWithRoles>> => {
    const response = await api.post<StandardResponse<UserWithRoles>>(
      `/users/${userId}/roles/remove`,
      { roleIds }
    );
    return response.data;
  },

  // Activate/Deactivate user
  toggleActive: async (
    id: string,
    isActive: boolean
  ): Promise<StandardResponse<User>> => {
    const response = await api.patch<StandardResponse<User>>(`/users/${id}`, {
      isActive,
    });
    return response.data;
  },
};
