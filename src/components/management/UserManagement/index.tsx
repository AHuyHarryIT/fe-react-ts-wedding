import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@components/management';
import { UserTable } from './UserTable';
import { UserFormModal } from './UserFormModal';
import { UserRoleModal } from './UserRoleModal';
import { useUserManagement } from './useUserManagement';

export function UserManagement() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isRoleModalOpen,
    selectedUser,
    searchText,
    currentPage,
    pageSize,
    usersData,
    usersLoading,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    assignRolesMutation,
    removeRolesMutation,
    rolesData,
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
  } = useUserManagement();

  const allRoles = rolesData?.data || [];

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title="User Management"
            subtitle="Manage users and assign roles"
            onCreateClick={() => setIsCreateModalOpen(true)}
            createButtonText="Add User"
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search users by phone, name, or email..."
          />
        }
        table={
          <UserTable
            data={usersData?.data || []}
            loading={usersLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={usersData?.pagination?.total || 0}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onManageRoles={handleOpenRoles}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        }
        createModal={
          <UserFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createMutation.isPending}
            selectedUser={null}
            form={createForm}
            roles={allRoles}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <UserFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateMutation.isPending}
            selectedUser={selectedUser}
            form={editForm}
            roles={allRoles}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
        additionalModals={[
          <UserRoleModal
            key="user-role-modal"
            open={isRoleModalOpen}
            loading={
              assignRolesMutation.isPending || removeRolesMutation.isPending
            }
            user={selectedUser}
            roles={allRoles}
            onCancel={handleCloseRoleModal}
            onAssign={handleAssignRoles}
            onRemove={handleRemoveRoles}
          />,
        ]}
      />
    </>
  );
}
