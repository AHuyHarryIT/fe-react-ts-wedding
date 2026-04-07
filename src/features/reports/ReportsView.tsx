import { useState, useMemo } from 'react';
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
import dayjs, { type Dayjs } from 'dayjs';
import { Line, Column, Pie } from '@ant-design/plots';
import { bookingApi } from '@services/BookingService';

const { RangePicker } = DatePicker;

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#1890ff',
  DEPOSIT_PAID: '#13c2c2',
  PENDING: '#faad14',
  COMPLETED: '#52c41a',
  CANCELLED: '#f5222d',
  RESCHEDULED: '#722ed1',
  NO_SHOW: '#d9d9d9',
};

const ANTD_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'blue',
  DEPOSIT_PAID: 'cyan',
  PENDING: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'purple',
  NO_SHOW: 'default',
};

const PIE_COLORS = [
  '#52c41a',
  '#1890ff',
  '#faad14',
  '#13c2c2',
  '#f5222d',
  '#722ed1',
];

interface BookingReportItem {
  id: string;
  eventDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  customer: { firstName?: string; lastName?: string } | null;
  services?: Array<{ serviceId: string; service?: { name?: string } }>;
  staffs?: Array<{
    staffId: string;
    staff?: { firstName?: string; lastName?: string };
  }>;
}

/* ---------- chart data helpers ---------- */

function buildRevenueTrend(
  bookings: BookingReportItem[],
  start: Dayjs,
  end: Dayjs
) {
  const dayMap = new Map<string, number>();
  for (
    let d = start;
    d.isBefore(end) || d.isSame(end, 'day');
    d = d.add(1, 'day')
  ) {
    dayMap.set(d.format('YYYY-MM-DD'), 0);
  }
  for (const b of bookings) {
    const key = dayjs(b.eventDate).format('YYYY-MM-DD');
    if (
      dayMap.has(key) &&
      (b.status === 'COMPLETED' || b.status === 'CONFIRMED')
    ) {
      dayMap.set(key, (dayMap.get(key) ?? 0) + b.totalPrice);
    }
  }
  return Array.from(dayMap.entries()).map(([date, revenue]) => ({
    date,
    label: dayjs(date).format('MMM DD'),
    revenue,
  }));
}

function buildStatusPie(bookings: BookingReportItem[]) {
  const countMap = new Map<string, number>();
  for (const b of bookings) {
    countMap.set(b.status, (countMap.get(b.status) ?? 0) + 1);
  }
  return Array.from(countMap.entries())
    .map(([type, value]) => ({ type, value }))
    .sort((a, b) => b.value - a.value);
}

function buildStaffWorkload(bookings: BookingReportItem[]) {
  const staffMap = new Map<string, { name: string; count: number }>();
  for (const b of bookings) {
    for (const s of b.staffs ?? []) {
      const staff = s.staff;
      const key = s.staffId;
      if (!staffMap.has(key)) {
        staffMap.set(key, {
          name: `${staff?.firstName ?? 'Unknown'} ${staff?.lastName ?? ''}`.trim(),
          count: 0,
        });
      }
      staffMap.get(key)!.count++;
    }
  }
  return Array.from(staffMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function buildTopServices(bookings: BookingReportItem[]) {
  const svcMap = new Map<string, { name: string; count: number }>();
  for (const b of bookings) {
    for (const s of b.services ?? []) {
      const key = s.serviceId;
      if (!svcMap.has(key)) {
        svcMap.set(key, { name: s.service?.name ?? s.serviceId, count: 0 });
      }
      svcMap.get(key)!.count++;
    }
  }
  return Array.from(svcMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

const formatVND = (v: number) => `${new Intl.NumberFormat('vi-VN').format(v)}₫`;

export function ReportsView() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(29, 'day').startOf('day'),
    dayjs().endOf('day'),
  ]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading } = useQuery({
    queryKey: ['reports-bookings'],
    queryFn: () => bookingApi.getAll({ page: 1, limit: 1000 }),
  });

  const allBookings: BookingReportItem[] = data?.data?.data ?? [];

  const start = dateRange?.[0] ?? dayjs().subtract(29, 'day');
  const end = dateRange?.[1] ?? dayjs();

  const bookings = allBookings
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
    .filter((b) => b.status === 'PENDING' || b.status === 'DEPOSIT_PAID')
    .reduce((s, b) => s + b.totalPrice, 0);

  const completedCount = bookings.filter(
    (b) => b.status === 'COMPLETED'
  ).length;
  const pendingCount = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'DEPOSIT_PAID'
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === 'CANCELLED'
  ).length;

  const revenueTrend = useMemo(
    () => buildRevenueTrend(bookings, start, end),
    [bookings, start, end]
  );
  const statusPie = useMemo(() => buildStatusPie(bookings), [bookings]);
  const staffWorkload = useMemo(() => buildStaffWorkload(bookings), [bookings]);
  const topServices = useMemo(() => buildTopServices(bookings), [bookings]);

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
        <Tag color={ANTD_STATUS_COLORS[s] ?? 'default'}>{s}</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (v: number) => formatVND(v),
    },
  ];

  const lineConfig = {
    data: revenueTrend,
    xField: 'label',
    yField: 'revenue',
    height: 300,
    smooth: true,
    point: { size: 3 },
    yAxis: { label: { formatter: (v: string) => formatVND(Number(v)) } },
    tooltip: {
      formatter: (datum: { label: string; revenue: number }) => ({
        name: 'Revenue',
        value: formatVND(datum.revenue),
      }),
    },
    animation: false,
  };

  const pieConfig = {
    data: statusPie,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    height: 300,
    label: { text: 'type', style: { fontWeight: 'bold' } },
    color: PIE_COLORS,
    legend: { position: 'bottom' as const },
    tooltip: {
      formatter: (datum: { type: string; value: number }) => ({
        name: datum.type,
        value: String(datum.value),
      }),
    },
    animation: false,
  };

  const staffConfig = {
    data: staffWorkload,
    xField: 'count',
    yField: 'name',
    height: 300,
    seriesField: 'name',
    color: '#722ed1',
    label: { position: 'right' as const },
    animation: false,
  };

  const servicesConfig = {
    data: topServices,
    xField: 'name',
    yField: 'count',
    height: 300,
    seriesField: 'name',
    color: '#13c2c2',
    label: { position: 'top' as const },
    animation: false,
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Reports</h1>

      {/* ---- filters ---- */}
      <div
        style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <RangePicker
          value={dateRange}
          onChange={(v) => setDateRange(v as [Dayjs, Dayjs] | null)}
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

      {/* ---- summary cards ---- */}
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
              valueStyle={{ color: '#1890ff' }}
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

      {/* ---- CHARTS ---- */}

      {/* 1. Revenue Trend Line Chart */}
      <Card title="Revenue Trend" style={{ marginBottom: 24 }}>
        {revenueTrend.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
            No revenue data in selected range
          </div>
        ) : (
          <Line {...lineConfig} />
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 2. Bookings by Status — Donut Chart */}
        <Col xs={24} md={12}>
          <Card title="Bookings by Status" style={{ height: '100%' }}>
            {statusPie.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                No data in selected range
              </div>
            ) : (
              <Pie {...pieConfig} />
            )}
          </Card>
        </Col>

        {/* 3. Staff Workload — Horizontal Bar Chart */}
        <Col xs={24} md={12}>
          <Card title="Staff Workload" style={{ height: '100%' }}>
            {staffWorkload.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                No staff assignments in selected range
              </div>
            ) : (
              <Column {...staffConfig} />
            )}
          </Card>
        </Col>
      </Row>

      {/* 4. Top Services — Bar Chart */}
      <Card title="Top Services" style={{ marginBottom: 24 }}>
        {topServices.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
            No service data in selected range
          </div>
        ) : (
          <Column {...servicesConfig} />
        )}
      </Card>

      {/* ---- bookings table ---- */}
      <Card title="Booking Details" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
}
