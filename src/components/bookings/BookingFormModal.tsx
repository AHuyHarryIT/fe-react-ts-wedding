import { DeleteOutlined } from '@ant-design/icons';
import { useGenericSelect } from '@hooks/useGenericSelect';
import type { Booking, BookingStatus } from '@types';
import { formatMoneyVND } from '@utils/money';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Space,
  Tag,
  type FormInstance,
} from 'antd';
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

type CustomerExtra = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type ServiceExtra = {
  id: string;
  name: string;
  price: number;
};

type PackageExtra = {
  id: string;
  name: string;
  price: number;
};

export function BookingFormModal({
  type,
  open,
  loading,
  selectedBooking,
  form,
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

  const customerOptions = useGenericSelect<CustomerExtra>({
    entity: 'customers',
  });

  const serviceOptions = useGenericSelect<ServiceExtra>({
    entity: 'services',
  });

  const packageOptions = useGenericSelect<PackageExtra>({
    entity: 'packages',
  });

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
            showSearch={{
              filterOption: false,
              onSearch: customerOptions.onSearch,
            }}
            loading={customerOptions.loading}
            options={customerOptions.options.map((customer) => ({
              label: `${customer.lastName} ${customer.firstName} (${customer.phoneNumber})`,
              value: customer.id,
            }))}
            onPopupScroll={(e) => {
              const target = e.target as HTMLDivElement;
              if (
                target.scrollTop + target.offsetHeight >=
                target.scrollHeight - 8
              ) {
                customerOptions.loadMore();
              }
            }}
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
          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <Form.Item name="packages" label="Packages" noStyle>
              <Select
                placeholder="Select packages"
                allowClear
                showSearch={{
                  filterOption: false,
                  onSearch: packageOptions.onSearch,
                }}
                loading={packageOptions.loading}
                options={packageOptions.options.map((pkg) => ({
                  label: `${pkg.name} - ${formatMoneyVND(pkg.price)}`,
                  value: pkg.id,
                }))}
                onPopupScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (
                    target.scrollTop + target.offsetHeight >=
                    target.scrollHeight - 8
                  ) {
                    packageOptions.loadMore();
                  }
                }}
                onChange={(pkgId) => {
                  if (!pkgId) return;

                  const existingItem = selectedItems.find(
                    (item) => item.id === pkgId && item.type === 'package'
                  );

                  if (existingItem) {
                    onItemQuantityChange(
                      pkgId,
                      'package',
                      existingItem.quantity + 1
                    );
                  } else {
                    const pkg = packageOptions.options.find(
                      (p) => p.id === pkgId
                    );
                    if (pkg) {
                      onItemAdd({
                        id: pkg.id,
                        type: 'package',
                        name: pkg.name,
                        price: pkg.price,
                        quantity: 1,
                      });
                    }
                  }
                }}
              />
            </Form.Item>

            <Form.Item name="services" label="Services" noStyle>
              <Select
                placeholder="Select services"
                allowClear
                showSearch={{
                  filterOption: false,
                  onSearch: serviceOptions.onSearch,
                }}
                loading={serviceOptions.loading}
                options={serviceOptions.options.map((svc) => ({
                  label: `${svc.name} - ${formatMoneyVND(svc.price)}`,
                  value: svc.id,
                }))}
                onPopupScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (
                    target.scrollTop + target.offsetHeight >=
                    target.scrollHeight - 8
                  ) {
                    serviceOptions.loadMore();
                  }
                }}
                onChange={(svcId) => {
                  if (!svcId) return;

                  const existingItem = selectedItems.find(
                    (item) => item.id === svcId && item.type === 'service'
                  );

                  if (existingItem) {
                    onItemQuantityChange(
                      svcId,
                      'service',
                      existingItem.quantity + 1
                    );
                  } else {
                    const svc = serviceOptions.options.find(
                      (s) => s.id === svcId
                    );
                    if (svc) {
                      onItemAdd({
                        id: svc.id,
                        type: 'service',
                        name: svc.name,
                        price: svc.price,
                        quantity: 1,
                      });
                    }
                  }
                }}
              />
            </Form.Item>
          </div>
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
                            {formatMoneyVND(item.price)} × {item.quantity} ={' '}
                            {formatMoneyVND(
                              (item.price || 0) * (item.quantity || 1)
                            )}
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
            <div className="font-bold text-lg">
              Total Price: {formatMoneyVND(totalPrice)}
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
