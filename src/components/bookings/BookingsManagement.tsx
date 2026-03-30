import { PlusOutlined } from '@ant-design/icons';
import { BookingDetailWithOrders } from '@components/bookings/BookingDetailWithOrders';
import { BookingFormModal } from '@components/bookings/BookingFormModal';
import { BookingTable } from '@components/bookings/BookingTable';
import { useBookingManagement } from '@components/bookings/useBookingManagement';
import {
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@components/management';
import { Typography } from 'antd';

const { Text } = Typography;

export function BookingsManagement() {
  const {
    bookings,
    detailBooking,
    loading,
    loadingBooking,
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
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleOpenEdit,
    handleViewBooking,
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
            summary={
              <div className="staff-surface rounded-3xl px-4 py-3">
                <Text className="!text-xs !font-semibold !uppercase !tracking-[0.18em] !text-slate-500 dark:!text-slate-400">
                  Live records
                </Text>
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
              onView={handleViewBooking}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        }
        createModal={
          <BookingFormModal
            type="create"
            open={isCreateModalOpen}
            loading={false}
            selectedBooking={null}
            form={createForm}
            selectedItems={createSelectedItems}
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
            loading={loadingBooking}
            selectedBooking={selectedBooking}
            form={editForm}
            selectedItems={editSelectedItems}
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
