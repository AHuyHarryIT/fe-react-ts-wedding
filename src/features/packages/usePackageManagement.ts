import { useState } from 'react';
import { Form, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Package,
  CreatePackageRequest,
  UpdatePackageRequest,
} from '@types';
import { packageApi } from '@services/PackageService';
import { serviceApi } from '@services/ServiceService';

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
      messageApi.success('Package created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: unknown) => {
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
      messageApi.success('Package updated successfully');
      setIsEditModalOpen(false);
      setSelectedPackage(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update package';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => packageApi.delete(id),
    onSuccess: () => {
      messageApi.success('Package deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete package';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: PackageFormData) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: PackageFormData) => {
    if (selectedPackage) {
      updateMutation.mutate({ id: selectedPackage.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (pkg: Package) => {
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
    handleDelete,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  };
}
