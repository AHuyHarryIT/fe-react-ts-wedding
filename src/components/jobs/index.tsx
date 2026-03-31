import { PlusOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import {
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@components/management';
import { StatusChip } from '@components/ui';
import { useMemo } from 'react';
import { JobFormModal } from './JobFormModal';
import { JobTable } from './JobTable';
import { useJobManagement } from './useJobManagement';

const JOB_FILTER_OPTIONS: {
  value: 'all' | 'active' | 'inactive';
  label: string;
}[] = [
  { value: 'all', label: 'All jobs' },
  { value: 'active', label: 'Active jobs' },
  { value: 'inactive', label: 'Inactive jobs' },
];

export function JobManagement() {
  const {
    jobs,
    loading,
    total,
    activeCount,
    createLoading,
    contextHolder,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedJob,
    searchText,
    statusFilter,
    currentPage,
    pageSize,
    updateLoading,
    setIsCreateModalOpen,
    setSearchText,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  } = useJobManagement();

  const summary = useMemo(
    () => (
      <div className="staff-surface rounded-3xl px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Managed jobs
        </div>
        <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
          {activeCount} active / {total} total
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusChip tone="green">Active</StatusChip>
          <StatusChip tone="slate">Inactive</StatusChip>
        </div>
      </div>
    ),
    [activeCount, total]
  );

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            kicker="Booking assignments"
            title="Job Management"
            subtitle="Manage the reusable job names that staff can assign to booking responsibilities."
            createButtonText="Add Job"
            icon={<PlusOutlined />}
            onCreateClick={() => setIsCreateModalOpen(true)}
            summary={summary}
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            placeholder="Search jobs by name or description..."
            helperText="These jobs appear in the booking assignment autocomplete, but staff can still type a custom responsibility when needed."
            extra={
              <Select
                value={statusFilter}
                options={JOB_FILTER_OPTIONS}
                className="min-w-[180px]"
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              />
            }
          />
        }
        table={
          <JobTable
            jobs={jobs}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        }
        createModal={
          <JobFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createLoading}
            selectedJob={null}
            form={createForm}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <JobFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateLoading}
            selectedJob={selectedJob}
            form={editForm}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
      />
    </>
  );
}
