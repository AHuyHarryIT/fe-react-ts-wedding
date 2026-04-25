import { useState } from 'react';
import { Form, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateRoleRequest,
  Permission,
  Role,
  UpdateRoleRequest,
} from '@/types';
import { roleApi } from '@services/RoleService';
import { permissionApi } from '@services/PermissionService';
import {
  buildForbiddenReason,
  extractPermissionContext,
  isPermissionDeniedError,
} from '@/auth/permissionPolicy';

interface RoleFormData {
  name: string;
  description?: string;
}

interface RoleActionState {
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
  managePermissionsReason: string | null;
}

const INITIAL_ROLE_ACTION_STATE: RoleActionState = {
  createReason: null,
  updateReason: null,
  deleteReason: null,
  managePermissionsReason: null,
};

interface RoleActionPermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
  createReason: string | null;
  updateReason: string | null;
  deleteReason: string | null;
  managePermissionsReason: string | null;
}

export function useRoleManagement() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [createForm] = Form.useForm<RoleFormData>();
  const [editForm] = Form.useForm<RoleFormData>();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actionState, setActionState] = useState<RoleActionState>(
    INITIAL_ROLE_ACTION_STATE
  );

  const clearActionState = () => {
    setActionState(INITIAL_ROLE_ACTION_STATE);
  };

  const applyForbiddenReason = (error: unknown, key: keyof RoleActionState) => {
    if (!isPermissionDeniedError(error)) {
      return false;
    }

    const permissionContext = extractPermissionContext(error);
    const reason = buildForbiddenReason(error);

    setActionState((prev) => ({
      ...prev,
      [key]: reason,
    }));

    messageApi.warning(reason);

    return permissionContext !== null || reason.length > 0;
  };

  const canCreate = actionState.createReason === null;
  const canUpdate = actionState.updateReason === null;
  const canDelete = actionState.deleteReason === null;
  const canManagePermissions = actionState.managePermissionsReason === null;

  const roleActionState: RoleActionPermissions = {
    canCreate,
    canUpdate,
    canDelete,
    canManagePermissions,
    createReason: actionState.createReason,
    updateReason: actionState.updateReason,
    deleteReason: actionState.deleteReason,
    managePermissionsReason: actionState.managePermissionsReason,
  };

  // Queries
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', currentPage, pageSize, searchText],
    queryFn: () =>
      roleApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  // Fetch all permissions across multiple pages
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const allPermissions: Permission[] = [];
      const pageLimit = 10;

      const firstPage = await permissionApi.list({ page: 1, limit: pageLimit });
      allPermissions.push(...firstPage.data);

      const { totalPages } = firstPage.pagination;

      if (totalPages > 1) {
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, i) => i + 2
        );

        const remainingData = await Promise.all(
          remainingPages.map((page) =>
            permissionApi.list({ page, limit: pageLimit })
          )
        );

        remainingData.forEach((response) => {
          allPermissions.push(...response.data);
        });
      }

      return { data: allPermissions };
    },
  });

  const { data: rolePermissionsData } = useQuery({
    queryKey: ['role-permissions', selectedRole?.id],
    queryFn: () => roleApi.getPermissions(selectedRole!.id),
    enabled: !!selectedRole && isPermissionModalOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.create(data),
    onSuccess: () => {
      clearActionState();
      messageApi.success('Role created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'createReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create role';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      roleApi.update(id, data),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, updateReason: null }));
      messageApi.success('Role updated successfully');
      setIsEditModalOpen(false);
      setSelectedRole(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'updateReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update role';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, deleteReason: null }));
      messageApi.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'deleteReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete role';
      messageApi.error(errorMessage);
    },
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => roleApi.assignPermissions(id, { permissionIds }),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, managePermissionsReason: null }));
      messageApi.success('Permissions assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'managePermissionsReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to assign permissions';
      messageApi.error(errorMessage);
    },
  });

  const revokePermissionsMutation = useMutation({
    mutationFn: ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => roleApi.revokePermissions(id, { permissionIds }),
    onSuccess: () => {
      setActionState((prev) => ({ ...prev, managePermissionsReason: null }));
      messageApi.success('Permissions revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      if (applyForbiddenReason(error, 'managePermissionsReason')) {
        return;
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to revoke permissions';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: RoleFormData) => {
    if (!canCreate) {
      messageApi.warning(actionState.createReason || 'Action is not allowed');
      return;
    }

    createMutation.mutate(values);
  };

  const handleEdit = (values: RoleFormData) => {
    if (!canUpdate) {
      messageApi.warning(actionState.updateReason || 'Action is not allowed');
      return;
    }

    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      messageApi.warning(actionState.deleteReason || 'Action is not allowed');
      return;
    }

    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (role: Role) => {
    if (!canUpdate) {
      messageApi.warning(actionState.updateReason || 'Action is not allowed');
      return;
    }

    setSelectedRole(role);
    editForm.setFieldsValue({
      name: role.name,
      description: role.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenPermissions = (role: Role) => {
    if (!canManagePermissions) {
      messageApi.warning(
        actionState.managePermissionsReason || 'Action is not allowed'
      );
      return;
    }

    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  const handleAssignPermissions = (permissionIds: string[]) => {
    if (!canManagePermissions) {
      messageApi.warning(
        actionState.managePermissionsReason || 'Action is not allowed'
      );
      return;
    }

    if (selectedRole) {
      assignPermissionsMutation.mutate({
        id: selectedRole.id,
        permissionIds,
      });
    }
  };

  const handleRevokePermissions = (permissionIds: string[]) => {
    if (!canManagePermissions) {
      messageApi.warning(
        actionState.managePermissionsReason || 'Action is not allowed'
      );
      return;
    }

    if (selectedRole) {
      revokePermissionsMutation.mutate({
        id: selectedRole.id,
        permissionIds,
      });
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.resetFields();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRole(null);
    editForm.resetFields();
  };

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedRole(null);
  };

  return {
    // State
    isCreateModalOpen,
    isEditModalOpen,
    isPermissionModalOpen,
    selectedRole,
    searchText,
    currentPage,
    pageSize,
    rolesData,
    rolesLoading,
    permissionsData,
    rolePermissionsData,
    roleActionState,
    createForm,
    editForm,
    messageApi,
    contextHolder,

    // Mutations
    createMutation,
    updateMutation,
    deleteMutation,
    assignPermissionsMutation,
    revokePermissionsMutation,

    // Handlers
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleOpenPermissions,
    handleAssignPermissions,
    handleRevokePermissions,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleClosePermissionModal,
  };
}
