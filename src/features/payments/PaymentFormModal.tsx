import React, { useState } from 'react';
import {
  App,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Spin,
} from 'antd';
import { useMutation } from '@tanstack/react-query';
import { paymentApi, type MomoPaymentRequest } from '@services/PaymentService';

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
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOMO'>('CASH');

  const createPaymentMutation = useMutation({
    mutationFn: ({
      method,
      amount,
    }: {
      method: 'CASH' | 'MOMO';
      amount: number;
    }) => {
      if (method === 'CASH') {
        return paymentApi.createCash(bookingId, amount);
      }
      const paymentData: MomoPaymentRequest = { amount, bookingId };
      return paymentApi.createMomo(paymentData);
    },
    onSuccess: (result, variables) => {
      if (variables.method === 'CASH') {
        if (result.data) {
          message.success('Cash payment recorded successfully');
          if (onPaymentSuccess) {
            onPaymentSuccess(String(result.data.id));
          }
          form.resetFields();
          onClose();
        }
      } else {
        const response = result.data;
        if (response?.success && response?.payUrl) {
          localStorage.setItem('currentOrderId', bookingId);
          localStorage.setItem('orderId', bookingId);
          if (onPaymentSuccess) {
            onPaymentSuccess(response.paymentId);
          }
          window.location.assign(response.payUrl);
        } else {
          message.error(response?.message || 'Failed to create Momo payment');
        }
      }
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'Payment failed');
    },
  });

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as 'CASH' | 'MOMO');
    form.resetFields();
  };

  const handleSubmit = async (values: { amount: number }) => {
    createPaymentMutation.mutate({
      method: paymentMethod,
      amount: values.amount,
    });
  };

  return (
    <Modal
      title="Payment"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Spin spinning={createPaymentMutation.isPending}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            amount: totalAmount,
          }}
        >
          <Form.Item label="Payment Method" required>
            <Select value={paymentMethod} onChange={handlePaymentMethodChange}>
              <Select.Option value="CASH">Cash Payment</Select.Option>
              <Select.Option value="MOMO">MoMo</Select.Option>
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
                <strong>Note:</strong> You will be redirected to the MoMo
                payment page to complete the transaction.
              </p>
              <p style={{ marginBottom: '0', fontSize: '12px', color: '#666' }}>
                After payment, MoMo will send you back to the payment result
                page automatically.
              </p>
            </div>
          )}

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createPaymentMutation.isPending}
              danger={paymentMethod === 'MOMO'}
            >
              {paymentMethod === 'CASH'
                ? 'Record Cash Payment'
                : 'Continue to MoMo'}
            </Button>
          </Space>
        </Form>
      </Spin>
    </Modal>
  );
};

export default PaymentFormModal;
