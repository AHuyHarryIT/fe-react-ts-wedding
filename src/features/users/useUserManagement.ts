import {
  buildForbiddenReason,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';
import { jobApi } from '@services/JobService';
import { roleApi } from '@services/RoleService';
import { userApi } from '@services/UserService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateUserRequest,
  ResetUserPasswordRequest,
  Role,
  UpdateUserRequest,
  User,
  UserWithRoles,
} from '@types';
import { getErrorMessage } from '@utils/error';
import { Form, message } from 'antd';
import { useCallback, useState } from 'react';

interface UserActionState {
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
  resetPasswordReason: string | null;
}

interface UserActionPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canResetPassword: boolean;
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
  resetPasswordReason: string | null;
}

const INITIAL_USER_ACTION_STATE: UserActionState = {
  createReason: null,
  updateReason: null,
  deleteReason: null,
  resetPasswordReason: null,
};

export function useUserManagement() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [messageApi, contextHolder] = message.useMessage();
  const [actionState, setActionState] = useState<UserActionState>(
    INITIAL_USER_ACTION_STATE
  );

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm<ResetUserPasswordRequest>();

  const applyForbiddenReason = (
    error: unknown,
    key: keyof UserActionState
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

  const userActionState: UserActionPermissions = {
    canCreate: actionState.createReason === null,
    canUpdate: actionState.updateReason === null,
    canDelete: actionState.deleteReason === null,
    canResetPassword: actionState.resetPasswordReason === null,
    createReason: actionState.createReason,
    updateReason: actionState.updateReason,
    deleteReason: actionState.deleteReason,
    resetPasswordReason: actionState.resetPasswordReason,
  };

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
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
      setActionState((prev) => ({ ...prev, createReason: null }));
      messageApi.success('Staff account created successfully');
      createForm.resetFields();
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'createReason')) {
        return;
      }

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
      setActionState((prev) => ({ ...prev, updateReason: null }));
      messageApi.success('Staff account updated successfully');
      editForm.resetFields();
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUserId(null);
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'updateReason')) {
        return;
      }

      messageApi.error(
        getErrorMessage(error) || 'Failed to update staff account'
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, deleteReason: null }));
      messageApi.success('Staff account deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }

      messageApi.error(
        getErrorMessage(error) || 'Failed to delete staff account'
      );
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ResetUserPasswordRequest;
    }) => userApi.resetPassword(id, data),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, resetPasswordReason: null }));
      messageApi.success('Staff password reset successfully');
      resetPasswordForm.resetFields();
      setIsResetPasswordModalOpen(false);
      setResetPasswordUserId(null);
    },
    onError: (error) => {
      if (applyForbiddenReason(error, 'resetPasswordReason')) {
        return;
      }

      messageApi.error(getErrorMessage(error) || 'Failed to reset password');
    },
  });

  const handleCreate = useCallback(
    (values: CreateUserRequest) => {
      if (!userActionState.canCreate) {
        messageApi.warning(actionState.createReason || 'Action is not allowed');
        return;
      }

      createMutation.mutate({
        ...values,
        email: values.email?.trim() ? values.email.trim() : undefined,
        jobIds: values.jobIds?.length ? values.jobIds : undefined,
        jobId: values.jobId ?? values.jobIds?.[0] ?? undefined,
        roleIds: values.roleIds?.length ? values.roleIds : undefined,
      });
    },
    [
      actionState.createReason,
      createMutation,
      messageApi,
      userActionState.canCreate,
    ]
  );

  const handleEdit = useCallback(
    (values: UpdateUserRequest) => {
      if (!userActionState.canUpdate) {
        messageApi.warning(actionState.updateReason || 'Action is not allowed');
        return;
      }

      if (!selectedUserId) return;

      updateMutation.mutate({
        id: selectedUserId,
        data: {
          ...values,
          email: values.email?.trim() ? values.email.trim() : undefined,
          jobIds: values.jobIds?.length ? values.jobIds : undefined,
          jobId: values.jobId ?? values.jobIds?.[0] ?? undefined,
          roleIds: values.roleIds?.length ? values.roleIds : undefined,
        },
      });
    },
    [
      actionState.updateReason,
      messageApi,
      selectedUserId,
      updateMutation,
      userActionState.canUpdate,
    ]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!userActionState.canDelete) {
        messageApi.warning(actionState.deleteReason || 'Action is not allowed');
        return;
      }

      deleteMutation.mutate(id);
    },
    [
      actionState.deleteReason,
      deleteMutation,
      messageApi,
      userActionState.canDelete,
    ]
  );

  const handleOpenEdit = useCallback(
    (user: User) => {
      if (!userActionState.canUpdate) {
        messageApi.warning(actionState.updateReason || 'Action is not allowed');
        return;
      }

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
    [actionState.updateReason, editForm, messageApi, userActionState.canUpdate]
  );

  const handleOpenResetPassword = useCallback(
    (user: User) => {
      if (!userActionState.canResetPassword) {
        messageApi.warning(
          actionState.resetPasswordReason || 'Action is not allowed'
        );
        return;
      }

      setResetPasswordUserId(user.id);
      setIsResetPasswordModalOpen(true);
    },
    [
      actionState.resetPasswordReason,
      messageApi,
      resetPasswordForm,
      userActionState.canResetPassword,
    ]
  );

  const handleSubmitResetPassword = useCallback(
    (values: ResetUserPasswordRequest) => {
      if (!userActionState.canResetPassword) {
        messageApi.warning(
          actionState.resetPasswordReason || 'Action is not allowed'
        );
        return;
      }

      if (!resetPasswordUserId) {
        return;
      }

      resetPasswordMutation.mutate({
        id: resetPasswordUserId,
        data: values,
      });
    },
    [
      actionState.resetPasswordReason,
      messageApi,
      resetPasswordMutation,
      resetPasswordUserId,
      userActionState.canResetPassword,
    ]
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

  const handleCloseResetPasswordModal = useCallback(() => {
    setIsResetPasswordModalOpen(false);
    resetPasswordForm.resetFields();
    setResetPasswordUserId(null);
  }, [resetPasswordForm]);

  return {
    isCreateModalOpen,
    isEditModalOpen,
    isResetPasswordModalOpen,
    selectedUser: selectedUserData?.data || selectedUser,
    resetPasswordUserId,
    searchText,
    currentPage,
    pageSize,
    usersData,
    usersLoading,
    rolesData,
    jobsData,
    userActionState,
    createForm,
    editForm,
    resetPasswordForm,
    contextHolder,
    createMutation,
    updateMutation,
    deleteMutation,
    resetPasswordMutation,
    setIsCreateModalOpen,
    handleOpenCreateModal,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleOpenResetPassword,
    handleSubmitResetPassword,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseResetPasswordModal,
  };
}
