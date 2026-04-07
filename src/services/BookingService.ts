import { api } from '@/api/client';
import type {
  Booking,
  CreateBookingRequest,
  BookingStaffAssignmentInput,
  UpdateBookingRequest,
  QueryBookingParams,
  StandardResponse,
  PaginatedResponse,
  MessageResponse,
} from '@types';

export const bookingApi = {
  // Get all bookings with pagination
  getAll: async (
    params?: QueryBookingParams
  ): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<PaginatedResponse<Booking>>('/bookings', {
      params,
    });
    return response.data;
  },

  // Get a single booking by ID
  getOne: async (id: string): Promise<StandardResponse<Booking>> => {
    const response = await api.get<StandardResponse<Booking>>(
      `/bookings/${id}`
    );
    return response.data;
  },

  // Create a new booking
  create: async (
    data: CreateBookingRequest
  ): Promise<StandardResponse<Booking>> => {
    const response = await api.post<StandardResponse<Booking>>(
      '/bookings',
      data
    );
    return response.data;
  },

  // Update a booking
  update: async (
    id: string,
    data: UpdateBookingRequest
  ): Promise<StandardResponse<Booking>> => {
    const response = await api.patch<StandardResponse<Booking>>(
      `/bookings/${id}`,
      data
    );
    return response.data;
  },

  // Assign staff members to a booking
  assignStaff: async (
    id: string,
    staffAssignments: BookingStaffAssignmentInput[]
  ): Promise<StandardResponse<Booking>> => {
    const response = await api.patch<StandardResponse<Booking>>(
      `/bookings/${id}/staff`,
      {
        staffAssignments,
      }
    );
    return response.data;
  },

  // Delete a booking (soft delete)
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/bookings/${id}`);
    return response.data;
  },

  // Restore a deleted booking
  restore: async (id: string): Promise<StandardResponse<Booking>> => {
    const response = await api.patch<StandardResponse<Booking>>(
      `/bookings/${id}/restore`,
      {}
    );
    return response.data;
  },

  // Cancel a booking
  cancel: async (id: string): Promise<StandardResponse<Booking>> => {
    const response = await api.patch<StandardResponse<Booking>>(
      `/bookings/${id}/cancel`,
      {}
    );
    return response.data;
  },

  // Hard delete a booking
  hardDelete: async (id: string): Promise<StandardResponse<void>> => {
    const response = await api.delete<StandardResponse<void>>(
      `/bookings/${id}/hard`
    );
    return response.data;
  },

  // Bulk delete bookings (soft delete)
  bulkDelete: async (ids: string[]): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/bookings/bulk-delete', {
      ids,
    });
    return response.data;
  },
};
