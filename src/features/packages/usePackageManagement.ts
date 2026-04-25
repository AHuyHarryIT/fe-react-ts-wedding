import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import { packageApi } from '@services/PackageService';
import { serviceApi } from '@services/ServiceService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreatePackageRequest,
  Package,
  UpdatePackageRequest,
} from '@types';
import { Form, message } from 'antd';
import { useState } from 'react';

interface PackageFormData {
  name: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  serviceIds?: string[];
  coverImage?: File;
  galleryImages?: File[];
  galleryOrder?: string[];
}

interface PackageActionState {
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
}

interface PackageActionPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
}

const INITIAL_PACKAGE_ACTION_STATE: PackageActionState = {
  createReason: null,
  updateReason: null,
  deleteReason: null,
};

export function usePackageManagement() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<PackageFormData>();
  const [editForm] = Form.useForm<PackageFormData>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actionState, setActionState] = useState<PackageActionState>(
    INITIAL_PACKAGE_ACTION_STATE
  );

  const applyForbiddenReason = (
    error: unknown,
    key: keyof PackageActionState
  ): boolean => {
    if (!isPermissionDeniedError(error)) {
      return false;
    }

    const reason = buildForbiddenReason(error);
    setActionState((prev) => ({
      ...prev,
      [key]: reason,
    }));
    messageApi.warning(reason);

    return true;
  };

  const packageActionState: PackageActionPermissions = {
    canCreate: actionState.createReason === null,
    canUpdate: actionState.updateReason === null,
    canDelete: actionState.deleteReason === null,
    createReason: actionState.createReason,
    updateReason: actionState.updateReason,
    deleteReason: actionState.deleteReason,
  };

  // Queries
  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ['packages', currentPage, pageSize, searchText],
    queryFn: () =>
      packageApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        includeServices: true,
      }),
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.getAll({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreatePackageRequest) => packageApi.create(data),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, createReason: null }));
      messageApi.success('Package created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'createReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create package';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageRequest }) =>
      packageApi.update(id, data),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, updateReason: null }));
      messageApi.success('Package updated successfully');
      setIsEditModalOpen(false);
      setSelectedPackage(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'updateReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update package';
      messageApi.error(errorMessage);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => packageApi.deactivate(id),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, deleteReason: null }));
      messageApi.success('Package deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to deactivate package';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: PackageFormData) => {
    if (!packageActionState.canCreate) {
      messageApi.warning(actionState.createReason || 'Action is not allowed');
      return;
    }

    createMutation.mutate(values);
  };

  const handleEdit = (values: PackageFormData) => {
    if (!packageActionState.canUpdate) {
      messageApi.warning(actionState.updateReason || 'Action is not allowed');
      return;
    }

    if (selectedPackage) {
      updateMutation.mutate({ id: selectedPackage.id, data: values });
    }
  };

  const handleDeactivate = (id: string) => {
    if (!packageActionState.canDelete) {
      messageApi.warning(actionState.deleteReason || 'Action is not allowed');
      return;
    }

    deactivateMutation.mutate(id);
  };

  const handleOpenEdit = (pkg: Package) => {
    if (!packageActionState.canUpdate) {
      messageApi.warning(actionState.updateReason || 'Action is not allowed');
      return;
    }

    setSelectedPackage(pkg);
    editForm.setFieldsValue({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      isActive: pkg.isActive,
      serviceIds: pkg.services?.map((s) => s.serviceId) || [],
      galleryOrder:
        pkg.images
          ?.sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => image.id) || [],
    });
    setIsEditModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPackage(null);
    editForm.resetFields();
  };

  return {
    packages: packagesData?.data || [],
    loading: packagesLoading,
    createLoading: createMutation.isPending,
    updateLoading: updateMutation.isPending,
    total: packagesData?.pagination?.total || 0,
    services: servicesData?.data || [],
    packageActionState,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedPackage,
    searchText,
    currentPage,
    pageSize,
    contextHolder,
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDeactivate,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  };
}
