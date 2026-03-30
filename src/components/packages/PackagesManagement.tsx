import { PlusOutlined } from '@ant-design/icons';
import {
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@components/management';
import { PackageDetailModal } from '@components/packages/PackageDetailModal';
import { PackageFormModal } from '@components/packages/PackageFormModal';
import { PackageTable } from '@components/packages/PackageTable';
import { usePackageManagement } from '@components/packages/usePackageManagement';
import type { Package } from '@types';
import { useState } from 'react';

export function PackagesManagement() {
  const [detailPackage, setDetailPackage] = useState<Package | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    packages,
    loading,
    createLoading,
    updateLoading,
    total,
    services,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedPackage,
    searchText,
    currentPage,
    pageSize,
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
  } = usePackageManagement();

  const handleViewPackage = (pkg: Package) => {
    setDetailPackage(pkg);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailPackage(null);
  };

  return (
    <ManagementLayout
      header={
        <ManagementHeader
          kicker="Catalog operations"
          title="Packages"
          subtitle="Maintain package bundles, pricing, and the details staff needs before checkout."
          createButtonText="Add Package"
          icon={<PlusOutlined />}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      }
      searchBar={
        <SearchBar
          value={searchText}
          onChange={(value) => {
            setSearchText(value);
            setCurrentPage(1);
          }}
          placeholder="Search packages..."
          helperText="Open package details, adjust pricing, and keep bundled offers easy to scan."
        />
      }
      table={
        <PackageTable
          packages={packages}
          loading={loading}
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          onView={handleViewPackage}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      }
      createModal={
        <PackageFormModal
          type="create"
          open={isCreateModalOpen}
          loading={createLoading}
          selectedPackage={null}
          form={createForm}
          services={services}
          onCancel={handleCloseCreateModal}
          onSubmit={handleCreate}
        />
      }
      editModal={
        <PackageFormModal
          type="edit"
          open={isEditModalOpen}
          loading={updateLoading}
          selectedPackage={selectedPackage}
          form={editForm}
          services={services}
          onCancel={handleCloseEditModal}
          onSubmit={handleEdit}
        />
      }
      additionalModals={[
        <PackageDetailModal
          key="package-detail-modal"
          open={isDetailModalOpen}
          package={detailPackage}
          onClose={handleCloseDetailModal}
        />,
      ]}
    />
  );
}
