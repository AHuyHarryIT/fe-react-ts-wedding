import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { BookingDetailWithOrders } from '@components/bookings/BookingDetailWithOrders';
import { BookingFormModal } from '@components/bookings/BookingFormModal';
import { BookingTable } from '@components/bookings/BookingTable';
import { useBookingManagement } from '@components/bookings/useBookingManagement';
import { Button, Card, Col, Input, Row } from 'antd';

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
    handleDelete,
    handleOpenEdit,
    handleViewBooking,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailModal,
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
    <div style={{ padding: '24px' }}>
      {contextHolder}
      <Card
        title="Bookings Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Booking
          </Button>
        }
      >
        <div className="flex w-full flex-col gap-6">
          <Row gutter={16}>
            <Col span={8}>
              <Input
                id="bookings-search"
                name="bookings-search"
                placeholder="Search bookings..."
                prefix={<SearchOutlined />}
                autoComplete="off"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                allowClear
              />
            </Col>
          </Row>

          <BookingTable
            bookings={bookings}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onView={handleViewBooking}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </Card>

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

      <BookingDetailWithOrders
        open={isDetailModalOpen}
        booking={detailBooking}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
