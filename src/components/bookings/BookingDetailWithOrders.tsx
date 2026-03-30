import React, { useState, useEffect, useCallback } from 'react';
import type { Booking, BookingStatus, Order } from '@types';
import {
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row,
  Statistic,
  Tag,
  Button,
  message,
  Tabs,
  Space,
  Empty,
} from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import {
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { bookingApi } from '@services/BookingService';
import { ordersService } from '@services/OrdersService';
import { CheckoutForm, OrderDetail } from '@components/orders';
import { formatMoneyVND } from '@utils/money';

interface BookingDetailWithOrdersProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onBookingUpdated?: (booking: Booking) => void;
  onEditBooking?: (booking: Booking) => Promise<void> | void;
}

const statusColorMap: Record<BookingStatus, string> = {
  PENDING: 'orange',
  DEPOSIT_PAID: 'purple',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'purple',
};

const formatBookingStatus = (status: BookingStatus) =>
  status.replace(/_/g, ' ');

export const BookingDetailWithOrders: React.FC<
  BookingDetailWithOrdersProps
> = ({ open, booking, onClose, onBookingUpdated, onEditBooking }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const queryClient = useQueryClient();

  // Load order for this booking
  const loadOrder = useCallback(async () => {
    if (!booking?.id) return;
    try {
      setLoadingOrder(true);
      const data = await ordersService.getOrderByBookingId(booking.id);
      setOrder(data);
    } catch {
      // Order may not exist yet
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  }, [booking?.id]);

  useEffect(() => {
    if (open && booking?.id) {
      loadOrder();
    }
  }, [open, booking?.id, loadOrder]);

  useEffect(() => {
    if (open) {
      setActiveTab('details');
    }
  }, [open, booking?.id]);

  const handleCheckoutSuccess = async (updatedOrder: Order | null) => {
    // Immediately update with the returned order data
    if (updatedOrder) {
      setOrder(updatedOrder);
    }
    setCheckoutModalOpen(false);
    // Also reload to ensure we have the latest data
    await loadOrder();
    // Refresh booking to reflect order association
    await queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const canEditBooking =
    booking?.status !== 'COMPLETED' && booking?.status !== 'CANCELLED';
  const canDeleteBooking = booking?.status === 'PENDING';
  const canCancelBooking =
    booking?.status !== 'COMPLETED' && booking?.status !== 'CANCELLED';
  const canMarkCompleted =
    booking?.status === 'CONFIRMED' && order?.status === 'PAID';

  const handleEdit = async () => {
    if (!booking) {
      return;
    }

    if (!canEditBooking) {
      message.error('This booking cannot be edited');
      return;
    }

    onClose();
    await onEditBooking?.(booking);
  };

  const handleDelete = async () => {
    if (!canDeleteBooking) {
      message.error('Cannot delete completed booking');
      return;
    }
    Modal.confirm({
      title: 'Delete Booking',
      content: 'Are you sure you want to delete this booking?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await bookingApi.delete(booking!.id);
          message.success('Booking deleted successfully');
          onClose();
          await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        } catch {
          message.error('Failed to delete booking');
        }
      },
    });
  };

  const handleCancelBooking = async () => {
    if (!booking) {
      return;
    }

    if (!canCancelBooking) {
      message.error('This booking cannot be cancelled');
      return;
    }

    Modal.confirm({
      title: 'Cancel Booking',
      content:
        'This will mark the booking as cancelled and hide payment actions for the customer. Continue?',
      okText: 'Cancel Booking',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await bookingApi.cancel(booking.id);
          message.success('Booking cancelled successfully');
          onBookingUpdated?.(response.data);
          await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        } catch (error) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to cancel booking';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleMarkCompleted = async () => {
    if (!booking) {
      return;
    }

    if (!canMarkCompleted) {
      message.error(
        'Only confirmed bookings with a fully paid order can be marked completed'
      );
      return;
    }

    Modal.confirm({
      title: 'Mark Booking Completed',
      content:
        'This will lock the booking from further edits. Continue to mark it as completed?',
      okText: 'Mark Completed',
      onOk: async () => {
        try {
          const response = await bookingApi.update(booking.id, {
            status: 'COMPLETED',
          });
          message.success('Booking marked as completed');
          onBookingUpdated?.(response.data);
          await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        } catch (error) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to mark booking as completed';
          message.error(errorMessage);
        }
      },
    });
  };

  if (!booking) {
    return null;
  }

  return (
    <>
      <Modal
        title="Booking Details"
        open={open}
        onCancel={onClose}
        footer={null}
        width={1000}
      >
        {/* Header Stats */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Price"
              value={formatMoneyVND(booking.totalPrice)}
              styles={{ content: { color: '#1890ff', fontSize: '18px' } }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Items"
              value={
                (booking.packages?.length || 0) +
                (booking.services?.length || 0)
              }
              suffix="items"
            />
          </Col>
          <Col xs={24} sm={8}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <Statistic
                title="Status"
                value={formatBookingStatus(booking.status as BookingStatus)}
                styles={{ content: { fontSize: '14px' } }}
                suffix={
                  <Tag color={statusColorMap[booking.status as BookingStatus]}>
                    {formatBookingStatus(booking.status as BookingStatus)}
                  </Tag>
                }
              />
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'details',
              label: 'Booking Details',
              children: (
                <div>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Booking ID" span={2}>
                      <code style={{ fontSize: '12px' }}>{booking.id}</code>
                    </Descriptions.Item>

                    <Descriptions.Item label="Customer Name" span={1}>
                      {booking.customer
                        ? `${booking.customer.lastName || ''} ${booking.customer.firstName || ''}`
                        : '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Customer Email" span={1}>
                      {booking.customer?.email || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Phone Number" span={1}>
                      {booking.customer?.phoneNumber || '-'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Event Date" span={1}>
                      <strong>
                        {new Date(booking.eventDate).toLocaleDateString(
                          'vi-VN'
                        )}
                      </strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(booking.eventDate).toLocaleTimeString(
                          'vi-VN'
                        )}
                      </span>
                    </Descriptions.Item>

                    {booking.notes && (
                      <Descriptions.Item label="Notes" span={2}>
                        <div
                          style={{
                            padding: '8px',
                            backgroundColor: '#fafafa',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {booking.notes}
                        </div>
                      </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Created Date" span={1}>
                      <div style={{ fontSize: '12px' }}>
                        {new Date(booking.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(booking.createdAt).toLocaleTimeString(
                          'vi-VN'
                        )}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Last Updated" span={1}>
                      <div style={{ fontSize: '12px' }}>
                        {new Date(booking.updatedAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(booking.updatedAt).toLocaleTimeString(
                          'vi-VN'
                        )}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Packages */}
                  {booking.packages && booking.packages.length > 0 && (
                    <>
                      <Divider>Packages ({booking.packages.length})</Divider>
                      <Card size="small">
                        <div className="flex flex-col gap-3">
                          {booking.packages.map((item) => (
                            <div
                              key={item.packageId}
                              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <Tag color="blue">📦</Tag>
                                <div>
                                  <div className="font-medium">
                                    {item.package?.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.package?.description}
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div
                                  style={{ fontSize: '12px', color: '#666' }}
                                >
                                  {formatMoneyVND(item.price)} × {item.quantity}
                                </div>
                                <div
                                  style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    color: '#1890ff',
                                  }}
                                >
                                  {formatMoneyVND(
                                    (item.price || 0) * (item.quantity || 1)
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </>
                  )}

                  {/* Services */}
                  {booking.services && booking.services.length > 0 && (
                    <>
                      <Divider>Services ({booking.services.length})</Divider>
                      <Card size="small">
                        <div className="flex flex-col gap-3">
                          {booking.services.map((item) => (
                            <div
                              key={item.serviceId}
                              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <Tag color="green">🎯</Tag>
                                <div>
                                  <div className="font-medium">
                                    {item.service?.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.service?.description}
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div
                                  style={{ fontSize: '12px', color: '#666' }}
                                >
                                  {formatMoneyVND(item.price)} × {item.quantity}
                                </div>
                                <div
                                  style={{
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    color: '#52c41a',
                                  }}
                                >
                                  {formatMoneyVND(
                                    (item.price || 0) * (item.quantity || 1)
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </>
                  )}

                  {/* Action Buttons */}
                  <Divider />
                  <Space>
                    {canEditBooking && (
                      <Button icon={<EditOutlined />} onClick={handleEdit}>
                        Edit
                      </Button>
                    )}
                    {canCancelBooking && (
                      <Button danger onClick={handleCancelBooking}>
                        Cancel Booking
                      </Button>
                    )}
                    {canDeleteBooking && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    )}
                    {canMarkCompleted && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleMarkCompleted}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </Space>
                </div>
              ),
            },
            {
              key: 'order',
              label: (
                <span>
                  <ShoppingCartOutlined />
                  Order & Payment
                </span>
              ),
              children: (
                <div>
                  {loadingOrder ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      Loading order information...
                    </div>
                  ) : order ? (
                    <OrderDetail
                      order={order}
                      onPayRemainingClick={() => setCheckoutModalOpen(true)}
                    />
                  ) : (
                    <Card>
                      <Empty description="No order created yet" />
                      <Divider />
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => setCheckoutModalOpen(true)}
                      >
                        Create Order / Collect Deposit
                      </Button>
                    </Card>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Checkout Modal */}
      <Modal
        title={order ? 'Collect Remaining Payment' : 'Deposit or Full Checkout'}
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        footer={null}
        width={700}
      >
        {booking && (
          <CheckoutForm
            bookingId={booking.id}
            totalPrice={booking.totalPrice}
            existingOrder={order}
            onCheckoutSuccess={handleCheckoutSuccess}
            onClose={() => setCheckoutModalOpen(false)}
          />
        )}
      </Modal>
    </>
  );
};
