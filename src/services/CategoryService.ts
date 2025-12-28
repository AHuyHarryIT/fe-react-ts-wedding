import type {
  Category,
  CreateCategoryRequest,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
  StandardResponse,
  UpdateCategoryRequest,
} from '@types';
import { api } from '../api/client';

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
