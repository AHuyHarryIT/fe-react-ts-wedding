import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@components/management';
import { CategoryTable } from './CategoryTable';
import { CategoryFormModal } from './CategoryFormModal';
import { useCategoryManagement } from './useCategoryManagement';

export function CategoryManagement() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    searchText,
    currentPage,
    pageSize,
    categoriesData,
    categoriesLoading,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  } = useCategoryManagement();

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title="Category Management"
            subtitle="Manage product categories"
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search categories..."
          />
        }
        table={
          <CategoryTable
            data={categoriesData?.data || []}
            loading={categoriesLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={categoriesData?.pagination?.total || 0}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        }
        createModal={
          <CategoryFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createMutation.isPending}
            selectedCategory={null}
            form={createForm}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <CategoryFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateMutation.isPending}
            selectedCategory={null}
            form={editForm}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
      />
    </>
  );
}
