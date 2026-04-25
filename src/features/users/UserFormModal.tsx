import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import type { CreateUserRequest, Job, Role, UpdateUserRequest } from '@types';
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Switch,
  Typography,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { VIETNAM_PHONE_REGEX } from '@utils/phone';

interface UserFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  form: FormInstance;
  roles?: Role[];
  jobs?: Job[];
  onCancel: () => void;
  onSubmit:
    | ((values: CreateUserRequest) => void)
    | ((values: UpdateUserRequest) => void);
}

export function UserFormModal({
  type,
  open,
  loading,
  form,
  roles = [],
  jobs = [],
  onCancel,
  onSubmit,
}: UserFormModalProps) {
  return (
    <Modal
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          {type === 'create' ? 'Create Staff Account' : 'Edit Staff Account'}
        </Typography.Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
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
      <Form
        form={form}
        layout="vertical"
        onFinish={(values: Record<string, never>) => {
          const typedValues = values as Record<string, string | string[]> & {
            confirmPassword?: string;
          };
          const payloadValues = { ...typedValues };
          delete payloadValues.confirmPassword;
          onSubmit(payloadValues as CreateUserRequest & UpdateUserRequest);
        }}
        autoComplete="off"
      >
        <Flex vertical gap={24}>
          <Flex vertical gap={16}>
            <Flex vertical gap={4}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {type === 'create' ? 'Access Setup' : 'Identity'}
              </Typography.Title>
              <Typography.Text type="secondary">
                {type === 'create'
                  ? 'Create the sign-in credentials and base identity for this staff account.'
                  : 'Update the core identity and access state for this staff account.'}
              </Typography.Text>
            </Flex>
            <Row gutter={[16, 0]}>
              {(type === 'create' || type === 'edit') && (
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Staff ID"
                    name="id"
                    rules={[
                      { required: true, message: 'Please input staff ID!' },
                    ]}
                  >
                    <Input placeholder="Enter staff ID" />
                  </Form.Item>
                </Col>
              )}

              {type === 'create' && (
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[
                      { required: true, message: 'Please input phone number!' },
                      {
                        pattern: VIETNAM_PHONE_REGEX,
                        message:
                          'Please input a valid Vietnamese phone number!',
                      },
                    ]}
                  >
                    <Input placeholder="Enter phone number (e.g. 0981234567)" />
                  </Form.Item>
                </Col>
              )}

              {type === 'edit' && (
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Status"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                    />
                  </Form.Item>
                </Col>
              )}

              {type === 'create' && (
                <>
                  <Col xs={24} md={12}>
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
                  </Col>
                  <Col xs={24} md={12}>
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
                            return Promise.reject(
                              new Error('Passwords do not match!')
                            );
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
                  </Col>
                </>
              )}
            </Row>
          </Flex>

          <Divider style={{ margin: 0 }} />

          <Flex vertical gap={16}>
            <Flex vertical gap={4}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Profile Details
              </Typography.Title>
              <Typography.Text type="secondary">
                Maintain the visible profile information used across the staff
                workspace.
              </Typography.Text>
            </Flex>
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    { required: true, message: 'Please input first name!' },
                  ]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    { required: true, message: 'Please input last name!' },
                  ]}
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { type: 'email', message: 'Please input valid email!' },
                  ]}
                >
                  <Input placeholder="Enter email" type="email" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Managed Jobs" name="jobIds">
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch={{ optionFilterProp: 'label' }}
                    maxTagCount="responsive"
                    placeholder="Select one or more jobs"
                    options={jobs.map((job) => ({
                      label: job.name,
                      value: job.id,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Flex>

          <Divider style={{ margin: 0 }} />

          <Flex vertical gap={16}>
            <Flex vertical gap={4}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Access Control
              </Typography.Title>
              <Typography.Text type="secondary">
                Choose the permissions group this staff account should receive.
              </Typography.Text>
            </Flex>
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item label="Roles" name="roleIds">
                  <Select
                    mode="multiple"
                    placeholder="Select roles"
                    options={roles.map((role) => ({
                      label: role.name,
                      value: role.id,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Flex>

          <Divider style={{ margin: 0 }} />

          <Flex justify="flex-end" gap={12}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {type === 'create' ? 'Create' : 'Update'}
            </Button>
          </Flex>
        </Flex>
      </Form>
    </Modal>
  );
}
