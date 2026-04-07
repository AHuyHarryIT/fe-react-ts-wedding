import {
  AccountTable,
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@shared/components/management';
import type { ColumnsType } from 'antd/es/table';
import type { Customer } from '@types';
import { Modal } from 'antd';
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
    selectedRowKeys,
    setSelectedRowKeys,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleBulkDelete,
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
      render: (value: string) =>
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

  const handleBulkDeleteWithConfirm = () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} customer(s)`,
      content: `Are you sure you want to delete ${selectedRowKeys.length} customer account(s)? This action cannot be undone.`,
      okText: `Delete ${selectedRowKeys.length}`,
      okType: 'danger',
      onOk: () => {
        handleBulkDelete([...selectedRowKeys]);
      },
    });
  };

  const rowSelection = {
    selectedRowKeys: [...selectedRowKeys],
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys as string[]);
    },
  };

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
            rowSelection={rowSelection}
            selectedCount={selectedRowKeys.length}
            onBulkDelete={handleBulkDeleteWithConfirm}
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
