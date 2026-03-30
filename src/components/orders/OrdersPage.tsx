import React, { useEffect, useState } from 'react';
import {
  Alert,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Empty,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  EyeOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { Booking, Order } from '@types';
import { ordersService } from '@services/OrdersService';
import { bookingApi } from '@services/BookingService';
import { OrderDetail } from './OrderDetail';
import { BookingDetailWithOrders } from '@components/bookings/BookingDetailWithOrders';
import { formatMoneyVND } from '@utils/money';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  useEffect(() => {
    void loadOrdersPageData();
  }, []);

  const loadOrdersPageData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, bookingsResponse] = await Promise.all([
        ordersService.getOrders({ limit: 50, page: 1 }),
        bookingApi.getAll({
          limit: 20,
          page: 1,
          includeCustomer: true,
          includePackages: true,
          includeServices: true,
        }),
      ]);

      const ordersData = ordersResponse.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      const bookingItems = bookingsResponse.data || [];
      const actionableBookings = bookingItems.filter(
        (booking) =>
          booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
      );
      setBookings(actionableBookings);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleOpenCheckout = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIAL':
        return 'warning';
      case 'UNPAID':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleOutlined />;
      case 'PARTIAL':
        return <ClockCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (id: string) => (
        <code className="text-xs">{id.slice(0, 8)}...</code>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: ['summary', 'totalPrice'],
      key: 'totalPrice',
      render: (_: unknown, record: Order) => {
        const total =
          record.summary?.totalPrice ||
          record.totalPrice ||
          (record.depositAmount ?? 0) + (record.remainingAmount ?? 0);
        return <span className="font-semibold">{formatMoneyVND(total)}</span>;
      },
    },
    {
      title: 'Paid',
      dataIndex: ['summary', 'totalPaid'],
      key: 'totalPaid',
      render: (_: unknown, record: Order) => {
        const amount = record.summary?.totalPaid ?? 0;
        return <span className="text-green-600">{formatMoneyVND(amount)}</span>;
      },
    },
    {
      title: 'Remaining',
      dataIndex: ['summary', 'remainingAmount'],
      key: 'remainingAmount',
      render: (_: unknown, record: Order) => {
        const amount =
          record.summary?.remainingAmount ?? record.remainingAmount ?? 0;
        return (
          <span className="text-orange-600">{formatMoneyVND(amount)}</span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Order) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  const bookingColumns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_: unknown, record: Booking) => {
        const firstName = record.customer?.firstName || '';
        const lastName = record.customer?.lastName || '';
        const fullName = `${lastName} ${firstName}`.trim();

        return (
          <div>
            <div className="font-medium">{fullName || 'Unknown customer'}</div>
            <div className="text-xs text-gray-500">
              {record.customer?.phoneNumber || 'No phone number'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Booking Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount: number) => formatMoneyVND(amount || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Booking) => (
        <Button
          type="primary"
          size="small"
          icon={<ShoppingCartOutlined />}
          onClick={() => handleOpenCheckout(record)}
        >
          Open Checkout
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalAmount: orders.reduce(
      (sum, o) =>
        sum +
        (o.summary?.totalPrice ||
          o.totalPrice ||
          (o.depositAmount ?? 0) + (o.remainingAmount ?? 0)),
      0
    ),
    totalPaid: orders.reduce((sum, o) => sum + (o.summary?.totalPaid ?? 0), 0),
    paidOrders: orders.filter((o) => o.status === 'PAID').length,
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-blue-500">
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<DollarOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-green-500">
            <Statistic
              title="Total Paid"
              value={stats.totalPaid}
              suffix="VND"
              styles={{ content: { color: '#52c41a', fontSize: '16px' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-orange-500">
            <Statistic
              title="Total Revenue"
              value={stats.totalAmount}
              suffix="VND"
              styles={{ content: { color: '#faad14', fontSize: '16px' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-purple-500">
            <Statistic
              title="Fully Paid"
              value={stats.paidOrders}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders Table */}
      <Card title="All Orders" loading={loading}>
        {orders.length > 0 ? (
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 1200 }}
          />
        ) : (
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              type="info"
              showIcon
              title="No orders have been created yet"
              description="Staff creates orders from a booking. You can start checkout directly from the bookings below instead of seeing a blank orders screen."
            />
            <Empty description="No orders yet" />
          </Space>
        )}
      </Card>

      {bookings.length > 0 && (
        <Card
          title="Bookings Ready For Checkout"
          extra={<Tag color="processing">{bookings.length} bookings</Tag>}
        >
          <Table
            dataSource={bookings}
            columns={bookingColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
            scroll={{ x: 900 }}
          />
        </Card>
      )}

      {/* Order Detail Modal */}
      <Modal
        title="Order Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {selectedOrder && <OrderDetail order={selectedOrder} />}
      </Modal>

      <BookingDetailWithOrders
        open={bookingModalVisible}
        booking={selectedBooking}
        onClose={() => {
          setBookingModalVisible(false);
          setSelectedBooking(null);
          void loadOrdersPageData();
        }}
      />
    </div>
  );
};
