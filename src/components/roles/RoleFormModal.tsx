import { Modal, Form, Input } from 'antd';
import { type FormInstance } from 'antd';
import { type Role } from '@lib';

const { TextArea } = Input;

interface RoleFormData {
  name: string;
  description?: string;
}

interface RoleFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedRole: Role | null;
  form: FormInstance<RoleFormData>;
  onCancel: () => void;
  onSubmit: (values: RoleFormData) => void;
}

export function RoleFormModal({
  type,
  open,
  loading,
  selectedRole,
  form,
  onCancel,
  onSubmit,
}: RoleFormModalProps) {
  const isEditMode = type === 'edit' && selectedRole;
  const title = isEditMode ? 'Edit Role' : 'Create New Role';

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
          label="Role Name"
          rules={[
            { required: true, message: 'Please enter role name' },
            { max: 255, message: 'Role name cannot exceed 255 characters' },
          ]}
        >
          <Input placeholder="e.g., Admin, Manager, User" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Describe the purpose of this role" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
