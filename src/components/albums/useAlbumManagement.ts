import { useState, useRef } from 'react';
import { App, Form } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AddFilesToAlbumRequest,
  Album,
  CreateAlbumRequest,
  GenerateShareTokenRequest,
  PaginationParams,
  RemoveFilesFromAlbumRequest,
  UpdateAlbumRequest,
} from '@/types';
import { albumApi, type UploadProgress } from '@services/AlbumService';

interface AlbumFormData {
  ownerUserId?: string;
  title: string;
  description?: string;
  bookingId?: string;
  isPublic: boolean;
  expiresAt?: string;
}

// Query keys
const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...albumKeys.lists(), params] as const,
  deletedAlbums: () => [...albumKeys.all, 'deleted-albums'] as const,
  deletedAlbumsList: (params?: PaginationParams) =>
    [...albumKeys.deletedAlbums(), params] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: string) => [...albumKeys.details(), id] as const,
  deletedFiles: (id: string) =>
    [...albumKeys.all, 'deleted-files', id] as const,
  public: () => [...albumKeys.all, 'public'] as const,
  shareToken: (token: string) => [...albumKeys.all, 'share', token] as const,
};

export function useAlbumManagement() {
  const queryClient = useQueryClient();
  const { message: messageApi } = App.useApp();
  const contextHolder = null;
  const [createForm] = Form.useForm<AlbumFormData>();
  const [editForm] = Form.useForm<AlbumFormData>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [shareLink, setShareLink] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [showDeletedAlbums, setShowDeletedAlbums] = useState(false);
  const uploadAbortRef = useRef<AbortController | null>(null);

  // Queries
  const { data: albumsData, isLoading: albumsLoading } = useQuery({
    queryKey: albumKeys.list({
      page: currentPage,
      limit: pageSize,
      search: searchText || undefined,
    }),
    queryFn: () =>
      albumApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
    staleTime: 30000,
  });

  const { data: deletedAlbumsData, isLoading: deletedAlbumsLoading } = useQuery(
    {
      queryKey: albumKeys.deletedAlbumsList({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
      queryFn: () =>
        albumApi.getDeleted({
          page: currentPage,
          limit: pageSize,
          search: searchText || undefined,
        }),
      enabled: showDeletedAlbums,
      staleTime: 30000,
    }
  );

  const {
    data: albumDetailsData,
    isLoading: albumDetailsLoading,
    isFetching: albumDetailsFetching,
  } = useQuery({
    queryKey: albumKeys.detail(selectedAlbum?.id || ''),
    queryFn: () => albumApi.getOne(selectedAlbum!.id),
    enabled: !!selectedAlbum && isDetailsModalOpen,
    staleTime: 30000,
  });

  const { data: deletedFilesData, isLoading: deletedFilesLoading } = useQuery({
    queryKey: albumKeys.deletedFiles(selectedAlbum?.id || ''),
    queryFn: () => albumApi.getDeletedFiles(selectedAlbum!.id),
    enabled: !!selectedAlbum && isDetailsModalOpen && showTrash,
    staleTime: 30000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateAlbumRequest) => albumApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      messageApi.success(
        response.message ||
          'Album created successfully! OneDrive folder created.'
      );
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to create album');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlbumRequest }) =>
      albumApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      messageApi.success(response.message || 'Album updated successfully');
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to update album');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => albumApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.deletedAlbums() });
      messageApi.success(response.message || 'Album deleted successfully');
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to delete album');
    },
  });

  const restoreAlbumMutation = useMutation({
    mutationFn: (id: string) => albumApi.restore(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.deletedAlbums() });
      messageApi.success(response.message || 'Album restored successfully');
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to restore album');
    },
  });

  const forceDeleteAlbumMutation = useMutation({
    mutationFn: (id: string) => albumApi.forceDelete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.deletedAlbums() });
      messageApi.success(response.message || 'Album permanently deleted');
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to permanently delete album');
    },
  });

  const addFilesMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddFilesToAlbumRequest }) =>
      albumApi.addFiles(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      messageApi.success(
        response.message || 'Files added to album successfully'
      );
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to add files');
    },
  });

  const removeFilesMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RemoveFilesFromAlbumRequest;
    }) => albumApi.removeFiles(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: albumKeys.deletedFiles(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      messageApi.success(response.message || 'Files moved to trash');
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to remove files');
    },
  });

  const restoreFilesMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RemoveFilesFromAlbumRequest;
    }) => albumApi.restoreFiles(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: albumKeys.deletedFiles(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      messageApi.success(response.message || 'Files restored successfully');
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to restore files');
    },
  });

  const forceDeleteFilesMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RemoveFilesFromAlbumRequest;
    }) => albumApi.forceDeleteFiles(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: albumKeys.deletedFiles(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      messageApi.success(response.message || 'Files permanently deleted');
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to delete files permanently');
    },
  });

  const generateShareTokenMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: GenerateShareTokenRequest;
    }) => albumApi.generateShareToken(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to generate share token');
    },
  });

  const revokeShareTokenMutation = useMutation({
    mutationFn: (id: string) => albumApi.revokeShareToken(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      messageApi.success(
        response.message || 'Share token revoked successfully'
      );
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to revoke share token');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({
      id,
      files,
      caption,
      sortOrder,
    }: {
      id: string;
      files: File[];
      caption?: string;
      sortOrder?: number;
    }) => {
      const controller = new AbortController();
      uploadAbortRef.current = controller;
      return albumApi.uploadImages(
        id,
        files,
        caption,
        sortOrder,
        (progress) => {
          setUploadProgress(progress);
        },
        controller.signal
      );
    },
    onSuccess: (response, variables) => {
      // Invalidate album detail query to fetch updated data
      queryClient.invalidateQueries({
        queryKey: albumKeys.detail(variables.id),
      });
      // Also invalidate the albums list to update thumbnail and file count
      queryClient.invalidateQueries({
        queryKey: albumKeys.lists(),
      });

      // Check if any files failed (partial success)
      const hasFailed = uploadProgress.some((p) => p.status === 'failed');
      if (hasFailed) {
        messageApi.warning(response.message || 'Some images failed to upload');
      } else {
        messageApi.success(response.message || 'Images uploaded successfully');
      }

      // Keep progress visible for 2s so user can see final status
      setTimeout(() => {
        setUploadProgress([]);
      }, 2000);
    },
    onError: (error) => {
      messageApi.error(error.message || 'Failed to upload images');
      // Keep progress visible for 3s so user can see which files failed
      setTimeout(() => {
        setUploadProgress([]);
      }, 3000);
    },
  });

  // Handlers
  const handleCreate = (values: AlbumFormData) => {
    const data: CreateAlbumRequest = {
      ...values,
      expiresAt: values.expiresAt
        ? new Date(values.expiresAt).toISOString()
        : undefined,
    };
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        createForm.resetFields();
      },
    });
  };

  const handleEdit = (values: AlbumFormData) => {
    if (!selectedAlbum) return;

    const data: UpdateAlbumRequest = {
      title: values.title,
      description: values.description,
      isPublic: values.isPublic,
    };

    updateMutation.mutate(
      { id: selectedAlbum.id, data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedAlbum(null);
          editForm.resetFields();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleRestoreAlbum = (id: string) => {
    restoreAlbumMutation.mutate(id);
  };

  const handleForceDeleteAlbum = (id: string) => {
    forceDeleteAlbumMutation.mutate(id);
  };

  const handleOpenEdit = (album: Album) => {
    setSelectedAlbum(album);
    editForm.setFieldsValue({
      ownerUserId: album.ownerUserId,
      title: album.title,
      description: album.description || '',
      bookingId: album.bookingId || '',
      isPublic: album.isPublic,
      expiresAt: album.expiresAt || undefined,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetails = (album: Album) => {
    setSelectedAlbum(album);
    setIsDetailsModalOpen(true);
  };

  const handleAddFiles = (fileIds: string[]) => {
    if (!selectedAlbum) return;

    addFilesMutation.mutate({
      id: selectedAlbum.id,
      data: { files: fileIds.map((fileId) => ({ fileId })) },
    });
  };

  const handleRemoveFiles = (fileIds: string[]) => {
    if (!selectedAlbum) return;

    removeFilesMutation.mutate({
      id: selectedAlbum.id,
      data: { fileIds },
    });
  };

  const handleRestoreFiles = (fileIds: string[]) => {
    if (!selectedAlbum) return;

    restoreFilesMutation.mutate({
      id: selectedAlbum.id,
      data: { fileIds },
    });
  };

  const handleForceDeleteFiles = (fileIds: string[]) => {
    if (!selectedAlbum) return;

    forceDeleteFilesMutation.mutate({
      id: selectedAlbum.id,
      data: { fileIds },
    });
  };

  const handleGenerateShareToken = (album: Album, expiresAt?: string) => {
    const data = expiresAt ? { expiresAt } : undefined;

    generateShareTokenMutation.mutate(
      { id: album.id, data },
      {
        onSuccess: (response) => {
          const token = response.data.share_token;
          const link = `${window.location.origin}/albums/shared/${token}`;
          setShareLink(link);
          setSelectedAlbum(album);
          setIsShareModalOpen(true);
          messageApi.success('Share link generated successfully');
        },
      }
    );
  };

  const handleRevokeShareToken = (albumId: string) => {
    revokeShareTokenMutation.mutate(albumId, {
      onSuccess: () => {
        setIsShareModalOpen(false);
      },
    });
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAlbum(null);
    editForm.resetFields();
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedAlbum(null);
    setShowTrash(false);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setShareLink('');
  };

  const handleUploadImage = (
    files: File[],
    caption?: string,
    sortOrder?: number
  ) => {
    if (!selectedAlbum) return;

    uploadImageMutation.mutate({
      id: selectedAlbum.id,
      files,
      caption,
      sortOrder,
    });
  };

  const handleCancelUpload = () => {
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
      uploadAbortRef.current = null;
      messageApi.warning('Upload cancelled');
    }
  };

  const handleRefreshAlbumDetails = () => {
    if (!selectedAlbum) return;
    queryClient.invalidateQueries({
      queryKey: albumKeys.detail(selectedAlbum.id),
    });
    if (showTrash) {
      queryClient.invalidateQueries({
        queryKey: albumKeys.deletedFiles(selectedAlbum.id),
      });
    }
  };

  return {
    // State
    isCreateModalOpen,
    isEditModalOpen,
    isDetailsModalOpen,
    isShareModalOpen,
    selectedAlbum,
    shareLink,
    searchText,
    currentPage,
    pageSize,
    albumsData,
    albumsLoading,
    albumDetailsData,
    albumDetailsLoading,
    albumDetailsFetching,
    uploadProgress,
    showTrash,
    showDeletedAlbums,
    deletedAlbumsData,
    deletedAlbumsLoading,
    deletedFilesData,
    deletedFilesLoading,
    createForm,
    editForm,
    messageApi,
    contextHolder,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    restoreAlbumMutation,
    forceDeleteAlbumMutation,
    addFilesMutation,
    removeFilesMutation,
    restoreFilesMutation,
    forceDeleteFilesMutation,
    generateShareTokenMutation,
    revokeShareTokenMutation,
    uploadImageMutation,

    // Handlers
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    setShowTrash,
    setShowDeletedAlbums,
    handleCreate,
    handleEdit,
    handleDelete,
    handleRestoreAlbum,
    handleForceDeleteAlbum,
    handleOpenEdit,
    handleOpenDetails,
    handleAddFiles,
    handleRemoveFiles,
    handleRestoreFiles,
    handleForceDeleteFiles,
    handleGenerateShareToken,
    handleRevokeShareToken,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailsModal,
    handleCloseShareModal,
    handleUploadImage,
    handleCancelUpload,
    handleRefreshAlbumDetails,
  };
}
