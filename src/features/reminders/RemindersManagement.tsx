import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
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
  Descriptions,
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
import {
  ReminderStatus,
  ReminderType,
  type Reminder,
  type ReminderQueryDto,
} from '@/types/reminders';
import {
  ManagementHeader,
  ManagementLayout,
} from '@shared/components/management';
import { ActionButton } from '@shared/components/ui';

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

const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  [ReminderType.BOOKING_REMINDER]: 'Booking Reminder',
  [ReminderType.PAYMENT_REMINDER]: 'Payment Reminder',
  [ReminderType.RENTAL_RETURN]: 'Rental Return',
  [ReminderType.LOW_STOCK]: 'Low Stock Alert',
  [ReminderType.CUSTOM]: 'Custom',
};

const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  [ReminderStatus.PENDING]: 'Pending',
  [ReminderStatus.TRIGGERED]: 'Triggered',
  [ReminderStatus.COMPLETED]: 'Completed',
  [ReminderStatus.CANCELLED]: 'Cancelled',
};

const TYPE_OPTIONS = Object.values(ReminderType).map((value) => ({
  label: REMINDER_TYPE_LABELS[value],
  value,
}));

const STATUS_OPTIONS = Object.values(ReminderStatus).map((value) => ({
  label: REMINDER_STATUS_LABELS[value],
  value,
}));

const INITIAL_QUERY: ReminderQueryDto = {
  page: 1,
  limit: 10,
};

export function RemindersManagement() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [form] = Form.useForm();

  const [query, setQuery] = useState<ReminderQueryDto>(INITIAL_QUERY);

  const { data, isLoading } = useRemindersQuery(query);
  const createMutation = useCreateReminder();
  const deleteMutation = useDeleteReminder();
  const markAllReadMutation = useMarkReadAll();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query.type) count += 1;
    if (query.status) count += 1;
    return count;
  }, [query.status, query.type]);

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
        type: values.type as ReminderType,
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
        onError: () => {
          message.error('Failed to create reminder');
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Reminder',
      content: 'Are you sure you want to delete this reminder?',
      onOk: () => {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            message.success('Reminder deleted');
            if (selectedReminder?.id === id) {
              setSelectedReminder(null);
              setViewModalOpen(false);
            }
          },
          onError: () => {
            message.error('Failed to delete reminder');
          },
        });
      },
    });
  };

  const openViewReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setViewModalOpen(true);
  };

  const handleTypeFilterChange = (value?: ReminderType) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      type: value,
    }));
  };

  const handleStatusFilterChange = (value?: ReminderStatus) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: value,
    }));
  };

  const clearFilters = () => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      type: undefined,
      status: undefined,
    }));
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: ReminderType) => (
        <Tag color={REMINDER_TYPE_COLORS[type] || 'default'}>
          {REMINDER_TYPE_LABELS[type]}
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
      render: (status: ReminderStatus) => (
        <Tag color={REMINDER_STATUS_COLORS[status] || 'default'}>
          {REMINDER_STATUS_LABELS[status]}
        </Tag>
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
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openViewReminder(record)}
          />
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
    <>
      <ManagementLayout
        header={
          <ManagementHeader
            title="Reminders"
            subtitle="Track scheduled reminders and notification delivery for staff operations"
            showCreateButton={false}
            extra={
              <Space>
                <Button
                  onClick={() => markAllReadMutation.mutate()}
                  loading={markAllReadMutation.isPending}
                >
                  Mark All Read
                </Button>
                <ActionButton
                  action="create"
                  label="New Reminder"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalOpen(true)}
                />
              </Space>
            }
          />
        }
        searchBar={
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <Select
              allowClear
              style={{ minWidth: 220 }}
              placeholder="Filter by reminder type"
              options={TYPE_OPTIONS}
              value={query.type}
              onChange={handleTypeFilterChange}
            />
            <Select
              allowClear
              style={{ minWidth: 220 }}
              placeholder="Filter by status"
              options={STATUS_OPTIONS}
              value={query.status}
              onChange={handleStatusFilterChange}
            />
            <Button onClick={clearFilters} disabled={activeFilterCount === 0}>
              Clear filters
            </Button>
            <Typography.Text type="secondary" style={{ marginLeft: 'auto' }}>
              {activeFilterCount > 0
                ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`
                : 'No active filters'}
            </Typography.Text>
          </div>
        }
        table={
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
        }
      />

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
            <Select options={TYPE_OPTIONS} />
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

      <Modal
        title="Reminder Detail"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="delete"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (selectedReminder) {
                handleDelete(selectedReminder.id);
              }
            }}
            disabled={!selectedReminder}
          >
            Delete
          </Button>,
        ]}
      >
        {selectedReminder ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Type">
              <Tag
                color={REMINDER_TYPE_COLORS[selectedReminder.type] || 'default'}
              >
                {REMINDER_TYPE_LABELS[selectedReminder.type]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  REMINDER_STATUS_COLORS[selectedReminder.status] || 'default'
                }
              >
                {REMINDER_STATUS_LABELS[selectedReminder.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {selectedReminder.title}
            </Descriptions.Item>
            <Descriptions.Item label="Message">
              {selectedReminder.message}
            </Descriptions.Item>
            <Descriptions.Item label="Scheduled At">
              {dayjs(selectedReminder.scheduledAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Triggered At">
              {selectedReminder.triggeredAt
                ? dayjs(selectedReminder.triggeredAt).format('YYYY-MM-DD HH:mm')
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Linked Booking">
              {selectedReminder.bookingId || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Linked Customer">
              {selectedReminder.customerId || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Notifications">
              {selectedReminder._count?.notifications ?? 0}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">
            No reminder selected.
          </Typography.Text>
        )}
      </Modal>
    </>
  );
}
