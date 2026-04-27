import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ResetUserPasswordRequest } from '@types';
import { Button, Form, Input, Modal, Typography } from 'antd';
import type { FormInstance } from 'antd/es/form';

interface ResetPasswordModalProps {
  open: boolean;
  loading: boolean;
  staffId: string | null;
  form: FormInstance<ResetUserPasswordRequest>;
  onCancel: () => void;
  onSubmit: (values: ResetUserPasswordRequest) => void;
}

export function ResetPasswordModal({
  open,
  loading,
  staffId,
  form,
  onCancel,
  onSubmit,
}: ResetPasswordModalProps) {
  return (
    <Modal
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          Reset Staff Password
        </Typography.Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnHidden
      styles={{
        header: {
          margin: 0,
          padding: '24px 28px 0',
        },
        body: {
          padding: '18px 28px 28px',
        },
      }}
    >
      <Typography.Paragraph type="secondary">
        Set a new password for{' '}
        {staffId ? `staff account ${staffId}` : 'this staff account'}.
      </Typography.Paragraph>

      <Form<ResetUserPasswordRequest>
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onSubmit}
      >
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Please input new password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
        >
          <Input.Password
            placeholder="Enter new password"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm new password"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Reset Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
