import { api } from '@/api/client';
import type {
  CreateJobRequest,
  Job,
  MessageResponse,
  PaginatedResponse,
  QueryJobParams,
  StandardResponse,
  UpdateJobRequest,
} from '@types';

export const jobApi = {
  getAll: async (params?: QueryJobParams): Promise<PaginatedResponse<Job>> => {
    const response = await api.get<PaginatedResponse<Job>>('/jobs', {
      params,
    });
    return response.data;
  },

  getActive: async (): Promise<StandardResponse<Job[]>> => {
    const response = await api.get<StandardResponse<Job[]>>('/jobs/active');
    return response.data;
  },

  getOne: async (id: string): Promise<StandardResponse<Job>> => {
    const response = await api.get<StandardResponse<Job>>(`/jobs/${id}`);
    return response.data;
  },

  create: async (data: CreateJobRequest): Promise<StandardResponse<Job>> => {
    const response = await api.post<StandardResponse<Job>>('/jobs', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateJobRequest
  ): Promise<StandardResponse<Job>> => {
    const response = await api.patch<StandardResponse<Job>>(
      `/jobs/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/jobs/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<StandardResponse<Job>> => {
    const response = await api.patch<StandardResponse<Job>>(
      `/jobs/${id}/toggle-status`,
      {}
    );
    return response.data;
  },
};
