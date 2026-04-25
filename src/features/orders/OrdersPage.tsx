import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Empty,
  Card,
  Col,
  Row,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useTheme } from '@hooks';
import type { Booking, Order } from '@types';
import { ordersService } from '@services/OrdersService';
import { bookingApi } from '@services/BookingService';
import { OrderDetail } from './OrderDetail';
import { BookingDetailWithOrders } from '@features/bookings/BookingDetailWithOrders';
import { StatCard } from '@shared/components/ui/StatCard';
import { StaffTableScroll } from '@shared/components/ui';
import { formatMoneyVND } from '@utils/money';
import { printInvoice } from '@utils/printInvoice';

const { Text } = Typography;

export const OrdersPage: React.FC = () => {
  const { darkMode } = useTheme();
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders-list'],
    queryFn: async () => {
      const response = await ordersService.getOrders({ limit: 50, page: 1 });
      return (response.data || []) as Order[];
    },
  });

  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['orders-bookings'],
    queryFn: async () => {
      const response = await bookingApi.getAll({
        limit: 20,
        page: 1,
        includeCustomer: true,
        includePackages: true,
        includeServices: true,
      });
      const bookingItems = response.data || [];
      return bookingItems.filter(
        (b: Booking) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
      );
    },
  });

  const loading = isLoadingOrders || isLoadingBookings;
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleOpenCheckout = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingModalVisible(true);
  };

  const handlePrintOrderInvoice = async (order: Order) => {
    try {
      let bookingData: Booking | undefined = ('booking' in order &&
        order.booking) as Booking | undefined;
      if (!bookingData && order.bookingId) {
        const resp = await bookingApi.getOne(order.bookingId);
        bookingData = resp.data as Booking;
      }
      if (bookingData) {
        printInvoice(bookingData);
      } else {
        message.warning('Unable to fetch booking details. Please try again.');
      }
    } catch {
      message.warning('Failed to load booking data for printing.');
    }
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

  const columns: ColumnsType<Order> = [
    {
      title: 'Booking ID',
      dataIndex: 'bookingId',
      key: 'bookingId',
      width: 110,
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
            icon={<PrinterOutlined />}
            onClick={() => handlePrintOrderInvoice(record)}
          >
            Invoice
          </Button>
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

  const bookingColumns: ColumnsType<Booking> = [
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

  const statCards = [
    {
      key: 'total-orders',
      title: 'Total Orders',
      value: `${stats.totalOrders}`,
      accent: '#2563eb',
      icon: <DollarOutlined />,
    },
    {
      key: 'total-paid',
      title: 'Total Paid',
      value: formatMoneyVND(stats.totalPaid),
      accent: '#16a34a',
      icon: <CheckCircleOutlined />,
    },
    {
      key: 'total-revenue',
      title: 'Total Revenue',
      value: formatMoneyVND(stats.totalAmount),
      accent: '#d97706',
      icon: <ShoppingCartOutlined />,
    },
    {
      key: 'fully-paid',
      title: 'Fully Paid',
      value: `${stats.paidOrders}`,
      accent: '#7c3aed',
      icon: <ClockCircleOutlined />,
    },
  ];

  return (
    <div className="staff-page space-y-6">
      <div className="staff-page-header">
        <div className="min-w-0">
          <div className="staff-kicker">Orders and payment flow</div>
          <h1 className="staff-title mt-4">Orders</h1>
          <p className="staff-subtitle mt-3">
            Track deposits, monitor remaining balances, and move bookings into
            checkout without losing visibility on smaller screens.
          </p>
        </div>

        <div className="staff-surface rounded-3xl px-4 py-3">
          <Text className="!text-xs !font-semibold !uppercase !tracking-[0.18em] !text-slate-500 dark:!text-slate-400">
            Payment health
          </Text>
          <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
            {stats.totalOrders} active orders
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col key={card.key} xs={24} sm={12} lg={6} className="flex">
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              accent={card.accent}
              darkMode={darkMode}
            />
          </Col>
        ))}
      </Row>

      {/* Orders Table */}
      <Card
        title="All Orders"
        loading={loading}
        className="staff-surface !border-0"
      >
        {orders.length > 0 ? (
          <StaffTableScroll minWidth={1200}>
            <Table
              className="staff-table"
              dataSource={orders}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </StaffTableScroll>
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
          className="staff-surface !border-0"
        >
          <StaffTableScroll minWidth={900}>
            <Table
              className="staff-table"
              dataSource={bookings}
              columns={bookingColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </StaffTableScroll>
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
          queryClient.invalidateQueries({ queryKey: ['orders-list'] });
          queryClient.invalidateQueries({ queryKey: ['orders-bookings'] });
        }}
      />
    </div>
  );
};
