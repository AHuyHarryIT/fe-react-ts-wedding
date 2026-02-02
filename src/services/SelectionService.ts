import type { PaginatedResponse, SelectionParams } from '@types';
import { api } from '@/api/client';

export const selectionApi = {
  // Fetch selections with pagination and search
  getAll: async <TExtra = unknown>(
    params: SelectionParams
  ): Promise<PaginatedResponse<TExtra>> => {
    const response = await api.get<PaginatedResponse<TExtra>>('/selections', {
      params,
    });

    return response.data;
  },
};
