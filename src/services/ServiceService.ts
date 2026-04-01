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
  },

  // Update a service
  update: async (
    id: string,
    data: UpdateServiceRequest
  ): Promise<StandardResponse<Service>> => {
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
