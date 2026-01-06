import { Card, Button, Space, Input, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { BookingFormModal } from '@components/bookings/BookingFormModal';
import { BookingTable } from '@components/bookings/BookingTable';
import { BookingDetailModal } from '@components/bookings/BookingDetailModal';
import { useBookingManagement } from '@components/bookings/useBookingManagement';
import type { Booking } from '@types';

export function BookingsManagement() {
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    bookings,
    loading,
    total,
    customers,
    packages,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedBooking,
    searchText,
    currentPage,
    pageSize,
    contextHolder,
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
  } = useBookingManagement();

  const handleViewBooking = (booking: Booking) => {
    setDetailBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailBooking(null);
  };

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
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="Search bookings..."
                prefix={<SearchOutlined />}
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
        </Space>
      </Card>

      <BookingFormModal
        type="create"
        open={isCreateModalOpen}
        loading={false}
        selectedBooking={null}
        form={createForm}
        customers={customers}
        packages={packages}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreate}
      />

      <BookingFormModal
        type="edit"
        open={isEditModalOpen}
        loading={false}
        selectedBooking={selectedBooking}
        form={editForm}
        customers={customers}
        packages={packages}
        onCancel={handleCloseEditModal}
        onSubmit={handleEdit}
      />

      <BookingDetailModal
        open={isDetailModalOpen}
        booking={detailBooking}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
