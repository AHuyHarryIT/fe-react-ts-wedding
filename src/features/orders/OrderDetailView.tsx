import { useQuery, useMutation } from '@tanstack/react-query';
import {
  App,
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Empty,
  Divider,
  Breadcrumb,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { ordersService } from '@services/OrdersService';
import { bookingApi } from '@services/BookingService';
import { OrderDetail } from './OrderDetail';
import { PaymentHistory } from './PaymentHistory';
import { formatMoneyVND } from '@utils/money';

const { Text, Title } = Typography;

interface OrderDetailViewProps {
  orderId: string;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  orderId,
}) => {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isOrderError,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrder(orderId),
    enabled: !!orderId,
    retry: 1,
  });

  // The Order might have booking info embedded or we can look it up by the bookingId
  const bookingId = order?.bookingId;

  const {
    data: booking,
    isLoading: isLoadingBooking,
    isError: isBookingError,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getOne(bookingId!).then((r) => r.data),
    enabled: !!bookingId,
    retry: 1,
  });

  const markCompleteMutation = useMutation({
    mutationFn: (id: string) =>
      bookingApi.update(id, { status: 'COMPLETED' as const }),
    onSuccess: (_data) => {
      message.success('Booking marked as completed');
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => {
      message.error('Failed to mark booking as completed');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: () => {
      message.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => {
      message.error('Failed to cancel booking');
    },
  });

  const handleMarkComplete = () => {
    if (!booking) return;
    modal.confirm({
      title: 'Mark Booking Completed',
      content:
        'Are you sure you want to mark this booking as completed? This action will lock the booking from further edits.',
      okText: 'Mark Completed',
      onOk: () => {
        markCompleteMutation.mutate(booking.id);
      },
    });
  };

  const handleCancel = () => {
    if (!booking) return;
    modal.confirm({
      title: 'Cancel Booking',
      content: 'This will mark the booking as cancelled. Continue?',
      okText: 'Cancel Booking',
      okButtonProps: { danger: true },
      onOk: () => {
        cancelMutation.mutate(booking.id);
      },
    });
  };

  const handleBack = () => {
    navigate({ to: '/orders' });
  };

  if (isOrderError) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Order not found">
          <Button type="primary" onClick={handleBack}>
            <ArrowLeftOutlined /> Back to Orders
          </Button>
        </Empty>
      </div>
    );
  }

  if (isLoadingOrder) {
    return (
      <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
    );
  }

  if (!order) {
    return <Empty description="No order found" />;
  }

  const summary = order.summary || {
    totalPrice: order.totalPrice || 0,
    depositAmount: order.depositAmount || 0,
    remainingAmount: order.remainingAmount || 0,
    totalPaid: (order.depositPaid ?? 0) + (order.remainingPaid ?? 0),
  };

  const isFullyPaid = order.status === 'PAID';
  const isPartiallyPaid = order.status === 'PARTIAL';

  const canMarkComplete =
    booking?.status !== 'COMPLETED' &&
    booking?.status !== 'CANCELLED' &&
    isFullyPaid;
  const canCancel =
    booking?.status !== 'COMPLETED' && booking?.status !== 'CANCELLED';

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb / Back */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            {
              title: (
                <a onClick={handleBack} style={{ cursor: 'pointer' }}>
                  Orders
                </a>
              ),
            },
            { title: `Order ${order.bookingId?.slice(0, 8) || ''}...` },
          ]}
        />
      </div>

      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Order Details
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Booking ID: <code>{order.bookingId}</code>
          </Text>
        </div>
        <Space>
          {canMarkComplete && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={markCompleteMutation.isPending}
              onClick={handleMarkComplete}
            >
              Mark Complete
            </Button>
          )}
          {canCancel && (
            <Button
              danger
              icon={<StopOutlined />}
              loading={cancelMutation.isPending}
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          )}
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Order Summary Card */}
        <Col xs={24} md={16}>
          <Card title="Payment Summary" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Status
                  </Text>
                  {isFullyPaid && (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Fully Paid
                    </Tag>
                  )}
                  {isPartiallyPaid && (
                    <Tag icon={<ClockCircleOutlined />} color="warning">
                      Partially Paid
                    </Tag>
                  )}
                  {!isFullyPaid && !isPartiallyPaid && (
                    <Tag icon={<ClockCircleOutlined />} color="processing">
                      Unpaid
                    </Tag>
                  )}
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Order Total
                  </Text>
                  <Text strong style={{ fontSize: 20, color: '#1677ff' }}>
                    {formatMoneyVND(
                      summary.totalPrice ||
                        (summary.depositAmount ?? 0) +
                          (summary.remainingAmount ?? 0)
                    )}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Amount Paid
                  </Text>
                  <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                    {formatMoneyVND(summary.totalPaid ?? 0)}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Remaining
                  </Text>
                  <Text strong style={{ fontSize: 18, color: '#fa8c16' }}>
                    {formatMoneyVND(summary.remainingAmount ?? 0)}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Payment History */}
          <Card title="Payment History" style={{ marginBottom: 16 }}>
            {isLoadingBooking ? (
              <Spin />
            ) : order.payments && order.payments.length > 0 ? (
              <PaymentHistory payments={order.payments} />
            ) : (
              <Empty description="No payments recorded yet" />
            )}
          </Card>
        </Col>

        {/* Booking Info */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <UserOutlined />
                Booking Information
              </Space>
            }
          >
            {isLoadingBooking ? (
              <Spin />
            ) : isBookingError ? (
              <Empty description="Unable to load booking info" />
            ) : booking ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Customer">
                  {`${booking.customer?.lastName || ''} ${booking.customer?.firstName || ''}`.trim() ||
                    'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <PhoneOutlined /> {booking.customer?.phoneNumber || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <MailOutlined /> {booking.customer?.email || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Event Date">
                  <CalendarOutlined />{' '}
                  {booking.eventDate
                    ? new Date(booking.eventDate).toLocaleDateString('vi-VN')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="blue">{booking.status}</Tag>
                </Descriptions.Item>
                {booking.notes && (
                  <Descriptions.Item label="Notes">
                    {booking.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Empty
                description="No booking found for this order"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Full Detail View */}
      <Divider />
      <OrderDetail order={order} />
    </div>
  );
};
