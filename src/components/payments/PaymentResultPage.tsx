import React, { useEffect, useState, useCallback } from 'react';
import {
  Result,
  Button,
  Spin,
  Space,
  Statistic,
  Row,
  Col,
  Card,
  Alert,
} from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { ordersService } from '@services/OrdersService';
import type { Order } from '@types';

/**
 * Payment Result Page - Shows payment status after redirect from Momo
 *
 * Key features:
 * - Polls backend for payment status every 2 seconds
 * - Waits for IPN callback to confirm payment
 * - Shows real-time status updates
 * - Handles successful, partial, and pending states
 */
export const PaymentResultPage: React.FC = () => {
  // Get orderId from URL query params
  const searchParams = new URLSearchParams(window.location.search);

  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Get orderId from URL params or localStorage
  const orderId =
    searchParams.get('orderId') ||
    localStorage.getItem('currentOrderId') ||
    localStorage.getItem('orderId');

  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const order = await ordersService.getOrder(orderId);

      console.log(
        `📊 Poll #${pollCount + 1} (${elapsedTime}s): Status=${order.status}, Paid=${order.summary?.totalPaid}/${order.summary?.totalPrice}`
      );

      setOrderData(order);
      setError(null);
      setLoading(false);

      // If payment is fully paid, stop polling immediately
      if (order.summary?.isPaid || order.status === 'PAID') {
        console.log('✅ PAYMENT CONFIRMED! Stopping polls.');
        setIsPolling(false);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load order status';
      console.error('❌ Poll error:', err);
      // Don't set error on network failures, just log
      if (!orderData) {
        setError(errorMsg);
      }
      setLoading(false);
    }
  }, [orderId, pollCount, elapsedTime, orderData]);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found. Please go back and try again.');
      setLoading(false);
      setIsPolling(false);
      return;
    }

    console.log('🔄 PaymentResultPage: Loaded for orderId:', orderId);
    localStorage.setItem('currentOrderId', orderId);

    // Initial fetch
    fetchOrderStatus();

    // Set up polling interval (every 2 seconds)
    const pollInterval = setInterval(() => {
      setPollCount((c) => c + 1);
      setElapsedTime((t) => t + 2);
      fetchOrderStatus();
    }, 2000);

    // Stop polling after 60 seconds
    const timeoutHandle = setTimeout(() => {
      console.log('⏰ Polling timeout - stopped after 60 seconds');
      setIsPolling(false);
      clearInterval(pollInterval);
    }, 60000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutHandle);
    };
  }, [orderId, fetchOrderStatus]);

  const handleRetry = () => {
    console.log('🔄 Manually retrying...');
    setPollCount(0);
    setElapsedTime(0);
    setIsPolling(true);
    setLoading(true);
    setError(null);

    fetchOrderStatus();

    const pollInterval = setInterval(() => {
      setPollCount((c) => c + 1);
      setElapsedTime((t) => t + 2);
      fetchOrderStatus();
    }, 2000);

    const timeoutHandle = setTimeout(() => {
      setIsPolling(false);
      clearInterval(pollInterval);
    }, 60000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutHandle);
    };
  };

  // Still loading initial state
  if (loading && !orderData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin
          size="large"
          tip={`Checking payment status... (${pollCount} attempts, ${elapsedTime}s elapsed)`}
        />
      </div>
    );
  }

  // ✅ Payment successful (fully paid)
  if (orderData?.summary?.isPaid) {
    return (
      <Result
        status="success"
        title="Payment Successful!"
        subTitle={`Order ${orderId} has been paid in full.`}
        extra={[
          <Button type="primary" key="dashboard" href="/bookings">
            Back to Bookings
          </Button>,
        ]}
      >
        <Card style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Total Amount"
                value={orderData.summary?.totalPrice}
                suffix="VND"
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Order Status"
                value={orderData.status}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
          </Row>
        </Card>
      </Result>
    );
  }

  // ⏳ Partial payment (waiting for remaining)
  if (orderData?.status === 'PARTIAL') {
    return (
      <Result
        status="info"
        title="Partial Payment Received"
        subTitle={`Order ${orderId} - Deposit payment confirmed. Please complete remaining balance.`}
        extra={[
          <Button type="primary" key="continue" href="/bookings">
            Complete Remaining Payment
          </Button>,
        ]}
      >
        <Card style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Paid Amount"
                value={orderData.summary?.totalPaid}
                suffix="VND"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Remaining Balance"
                value={orderData.summary?.remainingAmount}
                suffix="VND"
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>

          <Alert
            style={{ marginTop: 16 }}
            message="Deposit Payment Confirmed"
            description="Your deposit payment has been received. Please complete the remaining balance to finish your booking."
            type="info"
            showIcon
          />
        </Card>
      </Result>
    );
  }

  // ⏳ Still polling (waiting for IPN confirmation)
  if (isPolling) {
    return (
      <Result
        icon={<ClockCircleOutlined className="text-6xl text-blue-500" />}
        title="Payment Processing"
        subTitle="Please wait while we verify your payment from Momo..."
        extra={[
          <Space key="actions" direction="vertical" className="w-full">
            <p className="text-gray-600">
              This page will automatically update when payment is confirmed.
            </p>
            <Space>
              <Button
                key="retry"
                onClick={handleRetry}
                icon={<ReloadOutlined />}
                type="primary"
              >
                Check Again
              </Button>
              <Button key="back" href="/bookings">
                Back to Bookings
              </Button>
            </Space>
          </Space>,
        ]}
      >
        <Card className="mt-6">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Attempts"
                value={pollCount}
                suffix="checks"
                prefix={<Spin size="small" />}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic title="Elapsed" value={elapsedTime} suffix="sec" />
            </Col>
          </Row>

          <Alert
            style={{ marginTop: 16 }}
            message="Payment Verification In Progress"
            description="We're confirming your payment with Momo. This typically takes 5-15 seconds. If it takes longer, check your Momo app to confirm the payment was sent."
            type="info"
            showIcon
          />

          {orderData && (
            <Card style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Expected Amount"
                    value={orderData.summary?.totalPrice}
                    suffix="VND"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Current Status"
                    value={orderData.status || 'UNPAID'}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>
          )}
        </Card>
      </Result>
    );
  }

  // ❌ Payment not confirmed after timeout
  return (
    <Result
      status="warning"
      title="Payment Verification Timeout"
      subTitle="We couldn't verify your payment within the expected time. Please check your Momo app and try again."
      extra={[
        <Space key="actions">
          <Button
            type="primary"
            onClick={handleRetry}
            icon={<ReloadOutlined />}
          >
            Try Again
          </Button>
          <Button key="back" href="/bookings">
            Back to Bookings
          </Button>
        </Space>,
      ]}
    >
      <Card style={{ marginTop: 24 }}>
        <Alert
          message="What to do next"
          description={
            <ul>
              <li>✅ Check your Momo app - confirm the payment was sent</li>
              <li>
                ✅ If payment shows in Momo: Click 'Try Again' to re-check
              </li>
              <li>
                ✅ If payment is confirmed but this page still shows timeout:
                Contact support with Order ID: {orderId}
              </li>
              <li>
                ✅ If payment was NOT sent in Momo: Go back and complete payment
                again
              </li>
            </ul>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {orderData && (
          <Card title="Order Information">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Statistic title="Order ID" value={orderData.bookingId} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Expected Amount"
                  value={orderData.summary?.totalPrice}
                  suffix="VND"
                />
              </Col>
            </Row>
          </Card>
        )}

        {error && (
          <Alert
            style={{ marginTop: 16 }}
            message="Error Details"
            description={error}
            type="error"
            showIcon
          />
        )}
      </Card>
    </Result>
  );
};

export default PaymentResultPage;
