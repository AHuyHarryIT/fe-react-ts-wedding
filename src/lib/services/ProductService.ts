import { api } from '@lib/client';
import type {
  PaginationParams,
  PaginatedResponse,
  StandardResponse,
} from '@lib/common';
import type { MessageResponse } from '@lib/types';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQty: number;
  isActive: boolean;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
}

export const productApi = {
  // Get all products with pagination
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/products', {
      params,
    });
    return response.data;
  },

  // Get a single product by ID
  getOne: async (id: string): Promise<StandardResponse<Product>> => {
    const response = await api.get<StandardResponse<Product>>(
      `/products/${id}`
    );
    return response.data;
  },

  // Create a new product
  create: async (
    data: CreateProductRequest
  ): Promise<StandardResponse<Product>> => {
    const response = await api.post<StandardResponse<Product>>(
      '/products',
      data
    );
    return response.data;
  },

  // Update a product
  update: async (
    id: string,
    data: UpdateProductRequest
  ): Promise<StandardResponse<Product>> => {
    const response = await api.patch<StandardResponse<Product>>(
      `/products/${id}`,
      data
    );
    return response.data;
  },

  // Delete a product
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/products/${id}`);
    return response.data;
  },
};
