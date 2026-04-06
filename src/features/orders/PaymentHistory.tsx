import React from 'react';
import { Card, Row, Col, Tag, Empty, Timeline } from 'antd';
import type { Payment } from '@types';
import { formatMoneyVND } from '@utils/money';

interface PaymentHistoryProps {
  payments?: Payment[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments = [],
}) => {
  if (!payments || payments.length === 0) {
    return <Empty description="No payment history" />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'FAILED':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      MOMO: 'Momo',
      E_WALLET: 'MoMo',
      CASH: 'Cash',
    };
    return methodMap[method] || method;
  };

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card title="Payment Timeline" className="border-l-4 border-l-blue-500">
      <Timeline
        items={sortedPayments.map((payment) => ({
          color:
            payment.status === 'SUCCESSFUL'
              ? 'green'
              : payment.status === 'PENDING'
                ? 'orange'
                : 'red',
          children: (
            <div className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-base">
                    {formatMoneyVND(payment.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <Tag color={getStatusColor(payment.status)}>
                  {payment.status}
                </Tag>
              </div>

              <Row gutter={[8, 8]} className="text-sm">
                <Col xs={24}>
                  <span className="text-gray-600">Method:</span>{' '}
                  <span className="font-medium">
                    {getMethodLabel(payment.method)}
                  </span>
                </Col>
                {payment.description && (
                  <Col xs={24}>
                    <span className="text-gray-600">Description:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {payment.description}
                    </code>
                  </Col>
                )}
                {payment.notes && (
                  <Col xs={24}>
                    <span className="text-gray-600">Note:</span>{' '}
                    <span className="italic">{payment.notes}</span>
                  </Col>
                )}
              </Row>
            </div>
          ),
        }))}
      />

      {/* Summary Footer */}
      <Card type="inner" size="small" className="mt-4 bg-gray-50">
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <div className="text-sm text-gray-600">Total Payments</div>
            <div className="text-lg font-semibold">{payments.length}</div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-sm text-gray-600">Total Paid</div>
            <div className="text-lg font-semibold text-green-600">
              {formatMoneyVND(payments.reduce((sum, p) => sum + p.amount, 0))}
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-lg font-semibold">
              {payments.length > 0
                ? `${Math.round(
                    (payments.filter((p) => p.status === 'SUCCESSFUL').length /
                      payments.length) *
                      100
                  )}%`
                : '0%'}
            </div>
          </Col>
        </Row>
      </Card>
    </Card>
  );
};
