import { api } from '../client';
import type {
  PaginationParams,
  PaginatedResponse,
  StandardResponse,
} from '../common';
import type { MessageResponse } from '../types';

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const categoryApi = {
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Category>> => {
    const { data } = await api.get('/categories', { params });
    return data;
  },

  getOne: async (id: string): Promise<StandardResponse<Category>> => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  create: async (
    payload: CreateCategoryRequest
  ): Promise<StandardResponse<Category>> => {
    const { data } = await api.post('/categories', payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateCategoryRequest
  ): Promise<StandardResponse<Category>> => {
    const { data } = await api.patch(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};
