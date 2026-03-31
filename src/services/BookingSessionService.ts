import { api } from '@/api/client';
import type {
  BookingSession,
  CreateBookingSessionRequest,
  QueryBookingSessionParams,
  StandardResponse,
  PaginatedResponse,
  UpdateBookingSessionRequest,
} from '@types';

export const bookingSessionApi = {
  getAll: async (
    params?: QueryBookingSessionParams
  ): Promise<PaginatedResponse<BookingSession>> => {
    const response = await api.get<PaginatedResponse<BookingSession>>(
      '/booking-sessions',
      {
        params,
      }
    );
    return response.data;
  },

  create: async (
    data: CreateBookingSessionRequest
  ): Promise<BookingSession> => {
    const response = await api.post<BookingSession>('/booking-sessions', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateBookingSessionRequest
  ): Promise<BookingSession> => {
    const response = await api.patch<BookingSession>(
      `/booking-sessions/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<StandardResponse<void> | void> => {
    const response = await api.delete<StandardResponse<void>>(
      `/booking-sessions/${id}`
    );
    return response.data;
  },
};
