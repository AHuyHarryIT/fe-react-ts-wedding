import { roleApi } from '@services/RoleService';
import { userApi } from '@services/UserService';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserWithRoles,
} from '@types';
import { Form, message } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { getErrorMessage } from '@utils/error';

export function useUserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
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

  // Fetch roles with infinite query
  const {
    data: rolesInfiniteData,
    isLoading: rolesLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['roles-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      roleApi.getAll({ page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.pagination.page;
      const totalPages = Math.ceil(
        lastPage.pagination.total / lastPage.pagination.limit
      );
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten the pages data into a single array
  const lazyRoles = useMemo(
    () => rolesInfiniteData?.pages.flatMap((page) => page.data) ?? [],
    [rolesInfiniteData]
  );

  // Fetch selected user with roles
  const { data: selectedUserData, refetch: refetchSelectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => userApi.getOne(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      messageApi.success('User created successfully');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      refetchUsers();
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to create user');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.update(id, data),
    onSuccess: () => {
      messageApi.success('User updated successfully');
      editForm.resetFields();
      setIsEditModalOpen(false);
      refetchUsers();
      setSelectedUserId(null);
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to update user');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      messageApi.success('User deleted successfully');
      refetchUsers();
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to delete user');
    },
  });

  // Assign roles mutation
  const assignRolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      userApi.assignRoles(userId, { roleIds }),
    onSuccess: () => {
      messageApi.success('Roles assigned successfully');
      refetchUsers();
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to assign roles');
    },
  });

  // Remove roles mutation
  const removeRolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      userApi.removeRoles(userId, roleIds),
    onSuccess: () => {
      messageApi.success('Roles removed successfully');
      refetchUsers();
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to remove roles');
    },
  });

  const handleCreate = useCallback(
    (values: CreateUserRequest) => {
      createMutation.mutate(values);
    },
    [createMutation]
  );

  const handleEdit = useCallback(
    (values: UpdateUserRequest) => {
      if (!selectedUserId) return;

      updateMutation.mutate({
        id: selectedUserId,
        data: values,
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
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
      });
      setIsEditModalOpen(true);
    },
    [editForm]
  );

  const handleOpenRoles = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setIsRoleModalOpen(true);
  }, []);

  const handleAssignRoles = useCallback(
    (roleIds: string[]) => {
      if (!selectedUserId) return;
      assignRolesMutation.mutate(
        { userId: selectedUserId, roleIds },
        {
          onSuccess: () => {
            refetchSelectedUser();
          },
        }
      );
    },
    [selectedUserId, assignRolesMutation, refetchSelectedUser]
  );

  const handleRemoveRoles = useCallback(
    (roleIds: string[]) => {
      if (!selectedUserId) return;
      removeRolesMutation.mutate(
        { userId: selectedUserId, roleIds },
        {
          onSuccess: () => {
            refetchSelectedUser();
          },
        }
      );
    },
    [selectedUserId, removeRolesMutation, refetchSelectedUser]
  );

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    editForm.resetFields();
    setSelectedUserId(null);
  }, [editForm]);

  const handleCloseRoleModal = useCallback(() => {
    setIsRoleModalOpen(false);
    setSelectedUserId(null);
  }, []);

  const handleRoleScrollLoad = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    isCreateModalOpen,
    isEditModalOpen,
    isRoleModalOpen,
    selectedUser: selectedUserData?.data || selectedUser,
    searchText,
    currentPage,
    pageSize,
    usersData,
    usersLoading,
    lazyRoles,
    rolesLoading,
    isFetchingNextPage,
    hasNextPage,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    deleteMutation,
    assignRolesMutation,
    removeRolesMutation,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleOpenRoles,
    handleAssignRoles,
    handleRemoveRoles,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseRoleModal,
    handleRoleScrollLoad,
  };
}
