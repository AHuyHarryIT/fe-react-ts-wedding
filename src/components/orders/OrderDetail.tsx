import React from 'react';
import { Card, Row, Col, Divider, Tag, Table, Empty, Button } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import type { Order } from '@types';
import { formatMoneyVND } from '@utils/money';

interface OrderDetailProps {
  order: Order;
  onPayRemainingClick?: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onPayRemainingClick,
}) => {
  if (!order) {
    return <Empty description="No order information" />;
  }

  // Use API summary data directly
  const summary = order.summary || {
    totalPrice: order.totalPrice || 0,
    depositAmount: order.depositAmount || 0,
    remainingAmount: order.remainingAmount || 0,
    depositPaid: order.depositPaid || 0,
    remainingPaid: order.remainingPaid || 0,
    totalPaid: (order.depositPaid || 0) + (order.remainingPaid || 0),
  };

  const isFullyPaid = order.status === 'PAID';
  const isPartiallyPaid = order.status === 'PARTIAL';
  const isUnpaid = order.status === 'UNPAID';

  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'paymentMethod',
      render: (method: string) => {
        const methodMap: Record<string, string> = {
          E_WALLET: 'MoMo',
          CASH: 'Cash',
        };
        return methodMap[method] || method;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${formatMoneyVND(amount)}`,
      align: 'right' as const,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          SUCCESS: 'green',
          PENDING: 'orange',
          FAILED: 'red',
        };
        return <Tag color={colors[status] || 'blue'}>{status}</Tag>;
      },
    },
    {
      title: 'Transaction ID',
      dataIndex: 'txnId',
      key: 'txnId',
      render: (txnId: string) => (txnId ? <code>{txnId}</code> : '-'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Order Summary */}
      <Card title="Order Summary" className="border-l-4 border-l-blue-500">
        <Row gutter={[16, 16]}>
          {/* Order ID and Status */}
          <Col xs={24} sm={12}>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Booking ID</div>
              <div className="font-mono text-lg font-semibold">
                {order.bookingId}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Status</div>
              <div>
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
                {isUnpaid && (
                  <Tag icon={<ClockCircleOutlined />} color="processing">
                    Unpaid
                  </Tag>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Payment Breakdown */}
      <Card title="Payment Breakdown" className="border-l-4 border-l-green-500">
        <Row gutter={[16, 24]}>
          <Col xs={24} sm={12}>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarOutlined className="text-blue-500" />
                <span className="text-sm text-gray-600">Total Amount</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatMoneyVND(
                  summary.totalPrice ||
                    (summary.depositAmount ?? 0) +
                      (summary.remainingAmount ?? 0)
                )}
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleOutlined className="text-green-500" />
                <span className="text-sm text-gray-600">Total Paid</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatMoneyVND(summary.totalPaid || 0)}
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCardOutlined className="text-orange-500" />
                <span className="text-sm text-gray-600">Remaining</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatMoneyVND(summary.remainingAmount ?? 0)}
              </div>
            </div>
          </Col>

          {(summary.depositAmount ?? 0) > 0 && (
            <Col xs={24} sm={12}>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarOutlined className="text-purple-500" />
                  <span className="text-sm text-gray-600">
                    Deposit (Min 30%)
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatMoneyVND(summary.depositAmount ?? 0)}
                </div>
              </div>
            </Col>
          )}
        </Row>

        {/* Progress Bar */}
        <Divider />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span className="font-semibold">
              {((summary.totalPaid / (summary.totalPrice || 1)) * 100).toFixed(
                0
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all "
              style={{
                width: `${Math.min(
                  (summary.totalPaid / (summary.totalPrice || 1)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {formatMoneyVND(summary.totalPaid)} /{' '}
            {formatMoneyVND(summary.totalPrice)}
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card title="Payment History">
        {order.payments && order.payments.length > 0 ? (
          <Table
            dataSource={order.payments}
            columns={paymentColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        ) : (
          <Empty description="No payments yet" />
        )}
      </Card>

      {/* Action Buttons */}
      {!isFullyPaid && onPayRemainingClick && (
        <Card>
          <Button
            type="primary"
            size="large"
            block
            onClick={onPayRemainingClick}
            danger={isPartiallyPaid}
          >
            {isPartiallyPaid ? 'Pay Remaining Balance' : 'Make Payment'}
          </Button>
        </Card>
      )}
    </div>
  );
};
