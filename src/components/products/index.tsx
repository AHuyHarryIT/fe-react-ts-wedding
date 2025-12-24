import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@components/management';
import { ProductTable } from './ProductTable';
import { ProductFormModal } from './ProductFormModal';
import { useProductManagement } from './useProductManagement';

export function ProductManagement() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    searchText,
    currentPage,
    pageSize,
    productsData,
    productsLoading,
    categoriesData,
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
  } = useProductManagement();

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title="Product Management"
            subtitle="Manage products and inventory"
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search products..."
          />
        }
        table={
          <ProductTable
            data={productsData?.data || []}
            loading={productsLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={productsData?.pagination?.total || 0}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        }
        createModal={
          <ProductFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createMutation.isPending}
            selectedProduct={null}
            form={createForm}
            categories={categoriesData?.data || []}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <ProductFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateMutation.isPending}
            selectedProduct={null}
            form={editForm}
            categories={categoriesData?.data || []}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
      />
    </>
  );
}
