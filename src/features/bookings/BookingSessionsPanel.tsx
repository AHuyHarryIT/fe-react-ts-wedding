import { useMutation } from '@tanstack/react-query';
import { bookingSessionApi } from '@services/BookingSessionService';
import { extractErrorMessage } from '@utils/error';
import type {
  BookingSession,
  BookingStatus,
  CreateBookingSessionRequest,
  UpdateBookingSessionRequest,
} from '@types';
import {
  App,
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

type BookingSessionFormValues = {
  title: string;
  locationName?: string;
  address?: string;
  startsAt: dayjs.Dayjs;
  endsAt: dayjs.Dayjs;
  status?: BookingStatus;
};

interface BookingSessionsPanelProps {
  bookingId: string;
  sessions?: BookingSession[];
  canManage: boolean;
  onChanged?: () => Promise<void> | void;
}

const statusColorMap: Record<BookingStatus, string> = {
  PENDING: 'orange',
  DEPOSIT_PAID: 'purple',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'gold',
};

const sessionStatusOptions: BookingStatus[] = [
  'PENDING',
  'DEPOSIT_PAID',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED',
];

const formatStatusLabel = (status?: BookingStatus) =>
  status ? status.replace(/_/g, ' ') : 'PENDING';

export function BookingSessionsPanel({
  bookingId,
  sessions,
  canManage,
  onChanged,
}: BookingSessionsPanelProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<BookingSessionFormValues>();
  const [editingSession, setEditingSession] = useState<BookingSession | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const orderedSessions = useMemo(
    () =>
      [...(sessions || [])].sort((a, b) =>
        String(a.startsAt || '').localeCompare(String(b.startsAt || ''))
      ),
    [sessions]
  );

  const createSessionMutation = useMutation({
    mutationFn: (data: CreateBookingSessionRequest) =>
      bookingSessionApi.create(data),
    onSuccess: () => {
      message.success('Booking session created successfully');
      closeModal();
      onChanged?.();
    },
    onError: (error) => {
      message.error(
        extractErrorMessage(error) || 'Failed to save booking session'
      );
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBookingSessionRequest;
    }) => bookingSessionApi.update(id, data),
    onSuccess: () => {
      message.success('Booking session updated successfully');
      closeModal();
      onChanged?.();
    },
    onError: (error) => {
      message.error(
        extractErrorMessage(error) || 'Failed to save booking session'
      );
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => bookingSessionApi.delete(id),
    onSuccess: () => {
      message.success('Booking session deleted successfully');
      onChanged?.();
    },
    onError: (error) => {
      message.error(
        extractErrorMessage(error) || 'Failed to delete booking session'
      );
    },
  });

  const openCreateModal = () => {
    setEditingSession(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'PENDING',
      startsAt: dayjs(),
      endsAt: dayjs().add(2, 'hour'),
    });
    setModalOpen(true);
  };

  const openEditModal = (session: BookingSession) => {
    setEditingSession(session);
    form.setFieldsValue({
      title: session.title,
      locationName: session.locationName || undefined,
      address: session.address || undefined,
      status: session.status || 'PENDING',
      startsAt: session.startsAt ? dayjs(session.startsAt) : dayjs(),
      endsAt: session.endsAt
        ? dayjs(session.endsAt)
        : session.startsAt
          ? dayjs(session.startsAt).add(2, 'hour')
          : dayjs().add(2, 'hour'),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSession(null);
    form.resetFields();
  };

  const handleSubmit = async (values: BookingSessionFormValues) => {
    const payload: CreateBookingSessionRequest | UpdateBookingSessionRequest = {
      ...(editingSession ? {} : { bookingId }),
      title: values.title.trim(),
      locationName: values.locationName?.trim() || undefined,
      address: values.address?.trim() || undefined,
      startsAt: values.startsAt.toISOString(),
      endsAt: values.endsAt.toISOString(),
      status: values.status || 'PENDING',
    };

    if (editingSession) {
      await updateSessionMutation.mutateAsync({
        id: editingSession.id,
        data: payload,
      });
    } else {
      await createSessionMutation.mutateAsync(
        payload as CreateBookingSessionRequest
      );
    }
  };

  const handleDelete = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
  };

  return (
    <>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Booking Sessions
            </Title>
            <Paragraph
              type="secondary"
              style={{ margin: '6px 0 0', maxWidth: 640 }}
            >
              Break a booking into operational sessions like prep, ceremony,
              reception, or edit delivery so the team can track the real work
              schedule.
            </Paragraph>
          </div>
          {canManage && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Add Session
            </Button>
          )}
        </div>

        {orderedSessions.length === 0 ? (
          <Card size="small">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No booking sessions yet"
            >
              {canManage && (
                <Button type="primary" onClick={openCreateModal}>
                  Create first session
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            {orderedSessions.map((session) => (
              <Card
                key={session.id}
                size="small"
                title={
                  <Space size="middle" wrap>
                    <Text strong>{session.title}</Text>
                    <Tag color={statusColorMap[session.status || 'PENDING']}>
                      {formatStatusLabel(session.status || 'PENDING')}
                    </Tag>
                  </Space>
                }
                extra={
                  canManage && (
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(session)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete session"
                        description="This will remove the session from the booking."
                        okText="Delete"
                        okButtonProps={{
                          danger: true,
                          loading: deleteSessionMutation.isPending,
                        }}
                        onConfirm={() => handleDelete(session.id)}
                      >
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          loading={deleteSessionMutation.isPending}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  )
                }
              >
                <Space
                  orientation="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Space wrap>
                    <Tag icon={<CalendarOutlined />} color="blue">
                      {session.startsAt
                        ? dayjs(session.startsAt).format('DD/MM/YYYY')
                        : 'No date'}
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />} color="cyan">
                      {session.startsAt
                        ? dayjs(session.startsAt).format('HH:mm')
                        : '--:--'}{' '}
                      -{' '}
                      {session.endsAt
                        ? dayjs(session.endsAt).format('HH:mm')
                        : '--:--'}
                    </Tag>
                    {session.locationName && (
                      <Tag icon={<EnvironmentOutlined />} color="geekblue">
                        {session.locationName}
                      </Tag>
                    )}
                  </Space>
                  {session.address && (
                    <Paragraph style={{ margin: 0 }}>
                      {session.address}
                    </Paragraph>
                  )}
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Space>

      <Modal
        title={
          editingSession ? 'Edit Booking Session' : 'Create Booking Session'
        }
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={
          createSessionMutation.isPending || updateSessionMutation.isPending
        }
        destroyOnHidden
        okText={editingSession ? 'Update Session' : 'Create Session'}
      >
        <Form<BookingSessionFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Session Title"
            name="title"
            rules={[
              { required: true, message: 'Session title is required' },
              {
                max: 255,
                message: 'Session title cannot exceed 255 characters',
              },
            ]}
          >
            <Input placeholder="Ceremony coverage" />
          </Form.Item>

          <Form.Item label="Location Name" name="locationName">
            <Input placeholder="Grand ballroom" />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <TextArea rows={3} placeholder="Venue address or meeting point" />
          </Form.Item>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            <Form.Item
              label="Start"
              name="startsAt"
              rules={[{ required: true, message: 'Start time is required' }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="End"
              name="endsAt"
              dependencies={['startsAt']}
              rules={[
                { required: true, message: 'End time is required' },
                ({ getFieldValue }) => ({
                  validator(_rule, _value: BookingSessionFormValues['endsAt']) {
                    const startsAt = getFieldValue(
                      'startsAt'
                    ) as BookingSessionFormValues['startsAt'];
                    const value = _value;
                    if (
                      !startsAt ||
                      !value ||
                      dayjs(value).isAfter(dayjs(startsAt))
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('End time must be after the start time')
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item label="Status" name="status">
            <Select
              options={sessionStatusOptions.map((status) => ({
                value: status,
                label: formatStatusLabel(status),
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
