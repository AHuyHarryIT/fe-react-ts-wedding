import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  List,
  Card,
  Empty,
  Tag,
  Space,
} from 'antd';
import { type FormInstance } from 'antd';
import type { Booking, User, Package, BookingStatus, Service } from '@types';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface BookingFormData {
  customerId: string;
  packageIds?: string[];
  serviceIds?: string[];
  notes?: string;
  eventDate: string;
  totalPrice?: number;
  status?: BookingStatus;
}

interface SelectedItem {
  id: string;
  type: 'package' | 'service';
  name: string;
  price: number;
  quantity: number;
}

interface BookingFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedBooking: Booking | null;
  form: FormInstance<BookingFormData>;
  customers: User[];
  packages: Package[];
  services: Service[];
  selectedItems: SelectedItem[];
  onCancel: () => void;
  onSubmit: (values: BookingFormData) => void;
  onItemAdd: (item: SelectedItem) => void;
  onItemRemove: (itemId: string, type: 'package' | 'service') => void;
  onItemQuantityChange: (
    itemId: string,
    type: 'package' | 'service',
    quantity: number
  ) => void;
  calculateTotalPrice: () => number;
}

export function BookingFormModal({
  type,
  open,
  loading,
  selectedBooking,
  form,
  customers,
  packages,
  services,
  selectedItems,
  onCancel,
  onSubmit,
  onItemAdd,
  onItemRemove,
  onItemQuantityChange,
  calculateTotalPrice,
}: BookingFormModalProps) {
  const isEditMode = type === 'edit' && selectedBooking;
  const title = isEditMode ? 'Edit Booking' : 'Create New Booking';
  const totalPrice = calculateTotalPrice();

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
          disabled={selectedItems.length === 0}
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>,
      ]}
      width={900}
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
            showSearch={{ optionFilterProp: 'label' }}
            options={customers.map((customer) => ({
              label: `${customer.firstName} ${customer.lastName} (${customer.phoneNumber})`,
              value: customer.id,
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
          initialValue={dayjs()}
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

        <Form.Item label="Select Packages or Services (at least 1)" required>
          <Select
            placeholder="Select packages or services"
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            options={[
              ...packages
                .filter(
                  (pkg) =>
                    !selectedItems.some(
                      (item) => item.id === pkg.id && item.type === 'package'
                    )
                )
                .map((pkg) => ({
                  label: `📦 ${pkg.name} - $${pkg.price?.toFixed(2) || '0.00'}`,
                  value: `package-${pkg.id}`,
                })),
              ...services
                .filter(
                  (svc) =>
                    !selectedItems.some(
                      (item) => item.id === svc.id && item.type === 'service'
                    )
                )
                .map((svc) => ({
                  label: `🎯 ${svc.name} - $${svc.price?.toFixed(2) || '0.00'}`,
                  value: `service-${svc.id}`,
                })),
            ]}
            onChange={(value) => {
              if (!value) return;

              if (value.startsWith('package-')) {
                const pkgId = value.replace('package-', '');
                const pkg = packages.find((p) => p.id === pkgId);
                if (pkg) {
                  onItemAdd({
                    id: pkg.id,
                    type: 'package',
                    name: pkg.name,
                    price: pkg.price || 0,
                    quantity: 1,
                  });
                }
              } else if (value.startsWith('service-')) {
                const svcId = value.replace('service-', '');
                const svc = services.find((s) => s.id === svcId);
                if (svc) {
                  onItemAdd({
                    id: svc.id,
                    type: 'service',
                    name: svc.name,
                    price: svc.price || 0,
                    quantity: 1,
                  });
                }
              }
            }}
          />
        </Form.Item>

        {/* Selected Items Display */}
        <Form.Item label="Selected Items">
          {selectedItems.length === 0 ? (
            <Empty
              description="No items selected"
              style={{ marginTop: 20, marginBottom: 20 }}
            />
          ) : (
            <Card
              size="small"
              style={{ marginBottom: 16 }}
              title={`Selected Items (${selectedItems.length})`}
            >
              <List
                dataSource={selectedItems}
                renderItem={(item) => (
                  <List.Item
                    extra={
                      <Space>
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(value) =>
                            onItemQuantityChange(item.id, item.type, value || 1)
                          }
                          style={{ width: 60 }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => onItemRemove(item.id, item.type)}
                        />
                      </Space>
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Tag color={item.type === 'package' ? 'blue' : 'green'}>
                          {item.type === 'package' ? '📦' : '🎯'}
                        </Tag>
                      }
                      title={item.name}
                      description={
                        <div>
                          <div>
                            ${item.price.toFixed(2)} × {item.quantity} = $
                            {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Form.Item>

        {selectedItems.length > 0 && (
          <Card
            style={{
              backgroundColor: '#f0f5ff',
              marginBottom: 16,
              borderColor: '#1890ff',
              borderWidth: 2,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 'bold' }}>
              Total Price: ${totalPrice.toFixed(2)}
            </div>
          </Card>
        )}

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
