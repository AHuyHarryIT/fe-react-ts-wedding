import { api } from '@/api/client';
import type {
  MessageResponse,
  Album,
  AlbumImage,
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

export interface UploadProgress {
  fileName: string;
  percent: number;
  message: string;
  status: 'waiting' | 'uploading' | 'processing' | 'complete' | 'failed';
  speed?: number; // bytes per second
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

  // Delete an album (soft delete)
  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/albums/${id}`);
    return response.data;
  },

  // Get deleted albums (trash)
  getDeleted: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Album>> => {
    const response = await api.get<PaginatedResponse<Album>>(
      '/albums/deleted',
      { params }
    );
    return response.data;
  },

  // Restore a soft-deleted album
  restore: async (id: string): Promise<StandardResponse<Album>> => {
    const response = await api.patch<StandardResponse<Album>>(
      `/albums/${id}/restore`
    );
    return response.data;
  },

  // Force delete album (permanently from OneDrive + DB)
  forceDelete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/albums/${id}/hard`);
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

  // Remove files from album (soft delete — move to trash)
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

  // Get deleted files in album (trash)
  getDeletedFiles: async (
    id: string
  ): Promise<StandardResponse<AlbumImage[]>> => {
    const response = await api.get<StandardResponse<AlbumImage[]>>(
      `/albums/${id}/deleted-files`
    );
    return response.data;
  },

  // Restore soft-deleted files
  restoreFiles: async (
    id: string,
    data: RemoveFilesFromAlbumRequest
  ): Promise<StandardResponse<{ message: string; count: number }>> => {
    const response = await api.patch<
      StandardResponse<{ message: string; count: number }>
    >(`/albums/${id}/files/restore`, data);
    return response.data;
  },

  // Force delete files (permanently from OneDrive + DB)
  forceDeleteFiles: async (
    id: string,
    data: RemoveFilesFromAlbumRequest
  ): Promise<StandardResponse<{ message: string; count: number }>> => {
    const response = await api.delete<
      StandardResponse<{ message: string; count: number }>
    >(`/albums/${id}/files/force`, { data });
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

  // Upload multiple images to album with progress tracking
  uploadImages: async (
    id: string,
    files: File[],
    caption?: string,
    sortOrder?: number,
    onProgress?: (progress: UploadProgress[]) => void,
    signal?: AbortSignal
  ): Promise<StandardResponse<AlbumWithFiles>> => {
    const MAX_CONCURRENT = 10; // Limit concurrent uploads to aoverwhelming browser/server

    // Track progress for each file independently
    const fileProgress: UploadProgress[] = files.map((file) => ({
      fileName: file.name,
      percent: 0,
      message: 'Waiting...',
      status: 'waiting' as const,
    }));

    // Throttled progress updater — fire at most every 250ms
    let progressTimer: ReturnType<typeof setTimeout> | null = null;

    const flushProgress = () => {
      progressTimer = null;
      onProgress?.([...fileProgress]);
    };

    const updateProgress = (immediate = false) => {
      if (immediate) {
        // Status changes (complete/failed) flush immediately
        if (progressTimer) {
          clearTimeout(progressTimer);
          progressTimer = null;
        }
        onProgress?.([...fileProgress]);
        return;
      }
      // Percent ticks are throttled to at most every 250ms
      if (!progressTimer) {
        progressTimer = setTimeout(flushProgress, 250);
      }
    };

    updateProgress(true);

    // Speed tracking per file
    const speedTracker: {
      startTime: number;
      lastLoaded: number;
      lastTime: number;
    }[] = files.map(() => ({ startTime: 0, lastLoaded: 0, lastTime: 0 }));

    // Upload a single file with per-file progress tracking
    const uploadSingleFile = (file: File, index: number) => {
      const now = Date.now();
      speedTracker[index] = { startTime: now, lastLoaded: 0, lastTime: now };
      fileProgress[index] = {
        fileName: file.name,
        percent: 0,
        message: '0%',
        status: 'uploading',
        speed: 0,
      };
      updateProgress(true);

      const formData = new FormData();
      formData.append('files', file);
      if (caption) formData.append('caption', caption);
      if (sortOrder !== undefined) {
        formData.append('sortOrder', (sortOrder + index).toString());
      }

      return api
        .post<StandardResponse<AlbumWithFiles>>(
          `/albums/${id}/upload-image`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            signal,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100
                );
                // Calculate speed
                const now = Date.now();
                const tracker = speedTracker[index];
                const elapsed = (now - tracker.lastTime) / 1000;
                let speed = fileProgress[index].speed || 0;
                if (elapsed > 0.2) {
                  speed = (progressEvent.loaded - tracker.lastLoaded) / elapsed;
                  tracker.lastLoaded = progressEvent.loaded;
                  tracker.lastTime = now;
                }
                fileProgress[index] = {
                  fileName: file.name,
                  percent,
                  message: `${percent}%`,
                  status: 'uploading',
                  speed,
                };
                updateProgress(); // throttled
              }
            },
          }
        )
        .then((response) => {
          fileProgress[index] = {
            fileName: file.name,
            percent: 100,
            message: 'Complete',
            status: 'complete',
          };
          updateProgress(true); // immediate
          return response.data;
        })
        .catch((error) => {
          fileProgress[index] = {
            fileName: file.name,
            percent: fileProgress[index].percent,
            message: 'Failed',
            status: 'failed',
          };
          updateProgress(true); // immediate
          throw error;
        });
    };

    // Upload files with concurrency limit
    const results: PromiseSettledResult<StandardResponse<AlbumWithFiles>>[] =
      [];
    for (let i = 0; i < files.length; i += MAX_CONCURRENT) {
      // Stop sending new batches if cancelled
      if (signal?.aborted) {
        for (let k = i; k < files.length; k++) {
          if (fileProgress[k].status === 'waiting') {
            fileProgress[k] = {
              fileName: files[k].name,
              percent: 0,
              message: 'Cancelled',
              status: 'failed',
            };
          }
        }
        updateProgress(true);
        break;
      }
      const batch = files.slice(i, i + MAX_CONCURRENT);
      const batchResults = await Promise.allSettled(
        batch.map((file, j) => uploadSingleFile(file, i + j))
      );
      results.push(...batchResults);
    }

    // Flush any pending throttled progress
    if (progressTimer) {
      clearTimeout(progressTimer);
      flushProgress();
    }

    // Collect results
    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected'
    );
    const successes = results.filter(
      (r): r is PromiseFulfilledResult<StandardResponse<AlbumWithFiles>> =>
        r.status === 'fulfilled'
    );

    if (successes.length === 0) {
      throw new Error('All uploads failed');
    }

    if (failures.length > 0) {
      // Some failed — return last success but mention failures
      const lastSuccess = successes[successes.length - 1].value;
      lastSuccess.message = `${successes.length}/${files.length} image(s) uploaded successfully`;
      return lastSuccess;
    }

    return successes[successes.length - 1].value;
  },

  // Get thumbnail URL (proxied through backend — no extra API call needed)
  getThumbnailUrl: (fileId: string): string => {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseURL}/albums/file/${fileId}/thumbnail`;
  },

  // Get original file content URL (for preview)
  getOriginalContentUrl: (fileId: string): string => {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseURL}/albums/file/${fileId}/content`;
  },
};
