import { api } from '../api/client';
import {
  buildForbiddenReason,
  extractPermissionContext,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import type {
  ApiErrorData,
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
import type { ForbiddenMeta, ForbiddenServiceError } from './PermissionService';

const toForbiddenServiceError = (
  error: unknown,
  fallbackReason: string
): ForbiddenServiceError => {
  const context = extractPermissionContext(error);
  const reason = buildForbiddenReason(error, fallbackReason);

  const forbiddenError = new Error(reason) as ForbiddenServiceError;
  forbiddenError.name = 'ForbiddenServiceError';
  forbiddenError.isForbidden = true;
  forbiddenError.statusCode = 403;
  forbiddenError.code = 'FORBIDDEN';
  forbiddenError.cause = error;

  const details: ForbiddenMeta = {
    context,
    reason,
    requiredPermissions: context?.requiredPermissions ?? [],
    missingPermissions: context?.missingPermissions ?? [],
  };

  forbiddenError.details = details;

  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    forbiddenError.response = (
      error as { response?: { data?: ApiErrorData } }
    ).response;
  }

  return forbiddenError;
};

const withForbiddenContext = async <T>(
  operation: () => Promise<T>,
  fallbackReason: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      throw toForbiddenServiceError(error, fallbackReason);
    }

    throw error;
  }
};

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
  create: async (data: CreateUserRequest): Promise<StandardResponse<User>> =>
    withForbiddenContext(async () => {
      const response = await api.post<StandardResponse<User>>('/users', data);
      return response.data;
    }, 'Missing permission: users:create'),

  // Update a user
  update: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<StandardResponse<User>> =>
    withForbiddenContext(async () => {
      const response = await api.patch<StandardResponse<User>>(
        `/users/${id}`,
        data
      );
      return response.data;
    }, 'Missing permission: users:update'),

  // Delete a user
  delete: async (id: string): Promise<MessageResponse> =>
    withForbiddenContext(async () => {
      const response = await api.delete<MessageResponse>(`/users/${id}`);
      return response.data;
    }, 'Missing permission: users:delete'),

  // Assign roles to user
  assignRoles: async (
    userId: string,
    data: AssignRolesToUserRequest
  ): Promise<StandardResponse<UserWithRoles>> =>
    withForbiddenContext(async () => {
      const response = await api.post<StandardResponse<UserWithRoles>>(
        `/users/${userId}/roles`,
        data
      );
      return response.data;
    }, 'Missing permission: users:update'),

  // Remove roles from user
  removeRoles: async (
    userId: string,
    roleIds: string[]
  ): Promise<StandardResponse<UserWithRoles>> =>
    withForbiddenContext(async () => {
      const response = await api.post<StandardResponse<UserWithRoles>>(
        `/users/${userId}/roles/remove`,
        { roleIds }
      );
      return response.data;
    }, 'Missing permission: users:update'),

  // Activate/Deactivate user
  toggleActive: async (
    id: string,
    isActive: boolean
  ): Promise<StandardResponse<User>> =>
    withForbiddenContext(async () => {
      const response = await api.patch<StandardResponse<User>>(`/users/${id}`, {
        isActive,
      });
      return response.data;
    }, 'Missing permission: users:update'),
};
