import type { Album } from '@types';
import { Modal, Form, Input, Switch, DatePicker } from 'antd';
import { type FormInstance } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface AlbumFormData {
  ownerUserId?: string;
  title: string;
  description?: string;
  bookingId?: string;
  isPublic: boolean;
  expiresAt?: string;
}

interface AlbumFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedAlbum: Album | null;
  form: FormInstance<AlbumFormData>;
  onCancel: () => void;
  onSubmit: (values: AlbumFormData) => void;
}

export function AlbumFormModal({
  type,
  open,
  loading,
  selectedAlbum,
  form,
  onCancel,
  onSubmit,
}: AlbumFormModalProps) {
  const isEditMode = type === 'edit' && selectedAlbum;
  const title = isEditMode ? 'Edit Album' : 'Create New Album';

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="title"
          label="Album Title"
          rules={[
            { required: true, message: 'Please enter album title' },
            { max: 255, message: 'Title cannot exceed 255 characters' },
          ]}
        >
          <Input placeholder="e.g., Wedding Photos 2024" />
        </Form.Item>

        <Form.Item name="ownerUserId" label="Owner User ID (Optional)">
          <Input placeholder="Enter user ID" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={4}
            placeholder="Describe the album contents"
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item name="bookingId" label="Booking ID (Optional)">
          <Input placeholder="Link to booking" />
        </Form.Item>

        <Form.Item name="isPublic" label="Public Album" valuePropName="checked">
          <Switch checkedChildren="Public" unCheckedChildren="Private" />
        </Form.Item>

        <Form.Item name="expiresAt" label="Expiration Date (Optional)">
          <DatePicker
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Select expiration date"
            disabledDate={(current) => {
              return current && current < dayjs().startOf('day');
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
