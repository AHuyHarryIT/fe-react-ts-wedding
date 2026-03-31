import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import type {
  CreateUserRequest,
  Role,
  UpdateUserRequest,
  UserWithRoles,
} from '@types';
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
} from 'antd';
import type { FormInstance } from 'antd/es/form';

interface UserFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedUser: UserWithRoles | null;
  form: FormInstance;
  roles?: Role[];
  onCancel: () => void;
  onSubmit:
    | ((values: CreateUserRequest) => void)
    | ((values: UpdateUserRequest) => void);
  rolesLoading?: boolean;
  // Only for create modal
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onRoleScrollEnd?: () => void;
}

export function UserFormModal({
  type,
  open,
  loading,
  // selectedUser,
  form,
  roles = [],
  onCancel,
  onSubmit,
  // rolesLoading,
  isFetchingNextPage,
  hasNextPage,
  onRoleScrollEnd,
}: UserFormModalProps) {
  return (
    <Modal
      title={type === 'create' ? 'Create Staff Account' : 'Edit Staff Account'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
      >
        {type === 'create' && (
          <>
            <Form.Item label="Staff ID" name="id">
              <Input placeholder="Leave blank to auto-generate staff ID" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Please input phone number!' },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Please input a valid phone number!',
                },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input password!' },
                {
                  min: 6,
                  message: 'Password must be at least 6 characters!',
                },
              ]}
            >
              <Input.Password
                placeholder="Enter password"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm password"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Divider />
          </>
        )}

        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: 'Please input first name!' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: 'Please input last name!' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please input valid email!' },
          ]}
        >
          <Input placeholder="Enter email" type="email" />
        </Form.Item>

        {type === 'edit' && (
          <Form.Item label="Staff ID" name="id">
            <Input placeholder="Enter staff ID" />
          </Form.Item>
        )}

        {type === 'create' && (
          <Form.Item
            label="Roles"
            name="roleIds"
            rules={[
              { required: true, message: 'Please select at least one role!' },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select roles"
              loading={isFetchingNextPage}
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {onRoleScrollEnd && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: 8,
                      }}
                    >
                      <Button
                        onClick={onRoleScrollEnd}
                        loading={isFetchingNextPage}
                        disabled={!hasNextPage}
                        style={{ width: '100%' }}
                        type="dashed"
                      >
                        {hasNextPage ? 'Show more' : 'No more roles'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            />
          </Form.Item>
        )}

        {type === 'edit' && (
          <Form.Item label="Status" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        )}

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {type === 'create' ? 'Create' : 'Update'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
