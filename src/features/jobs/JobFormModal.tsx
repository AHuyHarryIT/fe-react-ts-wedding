import type {
  CreateJobRequest,
  Job,
  JobFormData,
  UpdateJobRequest,
} from '@types';
import { Button, Form, Input, Modal, Space, Switch } from 'antd';
import type { FormInstance } from 'antd/es/form';

interface JobFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedJob: Job | null;
  form: FormInstance<JobFormData>;
  onCancel: () => void;
  onSubmit:
    | ((values: CreateJobRequest) => void)
    | ((values: UpdateJobRequest) => void);
}

export function JobFormModal({
  type,
  open,
  loading,
  selectedJob,
  form,
  onCancel,
  onSubmit,
}: JobFormModalProps) {
  return (
    <Modal
      title={type === 'create' ? 'Create Job' : 'Edit Job'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Job Name"
          name="name"
          rules={[
            { required: true, message: 'Please input the job name' },
            { max: 255, message: 'Job name cannot exceed 255 characters' },
          ]}
        >
          <Input placeholder="Enter job name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            {
              max: 1000,
              message: 'Description cannot exceed 1000 characters',
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe what this job is responsible for"
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          valuePropName="checked"
          initialValue={selectedJob?.isActive ?? true}
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

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
