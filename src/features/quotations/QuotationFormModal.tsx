import { DeleteOutlined } from '@ant-design/icons';
import { useGenericSelect } from '@hooks/useGenericSelect';
import type {
  Quotation,
  QuotationFormData,
  QuotationSelectedItem,
  QuotationItemType,
} from '@types';
import { formatMoneyVND } from '@utils/money';
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Typography,
  type FormInstance,
} from 'antd';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

type ServiceExtra = {
  id: string;
  name: string;
  price: number;
};

type InventoryExtra = {
  id: string;
  name: string;
  price: number;
};

interface QuotationFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedQuotation: Quotation | null;
  form: FormInstance<QuotationFormData>;
  selectedItems: QuotationSelectedItem[];
  onCancel: () => void;
  onSubmit: (values: QuotationFormData) => void;
  onItemAdd: (item: QuotationSelectedItem) => void;
  onItemRemove: (itemId: string, type: QuotationItemType) => void;
  onItemQuantityChange: (
    itemId: string,
    type: QuotationItemType,
    quantity: number
  ) => void;
  calculateSubtotal: () => number;
  calculateTotal: () => number;
}

export function QuotationFormModal({
  type,
  open,
  loading,
  selectedQuotation,
  form,
  selectedItems,
  onCancel,
  onSubmit,
  onItemAdd,
  onItemRemove,
  onItemQuantityChange,
  calculateSubtotal,
  calculateTotal,
}: QuotationFormModalProps) {
  const isEditMode = type === 'edit' && selectedQuotation;
  const title = isEditMode ? 'Edit Quotation' : 'Create New Quotation';
  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  const customerOptions = useGenericSelect<{
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }>({
    entity: 'customers',
  });

  const serviceOptions = useGenericSelect<ServiceExtra>({
    entity: 'services',
  });

  const inventoryOptions = useGenericSelect<InventoryExtra>({
    entity: 'inventory/items',
  });

  const itemColumns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: QuotationSelectedItem) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.type}
          </Text>
        </div>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (qty: number, record: QuotationSelectedItem) => (
        <InputNumber
          min={1}
          max={999}
          size="small"
          value={qty}
          onChange={(val) => {
            if (val && val >= 1) {
              onItemQuantityChange(record.id, record.type, val);
            }
          }}
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (price: number) => <Text>{formatMoneyVND(price)}</Text>,
    },
    {
      title: 'Line Total',
      key: 'lineTotal',
      width: 140,
      align: 'right' as const,
      render: (_: unknown, record: QuotationSelectedItem) => (
        <Text strong>{formatMoneyVND(record.price * record.quantity)}</Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: QuotationSelectedItem) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onItemRemove(record.id, record.type)}
        />
      ),
    },
  ];

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
      <Form<QuotationFormData>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          discountPercent: 0,
          taxPercent: 0,
        }}
      >
        <Form.Item
          name="customerId"
          label="Customer"
          rules={[
            {
              required: true,
              message: 'Please select a customer',
            },
          ]}
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
          name="title"
          label="Quotation Title"
          rules={[
            {
              required: true,
              message: 'Please enter a title',
            },
          ]}
        >
          <Input placeholder="e.g. Wedding Photography Package" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="validUntil"
            label="Valid Until"
            rules={[
              {
                required: true,
                message: 'Please select validity date',
              },
            ]}
            style={{ flex: 1 }}
            getValueProps={(value: string | null) => ({
              value: value ? dayjs(value) : undefined,
            })}
            normalize={(value: dayjs.Dayjs | null) => value?.toISOString()}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item
            name="discountPercent"
            label="Discount %"
            style={{ width: 120 }}
            rules={[
              { type: 'number', min: 0, max: 100, message: '0-100 only' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              precision={0}
            />
          </Form.Item>

          <Form.Item
            name="taxPercent"
            label="Tax %"
            style={{ width: 120 }}
            rules={[
              { type: 'number', min: 0, max: 100, message: '0-100 only' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              precision={0}
            />
          </Form.Item>
        </div>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={2} placeholder="Additional notes or terms..." />
        </Form.Item>
      </Form>

      <Divider style={{ margin: '16px 0 12px' }} />

      <div className="mb-4">
        <Text strong className="mr-2">
          Add Items:
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Select services or inventory to include in this quotation
        </Text>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Select
          placeholder="Add a service..."
          allowClear
          style={{ flex: 1 }}
          showSearch={{
            filterOption: false,
            onSearch: serviceOptions.onSearch,
          }}
          loading={serviceOptions.loading}
          onChange={(svcId: string) => {
            if (!svcId) return;
            const existingItem = selectedItems.find(
              (item) => item.id === svcId && item.type === 'service'
            );
            if (existingItem) {
              onItemQuantityChange(svcId, 'service', existingItem.quantity + 1);
            } else {
              const svc = serviceOptions.options.find((s) => s.id === svcId);
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
        />
        <Select
          placeholder="Add inventory..."
          allowClear
          style={{ flex: 1 }}
          showSearch={{
            filterOption: false,
            onSearch: inventoryOptions.onSearch,
          }}
          loading={inventoryOptions.loading}
          onChange={(invId: string) => {
            if (!invId) return;
            const existingItem = selectedItems.find(
              (item) => item.id === invId && item.type === 'inventory'
            );
            if (existingItem) {
              onItemQuantityChange(
                invId,
                'inventory',
                existingItem.quantity + 1
              );
            } else {
              const inv = inventoryOptions.options.find((i) => i.id === invId);
              if (inv) {
                onItemAdd({
                  id: inv.id,
                  type: 'inventory',
                  name: inv.name,
                  price: inv.price,
                  quantity: 1,
                });
              }
            }
          }}
          options={inventoryOptions.options.map((inv) => ({
            label: `${inv.name} - ${formatMoneyVND(inv.price)}`,
            value: inv.id,
          }))}
          onPopupScroll={(e) => {
            const target = e.target as HTMLDivElement;
            if (
              target.scrollTop + target.offsetHeight >=
              target.scrollHeight - 8
            ) {
              inventoryOptions.loadMore();
            }
          }}
        />
      </div>

      {selectedItems.length > 0 && (
        <Table
          dataSource={selectedItems}
          columns={itemColumns}
          rowKey={(record) => `${record.type}:${record.id}`}
          size="small"
          pagination={false}
          className="mb-4"
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text type="secondary">Subtotal</Text>
          <Text>{formatMoneyVND(subtotal)}</Text>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text type="secondary">Discount</Text>
          <Text type="success">
            -
            {formatMoneyVND(
              subtotal * ((form.getFieldValue('discountPercent') || 0) / 100)
            )}
          </Text>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text type="secondary">Tax</Text>
          <Text>
            {formatMoneyVND(
              (subtotal -
                subtotal *
                  ((form.getFieldValue('discountPercent') || 0) / 100)) *
                ((form.getFieldValue('taxPercent') || 0) / 100)
            )}
          </Text>
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={5} style={{ margin: 0 }}>
            Total
          </Title>
          <Title level={5} style={{ margin: 0, color: '#ec4899' }}>
            {formatMoneyVND(total)}
          </Title>
        </div>
      </div>
    </Modal>
  );
}
