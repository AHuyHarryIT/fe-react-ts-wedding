import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@services/OrdersService';
import { formatMoneyVND } from '@utils/money';

/**
 * Payment Result Page - Shows payment status after redirect from Momo
 *
 * Key features:
 * - Polls backend for payment status every 2 seconds using useQuery refetchInterval
 * - Uses separate useQuery for Momo gateway status checking
 * - Waits for IPN callback to confirm payment
 * - Shows real-time status updates
 * - Handles successful, partial, and pending states
 */
export const PaymentResultPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Get orderId from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId =
    searchParams.get('bookingId') ||
    localStorage.getItem('currentBookingId') ||
    localStorage.getItem('currentOrderId') ||
    localStorage.getItem('orderId');
  const momoOrderId =
    searchParams.get('orderId') || localStorage.getItem('currentMomoOrderId');
  const momoResultCode = searchParams.get('resultCode');
  const momoMessage = searchParams.get('message');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const elapsedRef = useRef(0);

  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gatewayConfirmed, setGatewayConfirmed] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Early exit: Momo payment failed
  const momoFailed = momoResultCode && Number(momoResultCode) !== 0;
  const hasBookingId = !!bookingId;

  // Initialize polling and handle early exits
  useEffect(() => {
    if (!hasBookingId) {
      setError('No order ID found. Please go back and try again.');
      setIsPolling(false);
      return;
    }

    if (momoFailed) {
      setError(momoMessage || 'MoMo did not confirm the payment.');
      setIsPolling(false);
      return;
    }

    console.log('🔄 PaymentResultPage: Loaded for bookingId:', bookingId);
    localStorage.setItem('currentBookingId', bookingId);
  }, [hasBookingId, bookingId, momoFailed, momoMessage]);

  // Query 1: Order status polling via useQuery
  const { data: orderData, isFetching: isLoading } = useQuery({
    queryKey: ['payment-order-status', bookingId],
    queryFn: () => ordersService.getOrder(bookingId!),
    enabled: isPolling && hasBookingId && !momoFailed,
    refetchInterval: () => {
      elapsedRef.current += 2;
      pollCountRef.current += 1;
      setElapsedTime(elapsedRef.current);
      setPollCount(pollCountRef.current);

      if (elapsedRef.current >= 60) {
        console.log('⏰ Polling timeout - stopped after 60 seconds');
        return false;
      }

      return 2000;
    },
    retry: false,
    staleTime: 0,
  });

  // Query 2: Momo gateway status polling via useQuery
  const { data: gatewayStatus } = useQuery({
    queryKey: ['momo-gateway-status', momoOrderId],
    queryFn: () => ordersService.checkMomoPaymentStatus(momoOrderId!),
    enabled: isPolling && !!momoOrderId && hasBookingId && !momoFailed,
    refetchInterval: 4000,
    retry: false,
    staleTime: 0,
  });

  // Stop polling when payment is confirmed
  const stopPollingIfPaid = useCallback(() => {
    if (orderData?.summary?.isPaid || orderData?.status === 'PAID') {
      console.log('✅ PAYMENT CONFIRMED! Stopping polls.');
      setIsPolling(false);
      localStorage.removeItem('currentBookingId');
      localStorage.removeItem('currentMomoOrderId');
    }
  }, [orderData?.summary?.isPaid, orderData?.status]);

  useEffect(() => {
    stopPollingIfPaid();
  }, [stopPollingIfPaid]);

  // Track gateway confirmation
  useEffect(() => {
    if (gatewayStatus) {
      if (gatewayStatus.resultCode === 0) {
        setGatewayConfirmed(true);
      } else if (gatewayStatus.resultCode !== 1000) {
        setError(gatewayStatus.message || 'MoMo did not confirm the payment.');
        setIsPolling(false);
      }
    }
  }, [gatewayStatus]);

  // Log polling progress
  useEffect(() => {
    if (orderData && isPolling) {
      console.log(
        `📊 Poll #${pollCount} (${elapsedTime}s): Status=${orderData.status}, Paid=${orderData.summary?.totalPaid}/${orderData.summary?.totalPrice}`
      );
    }
  }, [orderData, pollCount, elapsedTime, isPolling]);

  // Cleanup on unmount
  useEffect(() => {
    const currentTimer = timerRef.current;
    return () => {
      if (currentTimer) {
        clearInterval(currentTimer);
      }
    };
  }, []);

  const handleRetry = () => {
    console.log('🔄 Manually retrying...');
    pollCountRef.current = 0;
    elapsedRef.current = 0;
    setPollCount(0);
    setElapsedTime(0);
    setIsPolling(true);
    setError(null);
    // Invalidate queries to trigger immediate refetch
    queryClient.invalidateQueries({
      queryKey: ['payment-order-status', bookingId],
    });
    if (momoOrderId) {
      queryClient.invalidateQueries({
        queryKey: ['momo-gateway-status', momoOrderId],
      });
    }
  };

  // Still loading initial state
  if (isLoading && !orderData) {
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
        subTitle={`Booking ${bookingId} has been paid in full.`}
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
                value={formatMoneyVND(orderData.summary?.totalPrice || 0)}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Order Status"
                value={orderData.status}
                styles={{ content: { color: '#52c41a' } }}
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
        subTitle={`Booking ${bookingId} - Deposit payment confirmed. Please complete remaining balance.`}
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
                value={formatMoneyVND(orderData.summary?.totalPaid || 0)}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Remaining Balance"
                value={formatMoneyVND(orderData.summary?.remainingAmount || 0)}
                styles={{ content: { color: '#faad14' } }}
              />
            </Col>
          </Row>

          <Alert
            style={{ marginTop: 16 }}
            title="Deposit Payment Confirmed"
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
          <Space key="actions" orientation="vertical" className="w-full">
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
            title="Payment Verification In Progress"
            description={
              gatewayConfirmed
                ? "MoMo has confirmed the payment. We're waiting for the studio system to finish syncing the order status."
                : "We're confirming your payment with Momo. This typically takes 5-15 seconds. If it takes longer, check your Momo app to confirm the payment was sent."
            }
            type="info"
            showIcon
          />

          {orderData && (
            <Card style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Expected Amount"
                    value={formatMoneyVND(orderData.summary?.totalPrice || 0)}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="Current Status"
                    value={orderData.status || 'UNPAID'}
                    styles={{ content: { color: '#faad14' } }}
                  />
                </Col>
              </Row>
            </Card>
          )}
        </Card>
      </Result>
    );
  }

  // ❌ Payment not confirmed after timeout or error
  return (
    <Result
      status="warning"
      title={error ? 'Payment Error' : 'Payment Verification Timeout'}
      subTitle={
        error
          ? error
          : "We couldn't verify your payment within the expected time. Please check your Momo app and try again."
      }
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
          title="What to do next"
          description={
            <ul>
              <li>✅ Check your Momo app - confirm the payment was sent</li>
              <li>
                ✅ If payment shows in Momo: Click 'Try Again' to re-check
              </li>
              <li>
                ✅ If payment is confirmed but this page still shows timeout:
                Contact support with Booking ID: {bookingId}
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
                <Statistic title="Booking ID" value={orderData.bookingId} />
              </Col>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Expected Amount"
                  value={formatMoneyVND(orderData.summary?.totalPrice || 0)}
                />
              </Col>
            </Row>
          </Card>
        )}

        {error && (
          <Alert
            style={{ marginTop: 16 }}
            title="Error Details"
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
