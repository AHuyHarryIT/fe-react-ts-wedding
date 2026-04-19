import { PlusOutlined } from '@ant-design/icons';
import {
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@shared/components/management';
import { ActionButton } from '@shared/components/ui';
import { PackageDetailModal } from '@features/packages/PackageDetailModal';
import { PackageFormModal } from '@features/packages/PackageFormModal';
import { PackageTable } from '@features/packages/PackageTable';
import { usePackageManagement } from '@features/packages/usePackageManagement';
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
    packageActionState,
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
    handleDeactivate,
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
          showCreateButton={false}
          extra={
            <ActionButton
              action="create"
              size="large"
              label="Add Package"
              icon={<PlusOutlined />}
              disabled={!packageActionState.canCreate}
              tooltip={packageActionState.createReason ?? undefined}
              title={packageActionState.createReason ?? undefined}
              onClick={() => setIsCreateModalOpen(true)}
            />
          }
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
          helperText="Open package details, create and update bundles, manage service mappings, and deactivate offers as needed."
        />
      }
      table={
        <PackageTable
          packages={packages}
          loading={loading}
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          actionState={{
            canUpdate: packageActionState.canUpdate,
            canDelete: packageActionState.canDelete,
            updateReason: packageActionState.updateReason,
            deleteReason: packageActionState.deleteReason,
          }}
          onView={handleViewPackage}
          onEdit={handleOpenEdit}
          onDeactivate={handleDeactivate}
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
