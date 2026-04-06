import {
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Switch,
} from 'antd';
import { type FormInstance } from 'antd';
import type { Job, Service, ServiceFormData } from '@types';
import { ImageUpload } from '@shared/components/ui';

const { TextArea } = Input;

interface ServiceFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedService: Service | null;
  jobs: Job[];
  jobsLoading?: boolean;
  form: FormInstance<ServiceFormData>;
  onCancel: () => void;
  onSubmit: (values: ServiceFormData) => void;
}

export function ServiceFormModal({
  type,
  open,
  loading,
  selectedService,
  jobs,
  jobsLoading = false,
  form,
  onCancel,
  onSubmit,
}: ServiceFormModalProps) {
  const isEditMode = type === 'edit' && selectedService;
  const title = isEditMode ? 'Edit Service' : 'Create New Service';

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      loading={loading}
      destroyOnHidden
    >
      <Form<ServiceFormData> form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Service Name"
          rules={[
            { required: true, message: 'Please enter service name' },
            {
              max: 255,
              message: 'Service name cannot exceed 255 characters',
            },
          ]}
        >
          <Input placeholder="e.g., Wedding Photography, Catering, etc." />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Describe the service" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price (VND)"
          rules={[{ type: 'number', min: 0 }]}
        >
          <InputNumber placeholder="0" step={1000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="jobId" label="Job">
          <Select
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            loading={jobsLoading}
            placeholder="Optional managed job for this service"
            options={jobs
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((job) => ({
                value: job.id,
                label: job.name,
              }))}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isLocation"
              label="Location"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isTime" label="Time" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <ImageUpload
          form={form}
          fieldName="image"
          label="Service Image"
          currentImageUrl={isEditMode ? selectedService?.imageUrl : undefined}
          maxCount={1}
          maxSizeMB={5}
        />
      </Form>
    </Modal>
  );
}
