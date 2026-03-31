import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import type {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from '@types';
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Switch,
} from 'antd';
import dayjs from 'dayjs';
import type { FormInstance } from 'antd/es/form';

interface CustomerFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedCustomer: Customer | null;
  form: FormInstance;
  onCancel: () => void;
  onSubmit:
    | ((values: CreateCustomerRequest) => void)
    | ((values: UpdateCustomerRequest) => void);
}

export function CustomerFormModal({
  type,
  open,
  loading,
  selectedCustomer,
  form,
  onCancel,
  onSubmit,
}: CustomerFormModalProps) {
  return (
    <Modal
      title={
        type === 'create' ? 'Create Customer Account' : 'Edit Customer Account'
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={680}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          const payload = {
            ...values,
            weddingDate: values.weddingDate
              ? dayjs(values.weddingDate).toISOString()
              : values.weddingDate === null
                ? null
                : undefined,
          };
          onSubmit(payload);
        }}
        autoComplete="off"
      >
        {type === 'create' && (
          <>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Please input phone number' },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Please input a valid phone number',
                },
              ]}
            >
              <Input placeholder="Enter customer phone number" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input password' },
                {
                  min: 6,
                  message: 'Password must be at least 6 characters',
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
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
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

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: 'Please input first name' }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: 'Please input last name' }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input email' },
            { type: 'email', message: 'Please input a valid email' },
          ]}
        >
          <Input placeholder="Enter email" type="email" />
        </Form.Item>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item label="Wedding Date" name="weddingDate">
            <DatePicker
              className="!w-full"
              placeholder="Select wedding date"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item label="Wedding Venue" name="weddingVenue">
            <Input placeholder="Enter wedding venue" />
          </Form.Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label="Email Notifications"
            name="emailNotifications"
            valuePropName="checked"
            initialValue={selectedCustomer?.emailNotifications ?? true}
          >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>

          <Form.Item
            label="SMS Notifications"
            name="smsNotifications"
            valuePropName="checked"
            initialValue={selectedCustomer?.smsNotifications ?? true}
          >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label="Marketing Emails"
            name="marketingEmails"
            valuePropName="checked"
            initialValue={selectedCustomer?.marketingEmails ?? false}
          >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>

          <Form.Item label="Status" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </div>

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
