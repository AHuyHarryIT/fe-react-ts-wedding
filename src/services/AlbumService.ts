import { api } from '@/api/client';
import type {
  MessageResponse,
  Album,
  AlbumWithFiles,
  CreateAlbumRequest,
  UpdateAlbumRequest,
  GenerateShareTokenRequest,
  AddFilesToAlbumRequest,
  RemoveFilesFromAlbumRequest,
  PaginationParams,
  PaginatedResponse,
  StandardResponse,
} from '@types';

export const albumApi = {
  // Get all albums with pagination
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Album>> => {
    const response = await api.get<PaginatedResponse<Album>>('/albums', {
      params,
    });
    return response.data;
  },

  // Get a single album by ID
  getOne: async (id: string): Promise<StandardResponse<AlbumWithFiles>> => {
    const response = await api.get<StandardResponse<AlbumWithFiles>>(
      `/albums/${id}`
    );
    return response.data;
  },

  // Get public albums (no authentication required)
  getPublic: async (): Promise<StandardResponse<Album[]>> => {
    const response = await api.get<StandardResponse<Album[]>>('/albums/public');
    return response.data;
  },

  // Get album by share token (no authentication required)
  getByShareToken: async (
    token: string
  ): Promise<StandardResponse<AlbumWithFiles>> => {
    const response = await api.get<StandardResponse<AlbumWithFiles>>(
      `/albums/share/${token}`
    );
    return response.data;
  },

  // Create a new album
  create: async (
    data: CreateAlbumRequest
  ): Promise<StandardResponse<Album>> => {
    const response = await api.post<StandardResponse<Album>>('/albums', data);
    return response.data;
  },

  // Update an album
  update: async (
    id: string,
    data: UpdateAlbumRequest
  ): Promise<StandardResponse<Album>> => {
    const response = await api.patch<StandardResponse<Album>>(
      `/albums/${id}`,
      data
    );
    return response.data;
  },

  // Delete an album
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/albums/${id}`);
    return response.data;
  },

  // Add files to album
  addFiles: async (
    id: string,
    data: AddFilesToAlbumRequest
  ): Promise<StandardResponse<AlbumWithFiles>> => {
    const response = await api.post<StandardResponse<AlbumWithFiles>>(
      `/albums/${id}/files`,
      data
    );
    return response.data;
  },

  // Remove files from album
  removeFiles: async (
    id: string,
    data: RemoveFilesFromAlbumRequest
  ): Promise<StandardResponse<AlbumWithFiles>> => {
    const response = await api.delete<StandardResponse<AlbumWithFiles>>(
      `/albums/${id}/files`,
      { data }
    );
    return response.data;
  },

  // Generate share token for album
  generateShareToken: async (
    id: string,
    data?: GenerateShareTokenRequest
  ): Promise<StandardResponse<Album>> => {
    const response = await api.post<StandardResponse<Album>>(
      `/albums/${id}/share`,
      data
    );
    return response.data;
  },

  // Revoke share token
  revokeShareToken: async (id: string): Promise<StandardResponse<Album>> => {
    const response = await api.delete<StandardResponse<Album>>(
      `/albums/${id}/share`
    );
    return response.data;
  },
  // Upload image to album
  uploadImage: async (
    id: string,
    file: File,
    caption?: string,
    sortOrder?: number
  ): Promise<StandardResponse<AlbumWithFiles>> => {
    return albumApi.uploadImages(id, [file], caption, sortOrder);
  },

  // Upload multiple images to album
  uploadImages: async (
    id: string,
    files: File[],
    caption?: string,
    sortOrder?: number
  ): Promise<StandardResponse<AlbumWithFiles>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (caption) {
      formData.append('caption', caption);
    }
    if (sortOrder !== undefined) {
      formData.append('sortOrder', sortOrder.toString());
    }

    const response = await api.post<StandardResponse<AlbumWithFiles>>(
      `/albums/${id}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get file stream through backend proxy
  getFileUrl: (fileId: string): string => {
    return `${api.defaults.baseURL}/albums/file/${fileId}/download`;
  },

  // Get thumbnail URL
  getThumbnailUrl: async (fileId: string): Promise<string> => {
    try {
      const response = await api.get<{ data: { url: string } }>(
        `/albums/file/${fileId}/thumbnail`
      );
      return response.data.data.url || '';
    } catch (error) {
      console.error('Failed to get thumbnail URL:', error);
      return ''; // Fallback to empty string if thumbnail fails
    }
  },
};
