import { jobApi } from '@services/JobService';
import { roleApi } from '@services/RoleService';
import { userApi } from '@services/UserService';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  CreateUserRequest,
  Role,
  UpdateUserRequest,
  User,
  UserWithRoles,
} from '@types';
import { getErrorMessage } from '@utils/error';
import { Form, message } from 'antd';
import { useCallback, useState } from 'react';

export function useUserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [messageApi, contextHolder] = message.useMessage();

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch users
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: [
      'users',
      { page: currentPage, limit: pageSize, search: searchText },
    ],
    queryFn: () =>
      userApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const allRoles: Role[] = [];
      const pageLimit = 10;

      const firstPage = await roleApi.getAll({ page: 1, limit: pageLimit });
      allRoles.push(...firstPage.data);

      const { totalPages } = firstPage.pagination;

      if (totalPages > 1) {
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, i) => i + 2
        );

        const remainingData = await Promise.all(
          remainingPages.map((page) =>
            roleApi.getAll({ page, limit: pageLimit })
          )
        );

        remainingData.forEach((page) => {
          allRoles.push(...page.data);
        });
      }

      return { data: allRoles };
    },
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'active', 'staff-form'],
    queryFn: async () => {
      const response = await jobApi.getAll({
        page: 1,
        limit: 100,
        isActive: true,
      });
      return { data: response.data };
    },
  });

  // Fetch selected user with roles
  const { data: selectedUserData } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => userApi.getOne(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      messageApi.success('Staff account created successfully');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      refetchUsers();
    },
    onError: (error) => {
      messageApi.error(
        getErrorMessage(error) || 'Failed to create staff account'
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.update(id, data),
    onSuccess: () => {
      messageApi.success('Staff account updated successfully');
      editForm.resetFields();
      setIsEditModalOpen(false);
      refetchUsers();
      setSelectedUserId(null);
    },
    onError: (error) => {
      messageApi.error(
        getErrorMessage(error) || 'Failed to update staff account'
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      messageApi.success('Staff account deleted successfully');
      refetchUsers();
    },
    onError: (error) => {
      messageApi.error(
        getErrorMessage(error) || 'Failed to delete staff account'
      );
    },
  });

  const handleCreate = useCallback(
    (values: CreateUserRequest) => {
      createMutation.mutate({
        ...values,
        email: values.email?.trim() ? values.email.trim() : undefined,
        jobIds: values.jobIds?.length ? values.jobIds : undefined,
        jobId: values.jobId ?? values.jobIds?.[0] ?? undefined,
        roleIds: values.roleIds ?? [],
      });
    },
    [createMutation]
  );

  const handleEdit = useCallback(
    (values: UpdateUserRequest) => {
      if (!selectedUserId) return;

      updateMutation.mutate({
        id: selectedUserId,
        data: {
          ...values,
          email: values.email?.trim() ? values.email.trim() : undefined,
          jobIds: values.jobIds?.length ? values.jobIds : undefined,
          jobId: values.jobId ?? values.jobIds?.[0] ?? undefined,
          roleIds: values.roleIds ?? [],
        },
      });
    },
    [selectedUserId, updateMutation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleOpenEdit = useCallback(
    (user: User) => {
      setSelectedUserId(user.id);
      setSelectedUser(user as UserWithRoles);
      editForm.setFieldsValue({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleIds: user.roles?.map((role) => role.id) ?? [],
        jobIds: user.jobs?.length
          ? user.jobs.map((job) => job.id)
          : user.jobId
            ? [user.jobId]
            : [],
        isActive: user.isActive,
      });
      setIsEditModalOpen(true);
    },
    [editForm]
  );

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const handleOpenCreateModal = useCallback(() => {
    createForm.resetFields();
    setIsCreateModalOpen(true);
  }, [createForm]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedUserId(null);
  }, [editForm]);

  return {
    isCreateModalOpen,
    isEditModalOpen,
    selectedUser: selectedUserData?.data || selectedUser,
    searchText,
    currentPage,
    pageSize,
    usersData,
    usersLoading,
    rolesData,
    jobsData,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    deleteMutation,
    setIsCreateModalOpen,
    handleOpenCreateModal,
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
