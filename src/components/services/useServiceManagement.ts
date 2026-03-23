import { useState } from 'react';
import { Form, notification } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceFormData,
} from '@types';
import { serviceApi } from '@services/ServiceService';

export function useServiceManagement() {
  const queryClient = useQueryClient();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [createForm] = Form.useForm<ServiceFormData>();
  const [editForm] = Form.useForm<ServiceFormData>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', currentPage, pageSize, searchText],
    queryFn: () =>
      serviceApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceApi.create(data),
    onSuccess: () => {
      notificationApi.success({
        message: 'Success',
        description: 'Service created successfully',
      });
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create service';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) =>
      serviceApi.update(id, data),
    onSuccess: () => {
      notificationApi.success({
        message: 'Success',
        description: 'Service updated successfully',
      });
      setIsEditModalOpen(false);
      setSelectedService(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update service';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceApi.delete(id),
    onSuccess: () => {
      notificationApi.success({
        message: 'Success',
        description: 'Service deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete service';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  // Handlers
  const handleCreate = (values: ServiceFormData) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: ServiceFormData) => {
    if (selectedService) {
      updateMutation.mutate({ id: selectedService.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (service: Service) => {
    setSelectedService(service);
    editForm.setFieldsValue({
      name: service.name,
      description: service.description || '',
      price: service.price,
      isActive: service.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedService(null);
    editForm.resetFields();
  };

  return {
    services: servicesData?.data || [],
    loading: servicesLoading,
    total: servicesData?.pagination?.total || 0,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedService,
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
