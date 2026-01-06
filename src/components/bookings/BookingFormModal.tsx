import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
} from 'antd';
import { type FormInstance } from 'antd';
import type { Booking, User, Package, BookingStatus } from '@types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface BookingFormData {
  customerId: string;
  packageId: string;
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: BookingStatus;
}

interface BookingFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedBooking: Booking | null;
  form: FormInstance<BookingFormData>;
  customers: User[];
  packages: Package[];
  onCancel: () => void;
  onSubmit: (values: BookingFormData) => void;
}

const bookingStatuses: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED',
];

export function BookingFormModal({
  type,
  open,
  loading,
  selectedBooking,
  form,
  customers,
  packages,
  onCancel,
  onSubmit,
}: BookingFormModalProps) {
  const isEditMode = type === 'edit' && selectedBooking;
  const title = isEditMode ? 'Edit Booking' : 'Create New Booking';

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>,
      ]}
      width={700}
    >
      <Form<BookingFormData>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          status: 'PENDING',
        }}
      >
        <Form.Item
          name="customerId"
          label="Customer"
          rules={[{ required: true, message: 'Please select a customer' }]}
        >
          <Select
            placeholder="Select a customer"
            showSearch
            optionFilterProp="label"
            options={customers.map((customer) => ({
              label: `${customer.firstName} ${customer.lastName} (${customer.phoneNumber})`,
              value: customer.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="packageId"
          label="Package"
          rules={[{ required: true, message: 'Please select a package' }]}
        >
          <Select
            placeholder="Select a package"
            showSearch
            optionFilterProp="label"
            options={packages.map((pkg) => ({
              label: `${pkg.name} - $${pkg.price?.toFixed(2) || '0.00'}`,
              value: pkg.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="eventDate"
          label="Event Date"
          rules={[{ required: true, message: 'Please select event date' }]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
          normalize={(value) => value?.toISOString()}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm"
            showTime
            disabledDate={(current) => {
              return current && current < dayjs().startOf('day');
            }}
          />
        </Form.Item>

        <Form.Item
          name="totalPrice"
          label="Total Price ($)"
          rules={[{ type: 'number', min: 0 }]}
        >
          <InputNumber
            placeholder="0.00"
            precision={2}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select booking status">
            {bookingStatuses.map((status) => (
              <Select.Option key={status} value={status}>
                {status}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <TextArea
            rows={4}
            placeholder="Add any additional notes about this booking"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
