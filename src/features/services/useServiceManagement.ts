import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import { jobApi } from '@services/JobService';
import { serviceApi } from '@services/ServiceService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateServiceRequest,
  Service,
  ServiceFormData,
  UpdateServiceRequest,
} from '@types';
import { Form, notification } from 'antd';
import { useState } from 'react';

interface ServiceActionState {
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
}

interface ServiceActionPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
}

const INITIAL_SERVICE_ACTION_STATE: ServiceActionState = {
  createReason: null,
  updateReason: null,
  deleteReason: null,
};

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
  const [actionState, setActionState] = useState<ServiceActionState>(
    INITIAL_SERVICE_ACTION_STATE
  );

  const applyForbiddenReason = (
    error: unknown,
    key: keyof ServiceActionState
  ): boolean => {
    if (!isPermissionDeniedError(error)) {
      return false;
    }

    const reason = buildForbiddenReason(error);
    setActionState((prev) => ({
      ...prev,
      [key]: reason,
    }));
    notificationApi.warning({
      message: 'Permission denied',
      description: reason,
    });

    return true;
  };

  const serviceActionState: ServiceActionPermissions = {
    canCreate: actionState.createReason === null,
    canUpdate: actionState.updateReason === null,
    canDelete: actionState.deleteReason === null,
    createReason: actionState.createReason,
    updateReason: actionState.updateReason,
    deleteReason: actionState.deleteReason,
  };

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

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', 'active-for-services'],
    queryFn: () =>
      jobApi.getAll({
        page: 1,
        limit: 100,
        isActive: true,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceApi.create(data),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, createReason: null }));
      notificationApi.success({
        message: 'Success',
        description: 'Service created successfully',
      });
      setIsCreateModalOpen(false);
      createForm.resetFields();
      void queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'createReason')) {
        return;
      }

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
      setActionState((prev) => ({ ...prev, updateReason: null }));
      notificationApi.success({
        message: 'Success',
        description: 'Service updated successfully',
      });
      setIsEditModalOpen(false);
      setSelectedService(null);
      editForm.resetFields();
      void queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'updateReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update service';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => serviceApi.deactivate(id),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, deleteReason: null }));
      notificationApi.success({
        message: 'Success',
        description: 'Service deactivated successfully',
      });
      void queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to deactivate service';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  // Handlers
  const handleCreate = (values: ServiceFormData) => {
    if (!serviceActionState.canCreate) {
      notificationApi.warning({
        message: serviceActionState.createReason ?? 'Action is not allowed',
      });
      return;
    }

    createMutation.mutate(values);
  };

  const handleEdit = (values: ServiceFormData) => {
    if (!serviceActionState.canUpdate) {
      notificationApi.warning({
        message: serviceActionState.updateReason ?? 'Action is not allowed',
      });
      return;
    }

    if (selectedService) {
      updateMutation.mutate({ id: selectedService.id, data: values });
    }
  };

  const handleDeactivate = (id: string) => {
    if (!serviceActionState.canDelete) {
      notificationApi.warning({
        message: serviceActionState.deleteReason ?? 'Action is not allowed',
      });
      return;
    }

    deactivateMutation.mutate(id);
  };

  const handleOpenEdit = (service: Service) => {
    if (!serviceActionState.canUpdate) {
      notificationApi.warning({
        message: serviceActionState.updateReason ?? 'Action is not allowed',
      });
      return;
    }

    setSelectedService(service);
    editForm.setFieldsValue({
      name: service.name,
      description: service.description || '',
      price: service.price,
      isActive: service.isActive,
      isLocation: service.isLocation,
      isTime: service.isTime,
      jobId: service.jobId ?? null,
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
    jobs: jobsData?.data || [],
    loading: servicesLoading,
    jobsLoading,
    createLoading: createMutation.isPending,
    updateLoading: updateMutation.isPending,
    total: servicesData?.pagination?.total || 0,
    serviceActionState,
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
    handleDeactivate,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  };
}
