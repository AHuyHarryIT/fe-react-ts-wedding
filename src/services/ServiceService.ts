import { api } from '@/api/client';
import type {
  CreateServiceRequest,
  MessageResponse,
  PaginatedResponse,
  QueryServiceParams,
  Service,
  StandardResponse,
  UpdateServiceRequest,
} from '@types';

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
  ): Promise<StandardResponse<Service>> => {
    const response = await api.post<StandardResponse<Service>>(
      '/services',
      data
    );
    return response.data;
  },

  // Update a service
  update: async (
    id: string,
    data: UpdateServiceRequest
  ): Promise<StandardResponse<Service>> => {
    const response = await api.patch<StandardResponse<Service>>(
      `/services/${id}`,
      data
    );
    return response.data;
  },

  // Delete a service
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/services/${id}`);
    return response.data;
  },

  // Restore a deleted service
  restore: async (id: string): Promise<StandardResponse<Service>> => {
    const response = await api.patch<StandardResponse<Service>>(
      `/services/${id}/restore`,
      {}
    );
    return response.data;
  },
};
