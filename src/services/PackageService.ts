import { api } from '@/api/client';
import type {
  Package,
  CreatePackageRequest,
  UpdatePackageRequest,
  UpdatePackageServicesRequest,
  QueryPackageParams,
  StandardResponse,
  PaginatedResponse,
} from '@types';

export const packageApi = {
  // Get all packages with pagination
  getAll: async (
    params?: QueryPackageParams
  ): Promise<PaginatedResponse<Package>> => {
    const response = await api.get<PaginatedResponse<Package>>('/packages', {
      params,
    });
    return response.data;
  },

  // Get a single package by ID
  getOne: async (id: string): Promise<StandardResponse<Package>> => {
    const response = await api.get<StandardResponse<Package>>(
      `/packages/${id}`
    );
    return response.data;
  },

  // Create a new package
  create: async (
    data: CreatePackageRequest
  ): Promise<StandardResponse<Package>> => {
    const response = await api.post<StandardResponse<Package>>(
      '/packages',
      data
    );
    return response.data;
  },

  // Update a package
  update: async (
    id: string,
    data: UpdatePackageRequest
  ): Promise<StandardResponse<Package>> => {
    const response = await api.patch<StandardResponse<Package>>(
      `/packages/${id}`,
      data
    );
    return response.data;
  },

  // Delete a package (soft delete)
  delete: async (id: string): Promise<StandardResponse<void>> => {
    const response = await api.delete<StandardResponse<void>>(
      `/packages/${id}`
    );
    return response.data;
  },

  // Restore a deleted package
  restore: async (id: string): Promise<StandardResponse<Package>> => {
    const response = await api.patch<StandardResponse<Package>>(
      `/packages/${id}/restore`
    );
    return response.data;
  },

  // Hard delete a package
  hardDelete: async (id: string): Promise<StandardResponse<void>> => {
    const response = await api.delete<StandardResponse<void>>(
      `/packages/${id}/hard`
    );
    return response.data;
  },

  // Update package services
  updateServices: async (
    id: string,
    data: UpdatePackageServicesRequest
  ): Promise<StandardResponse<Package>> => {
    const response = await api.put<StandardResponse<Package>>(
      `/packages/${id}/services`,
      data
    );
    return response.data;
  },
};
