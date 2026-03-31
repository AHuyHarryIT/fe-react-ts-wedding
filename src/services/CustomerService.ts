import { api } from '@/api/client';
import type {
  CreateCustomerRequest,
  Customer,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
  StandardResponse,
  UpdateCustomerRequest,
} from '@types';

export const customerApi = {
  getAll: async (
    params?: PaginationParams & { includeDeleted?: boolean }
  ): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get<PaginatedResponse<Customer>>('/customers', {
      params,
    });
    return response.data;
  },

  getOne: async (id: string): Promise<StandardResponse<Customer>> => {
    const response = await api.get<StandardResponse<Customer>>(
      `/customers/${id}`
    );
    return response.data;
  },

  create: async (
    data: CreateCustomerRequest
  ): Promise<StandardResponse<Customer>> => {
    const response = await api.post<StandardResponse<Customer>>(
      '/customers',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateCustomerRequest
  ): Promise<StandardResponse<Customer>> => {
    const response = await api.patch<StandardResponse<Customer>>(
      `/customers/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/customers/${id}`);
    return response.data;
  },
};
