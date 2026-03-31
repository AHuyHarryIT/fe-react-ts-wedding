import { useState } from 'react';
import { Form, notification } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateJobRequest,
  Job,
  JobFormData,
  UpdateJobRequest,
} from '@types';
import { jobApi } from '@services/JobService';

type JobStatusFilter = 'all' | 'active' | 'inactive';

export function useJobManagement() {
  const queryClient = useQueryClient();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [createForm] = Form.useForm<JobFormData>();
  const [editForm] = Form.useForm<JobFormData>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', currentPage, pageSize, searchText, statusFilter],
    queryFn: () =>
      jobApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        isActive:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? true
              : false,
      }),
  });

  const { data: activeJobsData } = useQuery({
    queryKey: ['jobs', 'active-count'],
    queryFn: () => jobApi.getActive(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateJobRequest) => jobApi.create(data),
    onSuccess: () => {
      notificationApi.success({
        message: 'Success',
        description: 'Job created successfully',
      });
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create job';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobRequest }) =>
      jobApi.update(id, data),
    onSuccess: () => {
      notificationApi.success({
        message: 'Success',
        description: 'Job updated successfully',
      });
      setIsEditModalOpen(false);
      setSelectedJob(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update job';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobApi.delete(id),
    onSuccess: () => {
      notificationApi.success({
        message: 'Success',
        description: 'Job deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete job';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => jobApi.toggleStatus(id),
    onSuccess: () => {
      notificationApi.success({
        message: 'Success',
        description: 'Job status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update job status';
      notificationApi.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });

  const handleCreate = (values: JobFormData) => {
    createMutation.mutate({
      name: values.name,
      description: values.description,
      isActive: values.isActive ?? true,
    });
  };

  const handleEdit = (values: JobFormData) => {
    if (!selectedJob) {
      return;
    }

    updateMutation.mutate({
      id: selectedJob.id,
      data: {
        name: values.name,
        description: values.description,
        isActive: values.isActive ?? true,
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const handleOpenEdit = (job: Job) => {
    setSelectedJob(job);
    editForm.setFieldsValue({
      name: job.name,
      description: job.description || '',
      isActive: job.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedJob(null);
    editForm.resetFields();
  };

  return {
    jobs: jobsData?.data || [],
    loading: jobsLoading,
    createLoading: createMutation.isPending,
    updateLoading: updateMutation.isPending,
    total: jobsData?.pagination?.total || 0,
    activeCount: activeJobsData?.data?.length || 0,
    createForm,
    editForm,
    contextHolder,
    isCreateModalOpen,
    isEditModalOpen,
    selectedJob,
    searchText,
    statusFilter,
    currentPage,
    pageSize,
    setIsCreateModalOpen,
    setSearchText,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  };
}
