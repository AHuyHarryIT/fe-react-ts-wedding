import { useState, useMemo } from 'react';
import { Alert, Card, Row, Col, Statistic, Table, Tag, DatePicker } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Line,
  Column,
  type LineConfig,
  type ColumnConfig,
} from '@ant-design/plots';
import { bookingApi } from '@services/BookingService';

const { RangePicker } = DatePicker;

const ANTD_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'blue',
  DEPOSIT_PAID: 'cyan',
  PENDING: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'purple',
  NO_SHOW: 'default',
};

interface BookingReportItem {
  id: string;
  eventDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  customer: { firstName?: string; lastName?: string } | null;
  services?: Array<{ serviceId: string; service?: { name?: string } }>;
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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports-bookings'],
    queryFn: () =>
      bookingApi.getAll({
        page: 1,
        limit: 100,
        includeCustomer: true,
        includeServices: true,
      }),
  });

  const allBookings: BookingReportItem[] = Array.isArray(data?.data)
    ? (data.data as BookingReportItem[])
    : [];

  const start = dateRange?.[0] ?? dayjs().subtract(29, 'day');
  const end = dateRange?.[1] ?? dayjs();

  const bookings = allBookings.filter((b: BookingReportItem) => {
    if (!dateRange) return true;
    const d = dayjs(b.eventDate);
    return (
      d.isAfter(dateRange[0].subtract(1, 'day')) &&
      d.isBefore(dateRange[1].add(1, 'day'))
    );
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

  const lineConfig: LineConfig = {
    data: revenueTrend,
    xField: 'label',
    yField: 'revenue',
    height: 300,
    smooth: true,
    point: { size: 3 },
    yAxis: { label: { formatter: (v: string) => formatVND(Number(v)) } },
    tooltip: {
      title: 'label',
      fields: ['revenue'],
      formatter: (datum: { label: string; revenue: number }) => ({
        name: 'Value',
        value: formatVND(datum.revenue),
      }),
    },
    animation: false,
  };

  const servicesConfig: ColumnConfig = {
    data: topServices,
    xField: 'name',
    yField: 'count',
    height: 300,
    seriesField: 'name',
    color: '#13c2c2',
    animation: false,
  };

  const hasDataOutsideSelectedRange =
    allBookings.length > 0 && bookings.length === 0;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Reports</h1>
      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Failed to load reports"
          description={
            error instanceof Error
              ? error.message
              : 'Please refresh the page and try again.'
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}
      {hasDataOutsideSelectedRange ? (
        <Alert
          type="info"
          showIcon
          message="No bookings in the selected date range"
          description="Try widening the date range to view available bookings."
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {/* ---- filters ---- */}
      <div
        style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <RangePicker
          value={dateRange}
          onChange={(v) => setDateRange(v as [Dayjs, Dayjs] | null)}
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
