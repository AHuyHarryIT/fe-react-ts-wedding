import { Modal, Descriptions, Tag, Divider, Statistic, Row, Col } from 'antd';
import type { Booking, BookingStatus } from '@types';

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
  if (!booking) {
    return null;
  }

  return (
    <Modal
      title="Booking Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Statistic
            title="Total Price"
            value={booking.totalPrice}
            prefix="$"
            precision={2}
          />
        </Col>
        <Col span={12}>
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
              <Tag color={statusColorMap[booking.status as BookingStatus]}>
                {booking.status}
              </Tag>
            }
          />
        </Col>
      </Row>

      <Divider />

      <Descriptions bordered column={2}>
        <Descriptions.Item label="Booking ID" span={2}>
          {booking.id}
        </Descriptions.Item>

        <Descriptions.Item label="Customer Name">
          {booking.customer
            ? `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`.trim()
            : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Phone Number">
          {booking.customer?.phoneNumber || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Email">
          {booking.customer?.email || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Package">
          {booking.package?.name || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Event Date" span={2}>
          {new Date(booking.eventDate).toLocaleString()}
        </Descriptions.Item>

        <Descriptions.Item label="Package Price">
          ${booking.package?.price?.toFixed(2) || '0.00'}
        </Descriptions.Item>

        <Descriptions.Item label="Booking Total">
          ${booking.totalPrice?.toFixed(2) || '0.00'}
        </Descriptions.Item>

        <Descriptions.Item label="Created At" span={2}>
          {new Date(booking.createdAt).toLocaleString()}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At" span={2}>
          {new Date(booking.updatedAt).toLocaleString()}
        </Descriptions.Item>

        {booking.deletedAt && (
          <Descriptions.Item label="Deleted At" span={2}>
            {new Date(booking.deletedAt).toLocaleString()}
          </Descriptions.Item>
        )}

        {booking.notes && (
          <Descriptions.Item label="Notes" span={2}>
            {booking.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      {booking.package?.description && (
        <>
          <Divider>Package Description</Divider>
          <div style={{ padding: '12px' }}>{booking.package.description}</div>
        </>
      )}
    </Modal>
  );
}
