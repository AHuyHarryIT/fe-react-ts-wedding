import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@shared/components/management';
import { UserTable } from './UserTable';
import { UserFormModal } from './UserFormModal';
import { useUserManagement } from './useUserManagement';

export function UserManagement() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
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
    rolesData,
    jobsData,
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
  } = useUserManagement();

  const allRoles = rolesData?.data || [];
  const activeJobs = jobsData?.data || [];

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title="Staff Account Management"
            subtitle="Manage staff accounts, roles, and internal profile details"
            onCreateClick={handleOpenCreateModal}
            createButtonText="Add Staff Account"
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search staff by ID, phone, name, or email..."
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
            form={createForm}
            roles={allRoles}
            jobs={activeJobs}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <UserFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateMutation.isPending}
            form={editForm}
            roles={allRoles}
            jobs={activeJobs}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
      />
    </>
  );
}
