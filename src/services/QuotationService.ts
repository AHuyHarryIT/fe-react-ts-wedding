import { api } from '@/api/client';
import type {
  Quotation,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QueryQuotationParams,
  StandardResponse,
  PaginatedResponse,
  MessageResponse,
} from '@types';

export const quotationApi = {
  // Get all quotations with pagination
  getAll: async (
    params?: QueryQuotationParams
  ): Promise<PaginatedResponse<Quotation>> => {
    const response = await api.get<PaginatedResponse<Quotation>>(
      '/quotations',
      { params }
    );
    return response.data;
  },

  // Get a single quotation by ID
  getOne: async (id: string): Promise<StandardResponse<Quotation>> => {
    const response = await api.get<StandardResponse<Quotation>>(
      `/quotations/${id}`
    );
    return response.data;
  },

  // Create a new quotation
  create: async (
    data: CreateQuotationRequest
  ): Promise<StandardResponse<Quotation>> => {
    const response = await api.post<StandardResponse<Quotation>>(
      '/quotations',
      data
    );
    return response.data;
  },

  // Update a quotation
  update: async (
    id: string,
    data: UpdateQuotationRequest
  ): Promise<StandardResponse<Quotation>> => {
    const response = await api.patch<StandardResponse<Quotation>>(
      `/quotations/${id}`,
      data
    );
    return response.data;
  },

  // Delete a quotation (soft delete)
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/quotations/${id}`);
    return response.data;
  },

  // Send quotation to customer
  send: async (id: string): Promise<StandardResponse<Quotation>> => {
    const response = await api.patch<StandardResponse<Quotation>>(
      `/quotations/${id}/send`,
      {}
    );
    return response.data;
  },

  // Accept quotation
  accept: async (id: string): Promise<StandardResponse<Quotation>> => {
    const response = await api.patch<StandardResponse<Quotation>>(
      `/quotations/${id}/accept`,
      {}
    );
    return response.data;
  },

  // Reject quotation
  reject: async (id: string): Promise<StandardResponse<Quotation>> => {
    const response = await api.patch<StandardResponse<Quotation>>(
      `/quotations/${id}/reject`,
      {}
    );
    return response.data;
  },

  // Convert quotation to booking
  convertToBooking: async (
    id: string
  ): Promise<StandardResponse<Quotation>> => {
    const response = await api.patch<StandardResponse<Quotation>>(
      `/quotations/${id}/convert-to-booking`,
      {}
    );
    return response.data;
  },
};
