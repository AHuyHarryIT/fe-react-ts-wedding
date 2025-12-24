import { api } from '../client';
import type {
  PaginationParams,
  PaginatedResponse,
  StandardResponse,
} from '../common';

export interface Permission {
  id: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export const permissionApi = {
  // Get all permissions with pagination
  list: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Permission>> => {
    const response = await api.get<PaginatedResponse<Permission>>(
      '/permissions',
      { params }
    );
    return response.data;
  },

  // Get a single permission by ID
  getOne: async (id: string): Promise<StandardResponse<Permission>> => {
    const response = await api.get<StandardResponse<Permission>>(
      `/permissions/${id}`
    );
    return response.data;
  },

  // Get a permission by key
  getByKey: async (key: string): Promise<StandardResponse<Permission>> => {
    const response = await api.get<StandardResponse<Permission>>(
      `/permissions/key/${key}`
    );
    return response.data;
  },
};
