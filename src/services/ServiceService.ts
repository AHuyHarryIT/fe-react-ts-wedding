import { api } from '@/api/client';
import {
  buildForbiddenReason,
  extractPermissionContext,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import type {
  ApiErrorData,
  CreateServiceRequest,
  MessageResponse,
  PaginatedResponse,
  QueryServiceParams,
  Service,
  StandardResponse,
  UpdateServiceRequest,
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

export const serviceApi = {
  // Get all services with pagination
  getAll: async (
    params?: QueryServiceParams
  ): Promise<PaginatedResponse<Service>> => {
    const response = await api.get<PaginatedResponse<Service>>('/services', {
      params,
    });
    return response.data;
  },

  // Get a single service by ID
  getOne: async (id: string): Promise<StandardResponse<Service>> => {
    const response = await api.get<StandardResponse<Service>>(
      `/services/${id}`
    );
    return response.data;
  },

  // Create a new service
  create: async (
    data: CreateServiceRequest
  ): Promise<StandardResponse<Service>> =>
    withForbiddenContext(async () => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.price) formData.append('price', String(data.price));
      formData.append('isActive', String(data.isActive ?? true));
      formData.append('isLocation', String(data.isLocation ?? false));
      formData.append('isTime', String(data.isTime ?? false));
      if (Object.prototype.hasOwnProperty.call(data, 'jobId')) {
        formData.append('jobId', data.jobId ?? '');
      }
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await api.post<StandardResponse<Service>>(
        '/services',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }, 'Missing permission: services:create'),

  // Update a service
  update: async (
    id: string,
    data: UpdateServiceRequest
  ): Promise<StandardResponse<Service>> =>
    withForbiddenContext(async () => {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.price !== undefined) formData.append('price', String(data.price));
      if (data.isActive !== undefined)
        formData.append('isActive', String(data.isActive));
      if (data.isLocation !== undefined)
        formData.append('isLocation', String(data.isLocation));
      if (data.isTime !== undefined)
        formData.append('isTime', String(data.isTime));
      if (Object.prototype.hasOwnProperty.call(data, 'jobId')) {
        formData.append('jobId', data.jobId ?? '');
      }
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await api.patch<StandardResponse<Service>>(
        `/services/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }, 'Missing permission: services:update'),

  // Delete a service
  delete: async (id: string): Promise<MessageResponse> =>
    withForbiddenContext(async () => {
      const response = await api.delete<MessageResponse>(`/services/${id}`);
      return response.data;
    }, 'Missing permission: services:delete'),

  // Restore a deleted service
  restore: async (id: string): Promise<StandardResponse<Service>> =>
    withForbiddenContext(async () => {
      const response = await api.patch<StandardResponse<Service>>(
        `/services/${id}/restore`,
        {}
      );
      return response.data;
    }, 'Missing permission: services:restore'),
};
