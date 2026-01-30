import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Spin,
  Result,
} from 'antd';
import {
  paymentApi,
  type MomoPaymentRequest,
  type MomoPaymentResponse,
} from '@services/PaymentService';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  totalAmount: number;
  onPaymentSuccess?: (paymentId: string) => void;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  totalAmount,
  onPaymentSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOMO'>('CASH');
  const [paymentResult, setPaymentResult] =
    useState<MomoPaymentResponse | null>(null);

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as 'CASH' | 'MOMO');
    form.resetFields();
    setPaymentResult(null);
  };

  const handleSubmit = async (amount: number) => {
    try {
      setLoading(true);

      if (paymentMethod === 'CASH') {
        const result = await paymentApi.createCash(bookingId, amount);
        if (result.data) {
          message.success('Cash payment recorded successfully');
          if (onPaymentSuccess) {
            onPaymentSuccess(result.data.id);
          }
          form.resetFields();
          onClose();
        }
      } else if (paymentMethod === 'MOMO') {
        const paymentData: MomoPaymentRequest = {
          amount: amount,
          bookingId,
        };

        const result = await paymentApi.createMomo(paymentData);

        if (result.data) {
          const response = result.data;
          if (response.success && response.payUrl) {
            // Store orderId in localStorage for PaymentResultPage
            localStorage.setItem('currentOrderId', bookingId);
            localStorage.setItem('orderId', bookingId);

            // Redirect to Momo payment page
            setPaymentResult(response);
            // Redirect to payment result page instead of opening new tab
            window.location.href = `/payments/result?orderId=${bookingId}`;

            if (onPaymentSuccess) {
              onPaymentSuccess(response.paymentId);
            }
          } else {
            message.error(response.message || 'Failed to create Momo payment');
          }
        }
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Payment"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {paymentResult && paymentMethod === 'MOMO' ? (
        <Result
          status="success"
          title="Payment Request Sent"
          subTitle="Please complete your payment in the new window. You can close this modal after payment is done."
          extra={
            <Button
              type="primary"
              onClick={() => {
                setPaymentResult(null);
                onClose();
              }}
            >
              Close
            </Button>
          }
        />
      ) : (
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              amount: totalAmount,
            }}
          >
            <Form.Item label="Payment Method" required>
              <Select
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <Select.Option value="CASH">Cash Payment</Select.Option>
                <Select.Option value="MOMO">Momo E-Wallet</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Amount (VND)"
              name="amount"
              rules={[
                { required: true, message: 'Please enter amount' },
                {
                  type: 'number',
                  min: 1000,
                  message: 'Minimum amount is 1000 VND',
                },
              ]}
            >
              <InputNumber style={{ width: '100%' }} min={1000} step={1000} />
            </Form.Item>

            {paymentMethod === 'CASH' && (
              <Form.Item label="Note" name="note">
                <Input.TextArea
                  placeholder="Add any notes about the payment..."
                  rows={3}
                />
              </Form.Item>
            )}

            {paymentMethod === 'MOMO' && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f0f2f5',
                  borderRadius: '4px',
                }}
              >
                <p style={{ marginBottom: '8px' }}>
                  <strong>Note:</strong> You will be redirected to Momo payment
                  gateway to complete the transaction.
                </p>
                <p
                  style={{ marginBottom: '0', fontSize: '12px', color: '#666' }}
                >
                  Please ensure you have a Momo account set up on your phone.
                </p>
              </div>
            )}

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                danger={paymentMethod === 'MOMO'}
              >
                {paymentMethod === 'CASH'
                  ? 'Record Cash Payment'
                  : 'Pay with Momo'}
              </Button>
            </Space>
          </Form>
        </Spin>
      )}
    </Modal>
  );
};

export default PaymentFormModal;
