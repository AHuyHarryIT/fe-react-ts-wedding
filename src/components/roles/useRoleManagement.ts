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

interface RoleFormData {
  name: string;
  description?: string;
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
      const pageLimit = 100;

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
      messageApi.success('Role created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
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
      messageApi.success('Role updated successfully');
      setIsEditModalOpen(false);
      setSelectedRole(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update role';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      messageApi.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
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
      messageApi.success('Permissions assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
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
      messageApi.success('Permissions revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to revoke permissions';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: RoleFormData) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: RoleFormData) => {
    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    editForm.setFieldsValue({
      name: role.name,
      description: role.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  const handleAssignPermissions = (permissionIds: string[]) => {
    if (selectedRole) {
      assignPermissionsMutation.mutate({
        id: selectedRole.id,
        permissionIds,
      });
    }
  };

  const handleRevokePermissions = (permissionIds: string[]) => {
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
