import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@components/management';
import { RoleTable } from './RoleTable';
import { RoleFormModal } from './RoleFormModal';
import { RolePermissionModal } from './RolePermissionModal';
import { useRoleManagement } from './useRoleManagement';

export function RoleManagement() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isPermissionModalOpen,
    searchText,
    currentPage,
    pageSize,
    rolesData,
    rolesLoading,
    permissionsData,
    rolePermissionsData,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    assignPermissionsMutation,
    revokePermissionsMutation,
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
  } = useRoleManagement();

  const allPermissions = permissionsData?.data || [];
  const currentPermissionIds =
    rolePermissionsData?.data?.map((p) => p.id) || [];

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title="Role Management"
            subtitle="Manage user roles and permissions"
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search roles..."
          />
        }
        table={
          <RoleTable
            data={rolesData?.data || []}
            loading={rolesLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={rolesData?.pagination?.total || 0}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onManagePermissions={handleOpenPermissions}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        }
        createModal={
          <RoleFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createMutation.isPending}
            selectedRole={null}
            form={createForm}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <RoleFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateMutation.isPending}
            selectedRole={null}
            form={editForm}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
        additionalModals={[
          <RolePermissionModal
            key="role-permission-modal"
            open={isPermissionModalOpen}
            loading={
              assignPermissionsMutation.isPending ||
              revokePermissionsMutation.isPending
            }
            selectedRole={null}
            allPermissions={allPermissions}
            assignedPermissionIds={currentPermissionIds}
            onAssignPermissions={handleAssignPermissions}
            onRevokePermissions={handleRevokePermissions}
            onCancel={handleClosePermissionModal}
          />,
        ]}
      />
    </>
  );
}
