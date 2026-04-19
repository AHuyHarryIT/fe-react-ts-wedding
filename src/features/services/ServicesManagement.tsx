import { PlusOutlined } from '@ant-design/icons';
import {
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@shared/components/management';
import { ActionButton } from '@shared/components/ui';
import { ServiceFormModal } from '@features/services/ServiceFormModal';
import { ServiceTable } from '@features/services/ServiceTable';
import { useServiceManagement } from './useServiceManagement';

export function ServicesManagement() {
  const {
    services,
    jobs,
    loading,
    jobsLoading,
    createLoading,
    updateLoading,
    total,
    serviceActionState,
    contextHolder,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedService,
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
  } = useServiceManagement();

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            kicker="Service catalog"
            title="Services"
            subtitle="Keep standalone services, imagery, and pricing polished for the whole staff workflow."
            showCreateButton={false}
            extra={
              <ActionButton
                action="create"
                size="large"
                label="Add Service"
                icon={<PlusOutlined />}
                disabled={!serviceActionState.canCreate}
                tooltip={serviceActionState.createReason ?? undefined}
                title={serviceActionState.createReason ?? undefined}
                onClick={() => setIsCreateModalOpen(true)}
              />
            }
            summary={
              <div className="staff-surface rounded-3xl px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Active records
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {total} services
                </div>
              </div>
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
            placeholder="Search services..."
            helperText="Refine the service list quickly, then edit or retire offerings without leaving the table."
          />
        }
        table={
          <ServiceTable
            services={services}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            actionState={{
              canUpdate: serviceActionState.canUpdate,
              canDelete: serviceActionState.canDelete,
              updateReason: serviceActionState.updateReason,
              deleteReason: serviceActionState.deleteReason,
            }}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        }
        createModal={
          <ServiceFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createLoading}
            selectedService={null}
            jobs={jobs}
            jobsLoading={jobsLoading}
            form={createForm}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <ServiceFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateLoading}
            selectedService={selectedService}
            jobs={jobs}
            jobsLoading={jobsLoading}
            form={editForm}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
      />
    </>
  );
}
