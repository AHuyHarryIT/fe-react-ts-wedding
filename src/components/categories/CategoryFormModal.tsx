import type { Category } from '@/types';
import { Modal, Form, Input, Switch } from 'antd';
import { type FormInstance } from 'antd';

const { TextArea } = Input;

interface CategoryFormData {
  name: string;
  description?: string;
  isActive?: boolean;
}

interface CategoryFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedCategory: Category | null;
  form: FormInstance<CategoryFormData>;
  onCancel: () => void;
  onSubmit: (values: CategoryFormData) => void;
}

export function CategoryFormModal({
  type,
  open,
  loading,
  selectedCategory,
  form,
  onCancel,
  onSubmit,
}: CategoryFormModalProps) {
  const isEditMode = type === 'edit' && selectedCategory;
  const title = isEditMode ? 'Edit Category' : 'Create New Category';

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
          label="Category Name"
          rules={[
            { required: true, message: 'Please enter category name' },
            {
              max: 255,
              message: 'Category name cannot exceed 255 characters',
            },
          ]}
        >
          <Input placeholder="e.g., Flowers, Cakes, Decorations, etc." />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Describe the category" />
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
