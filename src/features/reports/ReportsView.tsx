import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  DatePicker,
  Select,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { bookingApi } from '@services/BookingService';

const { RangePicker } = DatePicker;

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'blue',
  PENDING: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
  NO_SHOW: 'default',
};

interface BookingReportItem {
  id: string;
  eventDate: string;
  status: string;
  totalPrice: number;
  customer: { firstName?: string; lastName?: string } | null;
}

export function ReportsView() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    [dayjs().startOf('month'), dayjs().endOf('month')]
  );
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading } = useQuery({
    queryKey: ['reports-bookings'],
    queryFn: () => bookingApi.getAll({ page: 1, limit: 1000 }),
  });

  const bookings: BookingReportItem[] = (data?.data?.data ?? [])
    .filter((b: BookingReportItem) => {
      if (!dateRange) return true;
      const d = dayjs(b.eventDate);
      return (
        d.isAfter(dateRange[0].subtract(1, 'day')) &&
        d.isBefore(dateRange[1].add(1, 'day'))
      );
    })
    .filter((b: BookingReportItem) => {
      if (!statusFilter || statusFilter === 'all') return true;
      return b.status === statusFilter;
    });

  const totalRevenue = bookings
    .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    .reduce((s, b) => s + b.totalPrice, 0);

  const pendingRevenue = bookings
    .filter((b) => b.status === 'PENDING')
    .reduce((s, b) => s + b.totalPrice, 0);

  const completedCount = bookings.filter(
    (b) => b.status === 'COMPLETED'
  ).length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const cancelledCount = bookings.filter(
    (b) => b.status === 'CANCELLED'
  ).length;

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_v: unknown, r: BookingReportItem) =>
        `${r.customer?.firstName ?? ''} ${r.customer?.lastName ?? ''}`,
    },
    {
      title: 'Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      render: (v: string) => dayjs(v).format('MMM DD'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={STATUS_COLORS[s] ?? 'default'}>{s}</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (v: number) => `${new Intl.NumberFormat('vi-VN').format(v)}₫`,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Reports</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix="₫"
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Pending Revenue"
              value={pendingRevenue}
              prefix="₫"
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedCount}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingCount}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic
              title="Cancelled"
              value={cancelledCount}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="Total Bookings" value={bookings.length} />
          </Card>
        </Col>
      </Row>

      <div
        style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}
      >
        <RangePicker
          value={dateRange}
          onChange={(v) => setDateRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
        />
        <Select
          style={{ width: 160 }}
          value={statusFilter ?? 'all'}
          onChange={setStatusFilter}
          options={[
            { label: 'All Status', value: 'all' },
            ...Object.keys(STATUS_COLORS).map((s) => ({ label: s, value: s })),
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 700 }}
      />
    </div>
  );
}
