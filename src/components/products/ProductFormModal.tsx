import type { Category, Product } from '@types';
import { Modal, Form, Input, InputNumber, Switch, Select } from 'antd';
import { type FormInstance } from 'antd';

const { TextArea } = Input;

interface ProductFormData {
  name: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
}

interface ProductFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedProduct: Product | null;
  form: FormInstance<ProductFormData>;
  categories: Category[];
  onCancel: () => void;
  onSubmit: (values: ProductFormData) => void;
}

export function ProductFormModal({
  type,
  open,
  loading,
  selectedProduct,
  form,
  categories,
  onCancel,
  onSubmit,
}: ProductFormModalProps) {
  const isEditMode = type === 'edit' && selectedProduct;
  const title = isEditMode ? 'Edit Product' : 'Create New Product';

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Product Name"
          rules={[
            { required: true, message: 'Please enter product name' },
            {
              max: 255,
              message: 'Product name cannot exceed 255 characters',
            },
          ]}
        >
          <Input placeholder="e.g., Wedding Cake, Flowers, etc." />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Describe the product" />
        </Form.Item>

        <Form.Item name="categoryId" label="Category">
          <Select
            placeholder="Select a category"
            allowClear
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price ($)"
          rules={[{ type: 'number', min: 0 }]}
          initialValue={0}
        >
          <InputNumber
            placeholder="0.00"
            min={0}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="stockQty"
          label="Stock Quantity"
          rules={[{ type: 'number', min: 0 }]}
          initialValue={0}
        >
          <InputNumber placeholder="0" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
          initialValue={!isEditMode}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
