import { ordersService } from '@services/OrdersService';
import type { CheckoutRequest, Order, PaymentMethod } from '@types';
import type { MomoQRCodeResponse } from '../../types/payment';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  QRCode,
  Radio,
  Row,
} from 'antd';
import React, { useMemo, useState } from 'react';
import momoLogo from '@/assets/icons/momo-logo.svg';

interface CheckoutFormProps {
  bookingId: string;
  totalPrice: number;
  existingOrder?: Order | null;
  onCheckoutSuccess?: (order: Order | null) => void;
  onClose?: () => void;
}

const MIN_DEPOSIT_PERCENTAGE = 30;

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  bookingId,
  totalPrice,
  existingOrder,
  onCheckoutSuccess,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>(
    'full'
  );
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<MomoQRCodeResponse | null>(null);

  // Calculate deposit (fixed 30%)
  const depositCalculations = useMemo(() => {
    const depositAmount = (totalPrice * MIN_DEPOSIT_PERCENTAGE) / 100;

    return {
      depositAmount,
      depositPaid: depositAmount,
      remainingAmount: totalPrice - depositAmount,
    };
  }, [totalPrice]);

  interface CheckoutFormValues {
    paymentMethod?: PaymentMethod;
    note?: string;
    [key: string]: unknown;
  }

  const handleCheckout = async (values: CheckoutFormValues) => {
    try {
      setLoading(true);

      if (existingOrder && existingOrder.bookingId) {
        // Second checkout: pay remaining
        if (!values.paymentMethod) {
          message.error('Payment method is required');
          return;
        }

        // Calculate remaining amount from order data
        const totalPrice = existingOrder.totalPrice || 0;
        const totalPaid =
          (existingOrder.summary?.totalPaid ?? 0) ||
          (existingOrder.depositPaid || 0) + (existingOrder.remainingPaid || 0);
        const remainingAmount = Math.max(0, totalPrice - totalPaid);

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

        const updatedOrder = await ordersService.payRemaining(
          existingOrder.bookingId,
          payRemainingData
        );

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

          const momoResponse = await ordersService.initiateMomoPayment(
            existingOrder.bookingId,
            remainingPayment.id
          );

          if (momoResponse) {
            // Show QR code modal instead of redirecting
            setQrCodeData({
              ...momoResponse,
              amount: remainingAmount,
              orderInfo: 'Wedding Booking - Remaining Balance Payment',
            });
            setShowQRCode(true);
            return;
          } else {
            message.error('Failed to initiate MOMO payment');
            return;
          }
        }

        message.success('Payment completed successfully!');
        onCheckoutSuccess?.(updatedOrder);
      } else {
        // First checkout: create order with appropriate payment option
        if (paymentOption === 'deposit') {
          // Pay 30% deposit
          const checkoutData: CheckoutRequest = {
            bookingId,
            makeDeposit: true,
            depositValue: MIN_DEPOSIT_PERCENTAGE,
            isDepositPercentage: true,
            paymentMethod: values.paymentMethod as PaymentMethod | undefined,
            note: values.note || '',
          };

          // Handle MOMO payment for E-WALLET
          if (values.paymentMethod === 'E_WALLET') {
            // First create the order
            const order = await ordersService.checkout(checkoutData);

            // Extract payment ID from the created order
            const paymentId = order.payments?.[0]?.id;
            if (!paymentId) {
              message.error('Payment not created - unable to initiate MOMO');
              return;
            }

            // Then initiate MOMO payment with payment ID
            const momoResponse = await ordersService.initiateMomoPayment(
              order.bookingId,
              paymentId
            );

            if (momoResponse) {
              // Show QR code modal instead of redirecting
              setQrCodeData({
                ...momoResponse,
                amount: depositCalculations.depositAmount,
                orderInfo: 'Wedding Booking - Deposit Payment (30%)',
                bookingId: order.bookingId,
              });
              setShowQRCode(true);
              return;
            } else {
              message.error('Failed to initiate MOMO payment');
              return;
            }
          }

          const order = await ordersService.checkout(checkoutData);
          message.success('Deposit payment processed successfully!');
          onCheckoutSuccess?.(order);
        } else if (paymentOption === 'full') {
          // Pay full amount
          const checkoutData: CheckoutRequest = {
            bookingId,
            makeDeposit: false,
            depositValue: totalPrice,
            isDepositPercentage: false,
            paymentMethod: values.paymentMethod as PaymentMethod | undefined,
            note: values.note || '',
          };

          // Handle MOMO payment for E-WALLET
          if (values.paymentMethod === 'E_WALLET') {
            // First create the order
            const order = await ordersService.checkout(checkoutData);

            // Extract payment ID from the created order
            const paymentId = order.payments?.[0]?.id;
            if (!paymentId) {
              message.error('Payment not created - unable to initiate MOMO');
              return;
            }

            // Then initiate MOMO payment with payment ID
            const momoResponse = await ordersService.initiateMomoPayment(
              order.bookingId,
              paymentId
            );

            if (momoResponse) {
              // Show QR code modal instead of redirecting
              setQrCodeData({
                ...momoResponse,
                amount: totalPrice,
                orderInfo: 'Wedding Booking - Full Amount Payment',
                bookingId: order.bookingId,
              });
              setShowQRCode(true);
              return;
            } else {
              message.error('Failed to initiate MOMO payment');
              return;
            }
          }

          const order = await ordersService.checkout(checkoutData);
          message.success('Full payment processed successfully!');
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
    } finally {
      setLoading(false);
    }
  };

  // Note: Payment polling happens via dedicated payment pages and IPN callbacks
  // This checkout modal just displays the QR code

  // Cleanup on modal close
  const handleCloseQRModal = () => {
    console.log('🔴 Closing QR modal');
    setShowQRCode(false);
    setQrCodeData(null);
  };

  // Calculate remaining amount
  const calculateRemaining = () => {
    if (!existingOrder) return 0;
    const total = existingOrder.totalPrice || 0;
    const paid =
      (existingOrder.depositPaid || 0) + (existingOrder.remainingPaid || 0);
    return Math.max(0, total - paid);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleCheckout}>
      {/* Order Summary */}
      {existingOrder ? (
        <>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div className="text-gray-600">Total Price</div>
              <div className="text-xl font-semibold">
                {totalPrice.toLocaleString()} VND
              </div>
            </Col>
          </Row>

          <Col xs={24} sm={12}>
            <div className="text-gray-600">Total Paid</div>
            <div className="text-lg text-green-600">
              {(existingOrder.depositPaid ?? 0).toLocaleString()} VND
            </div>
          </Col>
          <Divider />
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div className="text-gray-600">Remaining Balance</div>
              <div className="text-xl font-semibold text-red-600">
                {calculateRemaining().toLocaleString()} VND
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
                    {depositCalculations.depositAmount?.toLocaleString()} VND
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="text-sm text-gray-600">Remaining to Pay</div>
                  <div className="font-semibold text-lg">
                    {depositCalculations.remainingAmount?.toLocaleString()} VND
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
                    {totalPrice.toLocaleString()} VND
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
          <Form.Item>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={paymentOption === 'deposit'}
                onChange={(e) =>
                  setPaymentOption(e.target.checked ? 'deposit' : 'full')
                }
              />
              <span>Pay 30% deposit now, remaining later</span>
            </label>
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
            <Radio value="BANK_TRANSFER">Bank Transfer</Radio>
            <Radio value="CREDIT_CARD">Credit Card</Radio>
            <Radio value="E_WALLET">E-Wallet</Radio>
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
              loading={loading}
              block
              size="large"
            >
              Checkout
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

      {/* QR Code Modal for MOMO Payment */}
      <Modal
        title="MOMO Payment - Scan QR Code"
        open={showQRCode}
        onCancel={handleCloseQRModal}
        footer={[
          <Button key="cancel" onClick={handleCloseQRModal}>
            Close
          </Button>,
          qrCodeData?.deepLink ? (
            <Button
              key="open-link"
              type="primary"
              href={qrCodeData.deepLink}
              target="_blank"
            >
              Open Payment Link
            </Button>
          ) : null,
        ]}
        width={500}
      >
        <div className="text-center p-5">
          <h3>Amount: {(qrCodeData?.amount || 0).toLocaleString()} VND</h3>
          <p className="text-gray-600 mb-5">
            Scan QR code with MoMo app to complete payment
          </p>

          <div className="flex justify-center mb-5">
            <QRCode
              value={qrCodeData?.qrCodeUrl || ''}
              status={qrCodeData?.qrCodeUrl ? 'active' : 'loading'}
              icon={momoLogo}
            />
          </div>

          {qrCodeData?.deepLink && (
            <div className="mt-5">
              <p className="text-gray-400 text-xs">Or tap here on mobile:</p>
              <Button
                type="dashed"
                href={qrCodeData.deepLink}
                className="w-full"
              >
                Open MOMO App
              </Button>
            </div>
          )}

          <div className="mt-5 p-2.5 bg-sky-50 rounded text-left text-xs">
            <p>
              <strong>Payment Details:</strong>
            </p>
            <p>Order ID: {qrCodeData?.orderId}</p>
            <p>Amount: {(qrCodeData?.amount || 0).toLocaleString()} VND</p>
            <p className="mt-3 text-gray-600">
              ℹ️ Please complete the payment in your MoMo app. The payment
              status will be updated automatically.
            </p>
          </div>
        </div>
      </Modal>
    </Form>
  );
};
