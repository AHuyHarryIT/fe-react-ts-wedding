import { authApi } from '@services/AuthService';
import type { ChangePasswordRequest } from '@types';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage } from '@utils/error';
import { Button, Card, Col, Form, Input, Row, message } from 'antd';

export function StaffSettingsPage() {
  const [form] = Form.useForm<ChangePasswordRequest>();
  const [messageApi, contextHolder] = message.useMessage();

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (response) => {
      messageApi.success(response.message || 'Password changed successfully');
      form.resetFields();
    },
    onError: (error) => {
      messageApi.error(getErrorMessage(error) || 'Failed to change password');
    },
  });

  const handleSubmit = (values: ChangePasswordRequest) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <div className="staff-page">
      {contextHolder}
      <div className="staff-page-header">
        <div className="min-w-0">
          <div className="staff-kicker">Staff account</div>
          <h1 className="staff-title mt-4">Settings</h1>
          <p className="staff-subtitle mt-3">
            Keep your account secure by updating your login password regularly.
          </p>
        </div>
      </div>

      <Card className="staff-surface !border-0" style={{ maxWidth: 840 }}>
        <Form<ChangePasswordRequest>
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: 'Please input your current password!',
                  },
                ]}
              >
                <Input.Password placeholder="Enter current password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: 'Please input your new password!',
                  },
                  {
                    min: 6,
                    message: 'Password must be at least 6 characters!',
                  },
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your new password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Passwords do not match!')
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            loading={changePasswordMutation.isPending}
          >
            Update Password
          </Button>
        </Form>
      </Card>
    </div>
  );
}
