import { api } from '@/api/client';
import {
  buildForbiddenReason,
  extractPermissionContext,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import type {
  ApiErrorData,
  Booking,
  CreateBookingRequest,
  AssignBookingStaffRequest,
  UpdateBookingRequest,
  QueryBookingParams,
  StandardResponse,
  PaginatedResponse,
  MessageResponse,
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

export const bookingApi = {
  // Get all bookings with pagination
  getAll: async (
    params?: QueryBookingParams
  ): Promise<PaginatedResponse<Booking>> =>
    withForbiddenContext(async () => {
      const response = await api.get<PaginatedResponse<Booking>>('/bookings', {
        params,
      });
      return response.data;
    }, 'Missing permission: bookings:read'),
  // Get a single booking by ID
  getOne: async (id: string): Promise<StandardResponse<Booking>> =>
    withForbiddenContext(async () => {
      const response = await api.get<StandardResponse<Booking>>(
        `/bookings/${id}`
      );
      return response.data;
    }, 'Missing permission: bookings:read'),
  // Create a new booking
  create: async (
    data: CreateBookingRequest
  ): Promise<StandardResponse<Booking>> =>
    withForbiddenContext(async () => {
      const response = await api.post<StandardResponse<Booking>>(
        '/bookings',
        data
      );
      return response.data;
    }, 'Missing permission: bookings:create'),
  // Update a booking
  update: async (
    id: string,
    data: UpdateBookingRequest
  ): Promise<StandardResponse<Booking>> =>
    withForbiddenContext(async () => {
      const response = await api.patch<StandardResponse<Booking>>(
        `/bookings/${id}`,
        data
      );
      return response.data;
    }, 'Missing permission: bookings:update'),
  // Assign staff members to a booking
  assignStaff: async (
    id: string,
    payload: AssignBookingStaffRequest
  ): Promise<StandardResponse<Booking>> =>
    withForbiddenContext(async () => {
      const response = await api.patch<StandardResponse<Booking>>(
        `/bookings/${id}/staff`,
        payload
      );
      return response.data;
    }, 'Missing permission: bookings:update'),
  // Delete a booking (soft delete)
  delete: async (id: string): Promise<MessageResponse> =>
    withForbiddenContext(async () => {
      const response = await api.delete<MessageResponse>(`/bookings/${id}`);
      return response.data;
    }, 'Missing permission: bookings:delete'),
  // Restore a deleted booking
  restore: async (id: string): Promise<StandardResponse<Booking>> =>
    withForbiddenContext(async () => {
      const response = await api.patch<StandardResponse<Booking>>(
        `/bookings/${id}/restore`,
        {}
      );
      return response.data;
    }, 'Missing permission: bookings:update'),
  // Cancel a booking
  cancel: async (id: string): Promise<StandardResponse<Booking>> =>
    withForbiddenContext(async () => {
      const response = await api.patch<StandardResponse<Booking>>(
        `/bookings/${id}/cancel`,
        {}
      );
      return response.data;
    }, 'Missing permission: bookings:update'),
  // Hard delete a booking
  hardDelete: async (id: string): Promise<StandardResponse<void>> =>
    withForbiddenContext(async () => {
      const response = await api.delete<StandardResponse<void>>(
        `/bookings/${id}/hard`
      );
      return response.data;
    }, 'Missing permission: bookings:delete'),
  // Bulk delete bookings (soft delete)
  bulkDelete: async (ids: string[]): Promise<MessageResponse> =>
    withForbiddenContext(async () => {
      const response = await api.post<MessageResponse>(
        '/bookings/bulk-delete',
        {
          ids,
        }
      );
      return response.data;
    }, 'Missing permission: bookings:delete'),
};
