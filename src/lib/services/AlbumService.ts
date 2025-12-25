import { api } from '../client';
import type {
  PaginationParams,
  PaginatedResponse,
  StandardResponse,
} from '../common';
import type { MessageResponse } from '../types';

export interface Album {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  share_token?: string;
  expiresAt?: string;
  coverFileId?: string;
  ownerUserId: string;
  bookingId?: string;
  oneDriveFolderUrl?: string;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
  };
  coverFile?: {
    id: string;
    storageUrl: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    files: number;
  };
}

export interface AlbumFile {
  albumId: string;
  fileId: string;
  sortOrder: number;
  caption?: string;
  file: {
    id: string;
    storageUrl: string;
    mimeType: string;
    byteSize: number;
  };
}

export interface AlbumWithFiles extends Album {
  files?: AlbumFile[];
}

export interface CreateAlbumRequest {
  ownerUserId?: string;
  title: string;
  description?: string;
  bookingId?: string;
  isPublic?: boolean;
  share_token?: string;
  expiresAt?: string;
  coverFileId?: string;
}

export interface UpdateAlbumRequest {
  title?: string;
  description?: string;
  isPublic?: boolean;
  coverFileId?: string;
}

export interface GenerateShareTokenRequest {
  expiresAt?: string;
}

export interface AddFilesToAlbumRequest {
  files: Array<{
    fileId: string;
    sortOrder?: number;
    caption?: string;
  }>;
}

export interface RemoveFilesFromAlbumRequest {
  fileIds: string[];
}

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
};
