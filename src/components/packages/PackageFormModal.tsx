import { Modal, Form, Input, InputNumber, Switch, Select } from 'antd';
import { type FormInstance } from 'antd';
import type { Package, Service } from '@types';

const { TextArea } = Input;

interface PackageFormData {
  name: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  serviceIds?: string[];
}

interface PackageFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedPackage: Package | null;
  form: FormInstance<PackageFormData>;
  services: Service[];
  onCancel: () => void;
  onSubmit: (values: PackageFormData) => void;
}

export function PackageFormModal({
  type,
  open,
  loading,
  selectedPackage,
  form,
  services,
  onCancel,
  onSubmit,
}: PackageFormModalProps) {
  const isEditMode = type === 'edit' && selectedPackage;
  const title = isEditMode ? 'Edit Package' : 'Create New Package';

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form<PackageFormData> form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Package Name"
          rules={[
            { required: true, message: 'Please enter package name' },
            {
              max: 255,
              message: 'Package name cannot exceed 255 characters',
            },
          ]}
        >
          <Input placeholder="e.g., Premium Wedding Package, Silver Package, etc." />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={4}
            placeholder="Describe what's included in this package"
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price ($)"
          rules={[{ type: 'number', min: 0 }]}
        >
          <InputNumber
            placeholder="0.00"
            precision={2}
            step={0.01}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="serviceIds"
          label="Services"
          rules={[
            {
              required: true,
              message: 'Please select at least one service',
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select services to include in this package"
            showSearch={{ optionFilterProp: 'label' }}
            options={services.map((service) => ({
              label: service.name,
              value: service.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
