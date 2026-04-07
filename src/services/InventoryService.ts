import { api } from '@/api/client';
import type {
  CheckinItemRequest,
  CheckoutItemRequest,
  CreateInventoryCategoryRequest,
  CreateInventoryItemRequest,
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
  StandardResponse,
  StockAdjustmentRequest,
  UpdateInventoryCategoryRequest,
  UpdateInventoryItemRequest,
} from '@types';

export const inventoryApi = {
  // ─── Categories ─────────────────────────────────────────────────────
  categories: {
    create: async (
      data: CreateInventoryCategoryRequest
    ): Promise<StandardResponse<InventoryCategory>> => {
      const response = await api.post<StandardResponse<InventoryCategory>>(
        '/inventory/categories',
        data
      );
      return response.data;
    },

    getAll: async (): Promise<StandardResponse<InventoryCategory[]>> => {
      const response = await api.get<StandardResponse<InventoryCategory[]>>(
        '/inventory/categories'
      );
      return response.data;
    },

    update: async (
      id: string,
      data: UpdateInventoryCategoryRequest
    ): Promise<StandardResponse<InventoryCategory>> => {
      const response = await api.patch<StandardResponse<InventoryCategory>>(
        `/inventory/categories/${id}`,
        data
      );
      return response.data;
    },

    delete: async (id: string): Promise<MessageResponse> => {
      const response = await api.delete<MessageResponse>(
        `/inventory/categories/${id}`
      );
      return response.data;
    },
  },

  // ─── Items ────────────────────────────────────────────────────────
  items: {
    getAll: async (
      params?: PaginationParams
    ): Promise<PaginatedResponse<InventoryItem>> => {
      const response = await api.get<PaginatedResponse<InventoryItem>>(
        '/inventory/items',
        { params }
      );
      return response.data;
    },

    getOne: async (id: string): Promise<StandardResponse<InventoryItem>> => {
      const response = await api.get<StandardResponse<InventoryItem>>(
        `/inventory/items/${id}`
      );
      return response.data;
    },

    create: async (
      data: CreateInventoryItemRequest
    ): Promise<StandardResponse<InventoryItem>> => {
      const response = await api.post<StandardResponse<InventoryItem>>(
        '/inventory/items',
        data
      );
      return response.data;
    },

    update: async (
      id: string,
      data: UpdateInventoryItemRequest
    ): Promise<StandardResponse<InventoryItem>> => {
      const response = await api.patch<StandardResponse<InventoryItem>>(
        `/inventory/items/${id}`,
        data
      );
      return response.data;
    },

    delete: async (id: string): Promise<MessageResponse> => {
      const response = await api.delete<MessageResponse>(
        `/inventory/items/${id}`
      );
      return response.data;
    },
  },

  // ─── Checkout / Checkin ─────────────────────────────────────────────
  checkout: async (
    id: string,
    data: CheckoutItemRequest
  ): Promise<StandardResponse<InventoryLog>> => {
    const response = await api.post<StandardResponse<InventoryLog>>(
      `/inventory/items/${id}/checkout`,
      data
    );
    return response.data;
  },

  checkin: async (
    id: string,
    data: CheckinItemRequest
  ): Promise<StandardResponse<InventoryLog>> => {
    const response = await api.post<StandardResponse<InventoryLog>>(
      `/inventory/items/${id}/checkin`,
      data
    );
    return response.data;
  },

  // ─── Stock Adjustment ───────────────────────────────────────────────
  adjustStock: async (
    id: string,
    data: StockAdjustmentRequest
  ): Promise<StandardResponse<InventoryLog>> => {
    const response = await api.post<StandardResponse<InventoryLog>>(
      `/inventory/items/${id}/adjust`,
      data
    );
    return response.data;
  },

  // ─── Logs ──────────────────────────────────────────────────────────
  logs: {
    getAll: async (
      params?: PaginationParams
    ): Promise<PaginatedResponse<InventoryLog>> => {
      const response = await api.get<PaginatedResponse<InventoryLog>>(
        '/inventory/logs',
        { params }
      );
      return response.data;
    },

    getByItem: async (
      itemId: string
    ): Promise<StandardResponse<InventoryLog[]>> => {
      const response = await api.get<StandardResponse<InventoryLog[]>>(
        `/inventory/items/${itemId}/logs`
      );
      return response.data;
    },
  },
};
