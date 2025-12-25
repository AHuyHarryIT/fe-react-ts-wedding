import { useState } from 'react';
import { Form, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  albumApi,
  type Album,
  type CreateAlbumRequest,
  type UpdateAlbumRequest,
  type GenerateShareTokenRequest,
  type AddFilesToAlbumRequest,
  type RemoveFilesFromAlbumRequest,
} from '@lib';
import type { PaginationParams } from '@lib';

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
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: string) => [...albumKeys.details(), id] as const,
  public: () => [...albumKeys.all, 'public'] as const,
  shareToken: (token: string) => [...albumKeys.all, 'share', token] as const,
};

export function useAlbumManagement() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
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

  const { data: albumDetailsData, isLoading: albumDetailsLoading } = useQuery({
    queryKey: albumKeys.detail(selectedAlbum?.id || ''),
    queryFn: () => albumApi.getOne(selectedAlbum!.id),
    enabled: !!selectedAlbum && isDetailsModalOpen,
    staleTime: 30000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateAlbumRequest) => albumApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      message.success(
        response.message ||
          'Album created successfully! OneDrive folder created.'
      );
    },
    onError: (error) => {
      message.error(error.message || 'Failed to create album');
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
      message.success(response.message || 'Album updated successfully');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to update album');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => albumApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      message.success(response.message || 'Album deleted successfully');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete album');
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
      message.success(response.message || 'Files added to album successfully');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to add files');
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
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      message.success(
        response.message || 'Files removed from album successfully'
      );
    },
    onError: (error) => {
      message.error(error.message || 'Failed to remove files');
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
      message.error(error.message || 'Failed to generate share token');
    },
  });

  const revokeShareTokenMutation = useMutation({
    mutationFn: (id: string) => albumApi.revokeShareToken(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      message.success(response.message || 'Share token revoked successfully');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to revoke share token');
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
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setShareLink('');
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
    createForm,
    editForm,
    messageApi,
    contextHolder,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    addFilesMutation,
    removeFilesMutation,
    generateShareTokenMutation,
    revokeShareTokenMutation,

    // Handlers
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleOpenDetails,
    handleAddFiles,
    handleRemoveFiles,
    handleGenerateShareToken,
    handleRevokeShareToken,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailsModal,
    handleCloseShareModal,
  };
}
