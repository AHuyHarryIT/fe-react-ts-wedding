import { api } from '@/api/client';
import type {
  CreateProductRequest,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
  Product,
  StandardResponse,
  UpdateProductRequest,
} from '@types';

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
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('price', String(data.price ?? 0));
    formData.append('stockQty', String(data.stockQty ?? 0));
    formData.append('isActive', String(data.isActive ?? false));
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.image) formData.append('image', data.image);

    const response = await api.post<StandardResponse<Product>>(
      '/products',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update a product
  update: async (
    id: string,
    data: UpdateProductRequest
  ): Promise<StandardResponse<Product>> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('price', String(data.price ?? 0));
    formData.append('stockQty', String(data.stockQty ?? 0));
    formData.append('isActive', String(data.isActive ?? false));
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.image) formData.append('image', data.image);

    const response = await api.patch<StandardResponse<Product>>(
      `/products/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Delete a product
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/products/${id}`);
    return response.data;
  },
};
