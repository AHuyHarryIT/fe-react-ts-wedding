import { ordersService } from '@services/OrdersService';
import type { CheckoutRequest, Order, PaymentMethod } from '@types';
import { formatMoneyVND } from '@utils/money';
import { App, Button, Col, Divider, Form, Input, Radio, Row } from 'antd';
import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

interface CheckoutFormProps {
  bookingId: string;
  totalPrice: number;
  existingOrder?: Order | null;
  onCheckoutSuccess?: (order: Order | null) => void;
  onClose?: () => void;
}

const MIN_DEPOSIT_PERCENTAGE = 30;
const STAFF_APP_BASE_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:5173'
  : window.location.origin;
const getStaffPaymentResultUrl = (bookingId: string) =>
  `${STAFF_APP_BASE_URL}/payments/result?bookingId=${bookingId}`;

const CURRENT_BOOKING_ID_KEY = 'currentBookingId';
const CURRENT_MOMO_ORDER_ID_KEY = 'currentMomoOrderId';

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  bookingId,
  totalPrice,
  existingOrder,
  onCheckoutSuccess,
  onClose,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>(
    'full'
  );

  // Calculate deposit (fixed 30%)
  const depositCalculations = useMemo(() => {
    const depositAmount = (totalPrice * MIN_DEPOSIT_PERCENTAGE) / 100;

    return {
      depositAmount,
      depositPaid: depositAmount,
      remainingAmount: totalPrice - depositAmount,
    };
  }, [totalPrice]);

  // Mutation: Checkout
  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutRequest) => ordersService.checkout(data),
  });

  // Mutation: Pay Remaining
  const payRemainingMutation = useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: {
        paymentAmount: number;
        paymentMethod: PaymentMethod;
        note: string;
      };
    }) => ordersService.payRemaining(bookingId, data),
  });

  // Mutation: Initiate MoMo Payment
  const momoMutation = useMutation({
    mutationFn: ({
      bookingId,
      paymentId,
      returnUrl,
    }: {
      bookingId: string;
      paymentId: string;
      returnUrl: string;
    }) => ordersService.initiateMomoPayment(bookingId, paymentId, returnUrl),
  });

  // Combined loading state
  const isPending =
    checkoutMutation.isPending ||
    payRemainingMutation.isPending ||
    momoMutation.isPending;

  interface CheckoutFormValues {
    paymentMethod?: PaymentMethod;
    note?: string;
    [key: string]: unknown;
  }

  // Calculate remaining amount from API data
  const calculateRemaining = () => {
    if (!existingOrder) return 0;
    // Use summary data from API first, fallback to calculated values
    if (existingOrder.summary?.remainingAmount !== undefined) {
      return existingOrder.summary.remainingAmount;
    }
    const total = existingOrder.totalPrice || 0;
    const paid =
      existingOrder.summary?.totalPaid ??
      (existingOrder.depositPaid || 0) + (existingOrder.remainingPaid || 0);
    return Math.max(0, total - paid);
  };

  // Handle MoMo payment redirect logic
  const handleMomoRedirect = (
    momoResponse: { payUrl?: string; orderId?: string } | undefined,
    orderId: string
  ) => {
    if (momoResponse?.payUrl) {
      localStorage.setItem(CURRENT_BOOKING_ID_KEY, orderId);
      localStorage.setItem('currentOrderId', orderId);
      localStorage.setItem('orderId', orderId);
      if (momoResponse.orderId) {
        localStorage.setItem(CURRENT_MOMO_ORDER_ID_KEY, momoResponse.orderId);
      }
      window.location.assign(momoResponse.payUrl);
      return true;
    } else {
      message.error('Failed to initiate MOMO payment');
      return false;
    }
  };

  const handleCheckout = async (values: CheckoutFormValues) => {
    try {
      if (existingOrder && existingOrder.bookingId) {
        // Second checkout: pay remaining
        if (!values.paymentMethod) {
          message.error('Payment method is required');
          return;
        }

        // Calculate remaining amount from API summary
        const remainingAmount =
          existingOrder.summary?.remainingAmount ?? calculateRemaining();

        if (remainingAmount <= 0) {
          message.error('No remaining balance to pay');
          return;
        }

        // First, create the remaining payment
        const payRemainingData = {
          bookingId: existingOrder.bookingId,
          paymentAmount: remainingAmount,
          paymentMethod: values.paymentMethod as PaymentMethod,
          note: values.note || '',
        };

        const updatedOrder =
          await payRemainingMutation.mutateAsync(payRemainingData);

        // Handle MOMO payment for E-WALLET
        if (values.paymentMethod === 'E_WALLET') {
          // Extract the new remaining payment ID
          const remainingPayment = updatedOrder.payments?.find(
            (p) => p.paymentType === 'REMAINING' && p.status === 'PENDING'
          );

          if (!remainingPayment) {
            message.error('Remaining payment not created');
            return;
          }

          const momoResponse = await momoMutation.mutateAsync({
            bookingId: existingOrder.bookingId,
            paymentId: remainingPayment.id,
            returnUrl: getStaffPaymentResultUrl(existingOrder.bookingId),
          });

          if (!handleMomoRedirect(momoResponse, existingOrder.bookingId)) {
            return;
          }
        }

        message.success('Payment completed successfully!');
        onCheckoutSuccess?.(updatedOrder);
      } else {
        // First checkout: create order with appropriate payment option
        if (paymentOption === 'deposit' || paymentOption === 'full') {
          const checkoutData: CheckoutRequest = {
            bookingId,
            makeDeposit: paymentOption === 'deposit',
            depositValue:
              paymentOption === 'deposit' ? MIN_DEPOSIT_PERCENTAGE : totalPrice,
            isDepositPercentage: paymentOption === 'deposit',
            paymentMethod: values.paymentMethod as PaymentMethod | undefined,
            note: values.note || '',
          };

          // Handle MOMO payment for E-WALLET
          if (values.paymentMethod === 'E_WALLET') {
            // First create the order
            const order = await checkoutMutation.mutateAsync(checkoutData);

            // Extract payment ID from the created order
            const paymentId = order.payments?.[0]?.id;
            if (!paymentId) {
              message.error('Payment not created - unable to initiate MOMO');
              return;
            }

            // Then initiate MOMO payment with payment ID
            const momoResponse = await momoMutation.mutateAsync({
              bookingId: order.bookingId,
              paymentId,
              returnUrl: getStaffPaymentResultUrl(order.bookingId),
            });

            if (!handleMomoRedirect(momoResponse, order.bookingId)) {
              return;
            }
          }

          const order = await checkoutMutation.mutateAsync(checkoutData);
          message.success(
            `${paymentOption === 'deposit' ? 'Deposit' : 'Full'} payment processed successfully!`
          );
          onCheckoutSuccess?.(order);
        }
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        error instanceof Error
          ? error.message
          : axiosError?.response?.data?.message || 'Checkout failed';
      message.error(errorMessage);
    }
  };

  // Get total paid from API data
  const getTotalPaid = () => {
    if (!existingOrder) return 0;
    // Use summary data from API first, fallback to calculated values
    if (existingOrder.summary?.totalPaid !== undefined) {
      return existingOrder.summary.totalPaid;
    }
    return (
      (existingOrder.depositPaid || 0) + (existingOrder.remainingPaid || 0)
    );
  };

  const submitLabel = existingOrder
    ? 'Collect Remaining Payment'
    : paymentOption === 'deposit'
      ? 'Collect 30% Deposit'
      : 'Collect Full Payment';

  return (
    <Form form={form} layout="vertical" onFinish={handleCheckout}>
      {/* Order Summary */}
      {existingOrder ? (
        <>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div className="text-gray-600">Total Price</div>
              <div className="text-xl font-semibold">
                {formatMoneyVND(
                  existingOrder.summary?.totalPrice ?? existingOrder.totalPrice
                )}
              </div>
            </Col>
          </Row>

          <Col xs={24} sm={12}>
            <div className="text-gray-600">Total Paid</div>
            <div className="text-lg text-green-600">
              {formatMoneyVND(getTotalPaid())}
            </div>
          </Col>
          <Divider />
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div className="text-gray-600">Remaining Balance</div>
              <div className="text-xl font-semibold text-red-600">
                {formatMoneyVND(calculateRemaining())}
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <>
          {paymentOption === 'deposit' && (
            <>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <div className="text-sm text-gray-600">
                    Deposit Amount (30%)
                  </div>
                  <div className="font-semibold text-lg text-blue-600">
                    {formatMoneyVND(depositCalculations.depositAmount ?? 0)}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="text-sm text-gray-600">Remaining to Pay</div>
                  <div className="font-semibold text-lg">
                    {formatMoneyVND(depositCalculations.remainingAmount ?? 0)}
                  </div>
                </Col>
              </Row>
            </>
          )}

          {paymentOption === 'full' && (
            <>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <div className="text-sm text-gray-600">Total price</div>
                  <div className="font-semibold text-lg text-green-600">
                    {formatMoneyVND(totalPrice)}
                  </div>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

      {/* Deposit Option (First Checkout Only) */}
      {!existingOrder && (
        <>
          <Form.Item label="Payment Plan">
            <Radio.Group
              value={paymentOption}
              onChange={(e) =>
                setPaymentOption(e.target.value as 'deposit' | 'full')
              }
              className="w-full"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50">
                  <div className="flex items-start gap-3">
                    <Radio value="deposit" className="mt-1" />
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">
                        Deposit 30%
                      </div>
                      <div className="text-sm text-slate-600">
                        Collect the minimum deposit now and leave the remaining
                        balance for later.
                      </div>
                      <div className="text-sm font-medium text-blue-700">
                        {formatMoneyVND(depositCalculations.depositAmount ?? 0)}{' '}
                        now
                      </div>
                    </div>
                  </div>
                </label>

                <label className="block cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <div className="flex items-start gap-3">
                    <Radio value="full" className="mt-1" />
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">
                        Full Payment
                      </div>
                      <div className="text-sm text-slate-600">
                        Collect the entire booking amount in a single checkout.
                      </div>
                      <div className="text-sm font-medium text-emerald-700">
                        {formatMoneyVND(totalPrice)} now
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </Radio.Group>
          </Form.Item>
        </>
      )}

      <Divider />

      {/* Payment Method - show if making deposit, paying full amount, or paying remaining */}
      {(paymentOption === 'deposit' ||
        paymentOption === 'full' ||
        existingOrder) && (
        <Form.Item
          label="Payment Method"
          name="paymentMethod"
          rules={[
            {
              required:
                paymentOption === 'deposit' ||
                paymentOption === 'full' ||
                !!existingOrder,
              message: 'Payment method is required',
            },
          ]}
        >
          <Radio.Group>
            <Radio value="E_WALLET">MoMo</Radio>
            <Radio value="CASH">Cash</Radio>
          </Radio.Group>
        </Form.Item>
      )}

      {/* Note */}
      <Form.Item label="Note" name="note">
        <Input.TextArea
          placeholder="Additional notes for this payment"
          rows={3}
        />
      </Form.Item>

      {/* Buttons */}
      <Form.Item>
        <Row gutter={8}>
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              block
              size="large"
            >
              {submitLabel}
            </Button>
          </Col>
          {onClose && (
            <Col xs={24} sm={12}>
              <Button onClick={onClose} block size="large">
                Cancel
              </Button>
            </Col>
          )}
        </Row>
      </Form.Item>
    </Form>
  );
};
