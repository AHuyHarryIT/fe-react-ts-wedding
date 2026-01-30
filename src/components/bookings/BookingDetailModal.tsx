import type { Booking, BookingStatus } from '@types';
import {
  Card,
  Col,
  Descriptions,
  Divider,
  List,
  Modal,
  Row,
  Statistic,
  Tag,
  Button,
  message,
} from 'antd';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PaymentFormModal from '../payments/PaymentFormModal';
import { bookingApi } from '@/services/BookingService';

interface BookingDetailModalProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
}

const statusColorMap: Record<BookingStatus, string> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'purple',
};

export function BookingDetailModal({
  open,
  booking,
  onClose,
}: BookingDetailModalProps) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const queryClient = useQueryClient();

  const handleCheckoutSuccess = async () => {
    try {
      setLoadingCheckout(true);
      // Update booking status to CONFIRMED after successful payment
      await bookingApi.update(booking!.id, {
        status: 'CONFIRMED',
      });
      message.success('Booking confirmed successfully!');

      // Invalidate bookings cache to reflect the status change
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });

      setPaymentModalOpen(false);
      onClose();
    } catch (error) {
      message.error('Failed to confirm booking');
      console.error(error);
    } finally {
      setLoadingCheckout(false);
    }
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
        width={900}
      >
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Statistic
              title="Total Price"
              value={booking.totalPrice}
              prefix="$"
              precision={2}
              styles={{
                content: {
                  color: '#1890ff',
                  fontSize: '24px',
                },
              }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Items Count"
              value={
                (booking.packages?.length || 0) +
                (booking.services?.length || 0)
              }
              suffix={
                <span style={{ fontSize: '14px' }}>
                  {' '}
                  ({booking.packages?.length || 0} pkg,{' '}
                  {booking.services?.length || 0} svc)
                </span>
              }
            />
          </Col>
          <Col span={8}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <Statistic
                title="Status"
                value={booking.status}
                styles={{
                  content: {
                    color: 'inherit',
                    fontSize: '16px',
                  },
                }}
                suffix={
                  <>
                    <Tag
                      color={statusColorMap[booking.status as BookingStatus]}
                    >
                      {booking.status}
                    </Tag>
                  </>
                }
              />
              {booking.status === 'PENDING' && (
                <Button
                  type="primary"
                  danger
                  size="large"
                  onClick={() => setPaymentModalOpen(true)}
                  loading={loadingCheckout}
                  style={{ marginTop: '8px' }}
                >
                  Checkout & Pay
                </Button>
              )}
            </div>
          </Col>
        </Row>

        <Divider />

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Booking ID" span={2}>
            <code style={{ fontSize: '12px' }}>{booking.id}</code>
          </Descriptions.Item>

          <Descriptions.Item label="Customer Name" span={1}>
            {booking.customer
              ? `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim()
              : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Customer Email" span={1}>
            {booking.customer?.email || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Phone Number" span={1}>
            {booking.customer?.phoneNumber || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Event Date" span={1}>
            <strong>{new Date(booking.eventDate).toLocaleDateString()}</strong>
            <br />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {new Date(booking.eventDate).toLocaleTimeString()}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Total Price" span={2}>
            <strong style={{ fontSize: '16px', color: '#1890ff' }}>
              ${booking.totalPrice?.toFixed(2) || '0.00'}
            </strong>
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
              {new Date(booking.createdAt).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              {new Date(booking.createdAt).toLocaleTimeString()}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Last Updated" span={1}>
            <div style={{ fontSize: '12px' }}>
              {new Date(booking.updatedAt).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              {new Date(booking.updatedAt).toLocaleTimeString()}
            </div>
          </Descriptions.Item>

          {booking.deletedAt && (
            <Descriptions.Item label="Cancelled Date" span={2}>
              <Tag color="red">
                {new Date(booking.deletedAt).toLocaleString()}
              </Tag>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Packages List */}
        {booking.packages && booking.packages.length > 0 && (
          <>
            <Divider>Selected Packages ({booking.packages.length})</Divider>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={booking.packages}
                renderItem={(item) => (
                  <List.Item
                    key={item.packageId}
                    extra={
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ${item.price?.toFixed(2) || '0.00'} × {item.quantity}
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          $
                          {((item.price || 0) * (item.quantity || 1)).toFixed(
                            2
                          )}
                        </div>
                      </div>
                    }
                  >
                    <List.Item.Meta
                      avatar={<Tag color="blue">📦</Tag>}
                      title={item.package?.name}
                      description={
                        <>
                          <div>{item.package?.description}</div>
                          <div className="text-xs text-[#999] mt-1">
                            Qty: {item.quantity}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}

        {/* Services List */}
        {booking.services && booking.services.length > 0 && (
          <>
            <Divider>Selected Services ({booking.services.length})</Divider>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={booking.services}
                renderItem={(item) => (
                  <List.Item
                    key={item.serviceId}
                    extra={
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ${item.price?.toFixed(2) || '0.00'} × {item.quantity}
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          $
                          {((item.price || 0) * (item.quantity || 1)).toFixed(
                            2
                          )}
                        </div>
                      </div>
                    }
                  >
                    <List.Item.Meta
                      avatar={<Tag color="green">🎯</Tag>}
                      title={item.service?.name}
                      description={
                        <>
                          <div>{item.service?.description}</div>
                          <div className="text-xs text-[#999] mt-1">
                            Qty: {item.quantity}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}
      </Modal>

      {/* Payment Modal */}
      {booking && (
        <PaymentFormModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          bookingId={booking.id}
          totalAmount={booking.totalPrice}
          onPaymentSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
}
