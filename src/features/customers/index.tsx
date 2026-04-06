import {
  AccountTable,
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@shared/components/management';
import type { ColumnsType } from 'antd/es/table';
import type { Customer } from '@types';
import { CustomerFormModal } from './CustomerFormModal';
import { useCustomerManagement } from './useCustomerManagement';

export function CustomerManagement() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    selectedCustomer,
    searchText,
    currentPage,
    pageSize,
    customersData,
    customersLoading,
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
  } = useCustomerManagement();

  const extraColumns: ColumnsType<Customer> = [
    {
      title: 'Wedding Date',
      dataIndex: 'weddingDate',
      key: 'weddingDate',
      width: 150,
      render: (value) =>
        value ? new Date(value).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Wedding Venue',
      dataIndex: 'weddingVenue',
      key: 'weddingVenue',
      width: 220,
      render: (value) => value || '-',
    },
  ];

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title="Customer Account Management"
            subtitle="Manage customer profiles, wedding details, and account status"
            onCreateClick={() => setIsCreateModalOpen(true)}
            createButtonText="Add Customer Account"
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search customers by phone, name, email, or wedding venue..."
          />
        }
        table={
          <AccountTable
            data={customersData?.data || []}
            loading={customersLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={customersData?.pagination?.total || 0}
            entityLabel="customer account"
            emptyDescription="No customer accounts found"
            extraColumns={extraColumns}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        }
        createModal={
          <CustomerFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createMutation.isPending}
            selectedCustomer={null}
            form={createForm}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <CustomerFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateMutation.isPending}
            selectedCustomer={selectedCustomer}
            form={editForm}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
      />
    </>
  );
}
