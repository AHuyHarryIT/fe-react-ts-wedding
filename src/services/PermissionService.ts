import type {
  ApiErrorData,
  PaginatedResponse,
  PaginationParams,
  Permission,
  StandardResponse,
} from '@types';
import { api } from '../api/client';
import {
  buildForbiddenReason,
  extractPermissionContext,
  isPermissionDeniedError,
  type PermissionContext,
} from '@/auth/permissionPolicy';

export interface ForbiddenMeta {
  context: PermissionContext | null;
  reason: string;
  requiredPermissions: string[];
  missingPermissions: string[];
}

export interface ForbiddenServiceError extends Error {
  isForbidden: true;
  statusCode: number;
  code: 'FORBIDDEN';
  details: ForbiddenMeta;
  response?: {
    data?: ApiErrorData;
  };
  cause: unknown;
}

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
  forbiddenError.details = {
    context,
    reason,
    requiredPermissions: context?.requiredPermissions ?? [],
    missingPermissions: context?.missingPermissions ?? [],
  };

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

export const permissionApi = {
  // Get all permissions with pagination
  list: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Permission>> =>
    withForbiddenContext(async () => {
      const response = await api.get<PaginatedResponse<Permission>>(
        '/permissions',
        { params }
      );
      return response.data;
    }, 'Missing permission: permissions:read'),

  // Get a single permission by ID
  getOne: async (id: string): Promise<StandardResponse<Permission>> =>
    withForbiddenContext(async () => {
      const response = await api.get<StandardResponse<Permission>>(
        `/permissions/${id}`
      );
      return response.data;
    }, 'Missing permission: permissions:read'),

  // Get a permission by key
  getByKey: async (key: string): Promise<StandardResponse<Permission>> =>
    withForbiddenContext(async () => {
      const response = await api.get<StandardResponse<Permission>>(
        `/permissions/key/${key}`
      );
      return response.data;
    }, 'Missing permission: permissions:read'),
};
