import React, { useEffect, useState } from 'react';
import {
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
} from '@ant-design/icons';
import type { Order } from '@types';
import { ordersService } from '@services/OrdersService';
import { OrderDetail } from './OrderDetail';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getOrders({ limit: 50, page: 1 });
      const ordersData = response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
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
      dataIndex: ['summary', 'totalAmount'],
      key: 'totalAmount',
      render: (_: unknown, record: Order) => {
        const total =
          record.summary?.totalPrice ||
          record.totalPrice ||
          record.depositAmount + record.remainingAmount;
        return (
          <span className="font-semibold">{total.toLocaleString()} VND</span>
        );
      },
    },
    {
      title: 'Paid',
      dataIndex: ['summary', 'depositPaid'],
      key: 'depositPaid',
      render: (_: unknown, record: Order) => {
        const amount = record.summary?.depositPaid || 0;
        return (
          <span className="text-green-600">{amount.toLocaleString()} VND</span>
        );
      },
    },
    {
      title: 'Remaining',
      dataIndex: ['summary', 'remainingAmount'],
      key: 'remainingAmount',
      render: (_: unknown, record: Order) => {
        const amount =
          record.summary?.remainingAmount || record.remainingAmount;
        return (
          <span className="text-orange-600">{amount.toLocaleString()} VND</span>
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

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalAmount: orders.reduce(
      (sum, o) =>
        sum +
        (o.summary?.totalPrice ||
          o.totalPrice ||
          o.depositAmount + o.remainingAmount),
      0
    ),
    totalPaid: orders.reduce(
      (sum, o) => sum + (o.summary?.depositPaid || 0),
      0
    ),
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
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-green-500">
            <Statistic
              title="Total Paid"
              value={stats.totalPaid}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-orange-500">
            <Statistic
              title="Total Revenue"
              value={stats.totalAmount}
              suffix="VND"
              valueStyle={{ color: '#faad14', fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-l-4 border-l-purple-500">
            <Statistic
              title="Fully Paid"
              value={stats.paidOrders}
              valueStyle={{ color: '#722ed1' }}
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
          <Empty description="No orders yet" />
        )}
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title="Order Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {selectedOrder && <OrderDetail order={selectedOrder} />}
      </Modal>
    </div>
  );
};
