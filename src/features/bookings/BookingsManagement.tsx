import { PlusOutlined } from '@ant-design/icons';
import { BookingDetailWithOrders } from '@features/bookings/BookingDetailWithOrders';
import { BookingFormModal } from '@features/bookings/BookingFormModal';
import { BookingTable } from '@features/bookings/BookingTable';
import { useBookingManagement } from '@features/bookings/useBookingManagement';
import {
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@shared/components/management';
import { Modal } from 'antd';
import type { Booking } from '@types';

export function BookingsManagement() {
  const {
    bookings,
    detailBooking,
    loading,
    total,
    createForm,
    editForm,
    isDetailModalOpen,
    isCreateModalOpen,
    isEditModalOpen,
    selectedBooking,
    searchText,
    currentPage,
    pageSize,
    contextHolder,
    createSelectedItems,
    editSelectedItems,
    selectedRowKeys,
    canCreateBooking,
    canDeleteBooking,
    bookingActionState,
    createModalLoading,
    editModalLoading,
    createAssignmentConflictState,
    editAssignmentConflictState,
    setSelectedRowKeys,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleOpenEdit,
    handleViewBooking,
    handleDelete,
    handleBulkDelete,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailModal,
    handleDetailBookingUpdated,
    handleAddCreateItem,
    handleRemoveCreateItem,
    handleAddEditItem,
    handleRemoveEditItem,
    calculateCreateTotalPrice,
    calculateEditTotalPrice,
    handleUpdateCreateItemQuantity,
    handleUpdateEditItemQuantity,
  } = useBookingManagement();

  const handleBulkDeleteWithConfirm = () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} booking(s)`,
      content: `Are you sure you want to delete ${selectedRowKeys.length} booking(s)? This action cannot be undone.`,
      okText: `Delete ${selectedRowKeys.length}`,
      okType: 'danger',
      onOk: () => {
        handleBulkDelete([...selectedRowKeys]);
      },
    });
  };

  const rowSelection = {
    selectedRowKeys: [...selectedRowKeys],
    onSelectionChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys as string[]);
    },
    getCheckboxProps: (record: Booking) => ({
      disabled: record.status === 'COMPLETED' || record.status === 'CANCELLED',
      name: `booking-${record.id}`,
    }),
  };

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            kicker="Booking operations"
            title="Bookings"
            subtitle="Review incoming bookings, open order details, and keep the studio schedule organized from a single responsive workspace."
            createButtonText="New Booking"
            icon={<PlusOutlined />}
            onCreateClick={() => setIsCreateModalOpen(true)}
            showCreateButton={canCreateBooking}
            extra={
              bookingActionState.createReason ? (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  {bookingActionState.createReason}
                </span>
              ) : undefined
            }
            summary={
              <div className="staff-surface rounded-3xl px-4 py-3">
                <span className="!text-xs !font-semibold !uppercase !tracking-[0.18em] !text-slate-500 dark:!text-slate-400">
                  Live records
                </span>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {total} bookings
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
            placeholder="Search by customer, phone, or date"
            helperText="Review details, edit pending entries, and open checkout directly from each booking."
          />
        }
        table={
          <div className="staff-table-wrap">
            <BookingTable
              bookings={bookings}
              loading={loading}
              currentPage={currentPage}
              pageSize={pageSize}
              total={total}
              canDelete={canDeleteBooking}
              deleteReason={bookingActionState.deleteReason}
              onView={handleViewBooking}
              onDelete={handleDelete}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              rowSelection={rowSelection}
              selectedCount={selectedRowKeys.length}
              onBulkDelete={handleBulkDeleteWithConfirm}
            />
          </div>
        }
        createModal={
          <BookingFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createModalLoading}
            selectedBooking={null}
            form={createForm}
            selectedItems={createSelectedItems}
            assignmentConflictState={createAssignmentConflictState}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
            onItemAdd={handleAddCreateItem}
            onItemRemove={handleRemoveCreateItem}
            onItemQuantityChange={handleUpdateCreateItemQuantity}
            calculateTotalPrice={calculateCreateTotalPrice}
          />
        }
        editModal={
          <BookingFormModal
            type="edit"
            open={isEditModalOpen}
            loading={editModalLoading}
            selectedBooking={detailBooking || selectedBooking}
            form={editForm}
            selectedItems={editSelectedItems}
            assignmentConflictState={editAssignmentConflictState}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
            onItemAdd={handleAddEditItem}
            onItemRemove={handleRemoveEditItem}
            onItemQuantityChange={handleUpdateEditItemQuantity}
            calculateTotalPrice={calculateEditTotalPrice}
          />
        }
        additionalModals={[
          <BookingDetailWithOrders
            key="booking-detail-modal"
            open={isDetailModalOpen}
            booking={detailBooking}
            onClose={handleCloseDetailModal}
            onBookingUpdated={handleDetailBookingUpdated}
            onEditBooking={handleOpenEdit}
          />,
        ]}
      />
    </>
  );
}
