import { useState } from 'react';
import { Table, Tag, Button, Space, Select, Input } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { bookingApi } from '@services/BookingService';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'blue',
  PENDING: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'default',
  NO_SHOW: 'red',
};

interface BookingCalendarItem {
  id: string;
  eventDate: string;
  status: string;
  totalPrice: number;
  customer: { firstName?: string; lastName?: string } | null;
}

export function CalendarView() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'day' | 'week'>('list');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [search, setSearch] = useState('');

  const start =
    view === 'day'
      ? currentDate.startOf('day')
      : view === 'week'
        ? currentDate.startOf('week')
        : currentDate.startOf('month');

  const end =
    view === 'day'
      ? currentDate.endOf('day')
      : view === 'week'
        ? currentDate.endOf('week')
        : currentDate.endOf('month');

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'calendar', start.toISOString(), end.toISOString()],
    queryFn: () =>
      bookingApi.getAll({
        page: 1,
        limit: 500,
      }),
  });

  const bookings: BookingCalendarItem[] = (
    (data?.data ?? []) as BookingCalendarItem[]
  )
    .filter((b) => {
      const d = dayjs(b.eventDate);
      return d.isSameOrAfter(start, 'day') && d.isSameOrBefore(end, 'day');
    })
    .filter((b) => {
      if (!search) return true;
      const fn = b.customer?.firstName?.toLowerCase() ?? '';
      const ln = b.customer?.lastName?.toLowerCase() ?? '';
      return (
        fn.includes(search.toLowerCase()) || ln.includes(search.toLowerCase())
      );
    });

  const columns = [
    {
      title: 'Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      width: 120,
      render: (val: string) => dayjs(val).format('MMM DD'),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_v: unknown, record: BookingCalendarItem) =>
        `${record.customer?.firstName ?? ''} ${record.customer?.lastName ?? ''}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] ?? 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 160,
      render: (val: number) => `${new Intl.NumberFormat('vi-VN').format(val)}₫`,
    },
  ];

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <h1 className="staff-title">Calendar</h1>
        <Space>
          <Input
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            value={view}
            onChange={setView}
            style={{ width: 120 }}
            options={[
              { label: 'List', value: 'list' },
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
            ]}
          />
          <Button
            icon={<LeftOutlined />}
            onClick={() => {
              if (view === 'day') setCurrentDate((d) => d.subtract(1, 'day'));
              else if (view === 'week')
                setCurrentDate((d) => d.subtract(1, 'week'));
              else setCurrentDate((d) => d.subtract(1, 'month'));
            }}
          />
          <span style={{ minWidth: 140, textAlign: 'center' }}>
            {view === 'day'
              ? currentDate.format('MMM DD, YYYY')
              : view === 'week'
                ? `${currentDate.startOf('week').format('MMM DD')} – ${currentDate.endOf('week').format('MMM DD')}`
                : currentDate.format('MMMM YYYY')}
          </span>
          <Button
            icon={<RightOutlined />}
            onClick={() => {
              if (view === 'day') setCurrentDate((d) => d.add(1, 'day'));
              else if (view === 'week') setCurrentDate((d) => d.add(1, 'week'));
              else setCurrentDate((d) => d.add(1, 'month'));
            }}
          />
        </Space>
      </div>

      <div className="staff-surface p-4 md:p-6">
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            total: bookings.length,
          }}
          onRow={() => ({ onClick: () => navigate({ to: '/bookings' }) })}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}
