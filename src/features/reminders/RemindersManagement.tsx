import dayjs from 'dayjs';
import { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  message,
  Typography,
} from 'antd';
import {
  BellOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  useRemindersQuery,
  useCreateReminder,
  useDeleteReminder,
  useMarkReadAll,
} from './hooks/useReminderManagement';
import type { Reminder } from '@/types/reminders';
const REMINDER_TYPE_COLORS: Record<string, string> = {
  BOOKING_REMINDER: 'blue',
  PAYMENT_REMINDER: 'orange',
  RENTAL_RETURN: 'purple',
  LOW_STOCK: 'red',
  CUSTOM: 'default',
};

const REMINDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'default',
  TRIGGERED: 'processing',
  COMPLETED: 'green',
  CANCELLED: 'default',
};

export function RemindersManagement() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    type: undefined,
    status: undefined,
  });

  const { data, isLoading } = useRemindersQuery(query);
  const createMutation = useCreateReminder();
  const deleteMutation = useDeleteReminder();
  const markAllReadMutation = useMarkReadAll();
  // const { data: notificationsData } = // useNotificationsQuery() removed

  const handleTableChange = (pagination: {
    current?: number;
    pageSize?: number;
  }) => {
    setQuery((prev) => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  const handleCreate = (values: Record<string, unknown>) => {
    createMutation.mutate(
      {
        type: values.type as string,
        title: (values.title as string) || '',
        message: (values.message as string) || '',
        scheduledAt: (values.scheduledAt as dayjs.Dayjs).toISOString(),
      },
      {
        onSuccess: () => {
          message.success('Reminder created');
          setCreateModalOpen(false);
          form.resetFields();
        },
        onError: () => message.error('Failed to create reminder'),
      }
    );
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Reminder',
      content: 'Are you sure you want to delete this reminder?',
      onOk: () => {
        deleteMutation.mutate(id, {
          onSuccess: () => message.success('Reminder deleted'),
          onError: () => message.error('Failed to delete reminder'),
        });
      },
    });
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={REMINDER_TYPE_COLORS[type] || 'default'}>
          {type.replace(/_/g, ' ')}
        </Tag>
      ),
      width: 180,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={REMINDER_STATUS_COLORS[status] || 'default'}>{status}</Tag>
      ),
      width: 120,
    },
    {
      title: 'Scheduled',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
      width: 180,
    },
    {
      title: 'Notifications',
      key: 'notifications',
      render: (_: unknown, record: Reminder) => (
        <Space>
          <BellOutlined />
          {record._count?.notifications || 0}
        </Space>
      ),
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Reminder) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography.Title level={2} className="!mb-0">
          Reminders
        </Typography.Title>
        <Space>
          <Button onClick={() => markAllReadMutation.mutate()}>
            Mark All Read
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            New Reminder
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total: data?.pagination?.total ?? data?.meta?.total ?? 0,
          showSizeChanger: true,
        }}
      />

      {/* Create Reminder Modal */}
      <Modal
        title="Create Reminder"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="BOOKING_REMINDER">
                Booking Reminder
              </Select.Option>
              <Select.Option value="PAYMENT_REMINDER">
                Payment Reminder
              </Select.Option>
              <Select.Option value="RENTAL_RETURN">Rental Return</Select.Option>
              <Select.Option value="LOW_STOCK">Low Stock Alert</Select.Option>
              <Select.Option value="CUSTOM">Custom</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="scheduledAt"
            label="Scheduled At"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
