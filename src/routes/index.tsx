import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarOutlined,
  CameraOutlined,
  DollarOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DashboardActivityItem } from '@features/dashboard/components/DashboardActivityItem';
import { DashboardHeader } from '@features/dashboard/components/DashboardHeader';
import { DashboardQueueItem } from '@features/dashboard/components/DashboardQueueItem';
import { DashboardSectionTitle } from '@features/dashboard/components/DashboardSectionTitle';
import { AdminLayout } from '@shared/components/AdminLayout';
import { StatCard } from '@shared/components/ui/StatCard';
import { useTheme } from '@hooks';
import { useAuthStore } from '@stores/authStore';
import { requireStaffAuth } from '@utils/authGuard';
import { bookingApi } from '@services/BookingService';
import { ordersService } from '@services/OrdersService';
import type { Booking, BookingStatus } from '@types';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Typography,
} from 'antd';

const { Text, Title } = Typography;

const PENDING_BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'DEPOSIT_PAID'];
const INACTIVE_BOOKING_STATUSES: BookingStatus[] = ['CANCELLED', 'COMPLETED'];
const PENDING_ORDER_STATUSES = new Set(['UNPAID', 'PARTIAL']);

const isFutureDate = (value: string) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time > Date.now();
};

const getCustomerName = (booking: Booking) => {
  const firstName = booking.customer?.firstName || '';
  const lastName = booking.customer?.lastName || '';
  const fullName = `${lastName} ${firstName}`.trim();
  return fullName || 'Unknown customer';
};

const getBookingStatusTone = (
  status: BookingStatus
): 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'slate' => {
  if (status === 'PENDING') {
    return 'orange';
  }

  if (status === 'DEPOSIT_PAID') {
    return 'blue';
  }

  if (status === 'CONFIRMED') {
    return 'purple';
  }

  if (status === 'COMPLETED') {
    return 'green';
  }

  if (status === 'CANCELLED') {
    return 'red';
  }

  return 'slate';
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (value: string) => {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return 'just now';
  }

  const diff = Date.now() - timestamp;
  const absMinutes = Math.floor(Math.abs(diff) / 60000);

  if (absMinutes < 1) {
    return 'just now';
  }

  if (absMinutes < 60) {
    return diff >= 0 ? `${absMinutes} min ago` : `in ${absMinutes} min`;
  }

  const absHours = Math.floor(absMinutes / 60);

  if (absHours < 24) {
    return diff >= 0 ? `${absHours}h ago` : `in ${absHours}h`;
  }

  const absDays = Math.floor(absHours / 24);
  return diff >= 0 ? `${absDays}d ago` : `in ${absDays}d`;
};

const getMutedTextStyle = (darkMode: boolean) => ({
  color: darkMode ? '#94a3b8' : '#64748b',
});

const getProfileTitleStyle = (darkMode: boolean) => ({
  color: darkMode ? '#f9fafb' : '#111827',
});

const getErrorAlertStyle = {
  marginBottom: 20,
};

const getKpiLinkClass =
  'group block w-full transition-transform duration-200 hover:-translate-y-0.5';

const sectionRowClass = 'mt-6 lg:mt-7';
const cardBaseClass = 'staff-surface staff-panel !border-0';
const profileCardClass = 'staff-surface staff-panel !border-0 opacity-85';
const panelBodyClass = 'flex flex-col gap-3';
const quickActionsGridClass = 'grid gap-3 md:grid-cols-2 xl:grid-cols-4';
const activityContainerClass = 'flex w-full flex-col gap-3.5';
const actionButtonClass = '!h-11 !w-full !rounded-2xl';
const actionButtonPrimaryClass = `${actionButtonClass} !border-none`;
const sectionLabelClass =
  'mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400';

function Dashboard() {
  const { darkMode } = useTheme();
  const { user } = useAuthStore();

  const {
    data: bookings = [],
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    error: bookingsError,
  } = useQuery({
    queryKey: ['dashboard-bookings'],
    queryFn: async () => {
      const response = await bookingApi.getAll({
        page: 1,
        limit: 100,
        includeCustomer: true,
        includeServices: true,
      });

      return response.data || [];
    },
  });

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () => {
      const response = await ordersService.getOrders({ page: 1, limit: 100 });
      return response.data || [];
    },
  });

  const isLoading = isBookingsLoading || isOrdersLoading;
  const hasError = isBookingsError || isOrdersError;
  const errorMessage =
    (bookingsError as Error | undefined)?.message ||
    (ordersError as Error | undefined)?.message ||
    'Unable to load dashboard data right now.';

  const bookingsToday = bookings.filter((booking) => {
    const eventDate = new Date(booking.eventDate);

    if (!Number.isFinite(eventDate.getTime())) {
      return false;
    }

    const now = new Date();

    return (
      eventDate.getFullYear() === now.getFullYear() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getDate() === now.getDate()
    );
  }).length;

  const upcomingBookings = bookings.filter(
    (booking) =>
      !INACTIVE_BOOKING_STATUSES.includes(booking.status) &&
      isFutureDate(booking.eventDate)
  );

  const pendingBookings = bookings.filter((booking) =>
    PENDING_BOOKING_STATUSES.includes(booking.status)
  );

  const pendingPayments = orders.filter((order) =>
    PENDING_ORDER_STATUSES.has(order.status)
  ).length;

  const prioritizedWorkQueue = (() => {
    const sortedPending = [...pendingBookings].sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );

    const sortedUpcoming = [...upcomingBookings].sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );

    const queue: Booking[] = [];
    const seen = new Set<string>();

    [...sortedPending, ...sortedUpcoming].forEach((booking) => {
      if (!seen.has(booking.id)) {
        queue.push(booking);
        seen.add(booking.id);
      }
    });

    return queue.slice(0, 5);
  })();

  const recentActivities = (() => {
    const bookingActivities = bookings
      .map((booking) => ({
        id: `booking-${booking.id}`,
        timeAt: booking.updatedAt || booking.createdAt,
        text: `${getCustomerName(booking)} booking ${booking.status.toLowerCase()}`,
        link: '/bookings' as const,
      }))
      .filter((item) => Number.isFinite(new Date(item.timeAt).getTime()));

    const orderActivities = orders
      .map((order) => ({
        id: `order-${order.id || order.bookingId}`,
        timeAt: order.updatedAt || order.createdAt || '',
        text: `Payment ${order.status.toLowerCase()} for booking #${order.bookingId.slice(0, 8)}`,
        link: '/orders' as const,
      }))
      .filter((item) => Number.isFinite(new Date(item.timeAt).getTime()));

    return [...bookingActivities, ...orderActivities]
      .sort(
        (a, b) => new Date(b.timeAt).getTime() - new Date(a.timeAt).getTime()
      )
      .slice(0, 5);
  })();

  const overviewCards = [
    {
      key: 'bookings-today',
      title: 'Bookings Today',
      value: isLoading ? (
        <Skeleton.Input active size="small" />
      ) : (
        `${bookingsToday}`
      ),
      accent: '#2563eb',
      icon: <CalendarOutlined />,
      to: '/bookings' as const,
    },
    {
      key: 'upcoming-sessions',
      title: 'Upcoming Sessions',
      value: isLoading ? (
        <Skeleton.Input active size="small" />
      ) : (
        `${upcomingBookings.length}`
      ),
      accent: '#e11d48',
      icon: <CameraOutlined />,
      to: '/bookings' as const,
    },
    {
      key: 'pending-bookings',
      title: 'Pending Bookings',
      value: isLoading ? (
        <Skeleton.Input active size="small" />
      ) : (
        `${pendingBookings.length}`
      ),
      accent: '#7c3aed',
      icon: <ToolOutlined />,
      to: '/bookings' as const,
    },
    {
      key: 'pending-payments',
      title: 'Pending Payments',
      value: isLoading ? (
        <Skeleton.Input active size="small" />
      ) : (
        `${pendingPayments}`
      ),
      accent: '#16a34a',
      icon: <DollarOutlined />,
      to: '/orders' as const,
    },
  ];

  return (
    <AdminLayout selectedKey="dashboard">
      <div className="staff-page">
        <DashboardHeader
          darkMode={darkMode}
          greetingName={user?.firstName || 'Admin'}
          focusTitle="Today's focus"
          focusBody="Prioritize pending deposits, confirm upcoming sessions, and review unpaid orders."
        />

        {hasError && (
          <Alert
            style={getErrorAlertStyle}
            type="error"
            showIcon
            title="Dashboard data could not be fully loaded"
            description={errorMessage}
          />
        )}

        <Row gutter={[16, 16]}>
          {overviewCards.map((card) => (
            <Col key={card.key} xs={24} sm={12} xl={6} className="flex">
              <Link to={card.to} className={getKpiLinkClass}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  accent={card.accent}
                  darkMode={darkMode}
                />
              </Link>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} className={sectionRowClass}>
          <Col xs={24} xl={16}>
            <Card
              className={cardBaseClass}
              title={
                <DashboardSectionTitle
                  darkMode={darkMode}
                  title="Quick Actions"
                />
              }
            >
              <div className={quickActionsGridClass}>
                <Link to="/bookings" className="block">
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    size="large"
                    className={actionButtonPrimaryClass}
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(236,72,153,0.96), rgba(225,29,72,0.92))',
                    }}
                  >
                    New Booking
                  </Button>
                </Link>
                <Link to="/orders" className="block">
                  <Button
                    icon={<DollarOutlined />}
                    size="large"
                    className={actionButtonClass}
                  >
                    Review Payments
                  </Button>
                </Link>
                <Link to="/jobs" className="block">
                  <Button
                    icon={<ToolOutlined />}
                    size="large"
                    className={actionButtonClass}
                  >
                    Manage Jobs
                  </Button>
                </Link>
                <Link to="/customers" className="block">
                  <Button
                    icon={<UserOutlined />}
                    size="large"
                    className={actionButtonClass}
                  >
                    Manage Customers
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card
              className={profileCardClass}
              title={
                <DashboardSectionTitle darkMode={darkMode} title="Profile" />
              }
            >
              <div className={sectionLabelClass}>Account snapshot</div>
              {user && (
                <Space size="middle" className="items-start">
                  <Avatar
                    size={56}
                    className="bg-gradient-to-br from-pink-500 to-rose-600"
                    icon={<UserOutlined />}
                  />
                  <div>
                    <Title
                      level={5}
                      className="!mb-1"
                      style={getProfileTitleStyle(darkMode)}
                    >
                      {user.firstName
                        ? `${user.lastName} ${user.firstName || ''}`
                        : 'Admin User'}
                    </Title>
                    <div className="flex flex-col gap-1">
                      <Text style={getMutedTextStyle(darkMode)}>
                        {user.phoneNumber}
                      </Text>
                      {user.email && (
                        <Text style={getMutedTextStyle(darkMode)}>
                          {user.email}
                        </Text>
                      )}
                    </div>
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} xl={14}>
            <Card
              className={cardBaseClass}
              title={
                <DashboardSectionTitle darkMode={darkMode} title="Work Queue" />
              }
              extra={
                <Link to="/bookings" className="text-xs font-semibold">
                  Open bookings
                </Link>
              }
            >
              <div className={sectionLabelClass}>Prioritized by urgency</div>

              {isLoading && (
                <div className={panelBodyClass}>
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                </div>
              )}

              {!isLoading && prioritizedWorkQueue.length === 0 && (
                <Alert
                  type="info"
                  showIcon
                  title="No upcoming or pending bookings right now."
                />
              )}

              {!isLoading && prioritizedWorkQueue.length > 0 && (
                <div className={panelBodyClass}>
                  {prioritizedWorkQueue.map((booking) => (
                    <DashboardQueueItem
                      key={booking.id}
                      darkMode={darkMode}
                      customerName={getCustomerName(booking)}
                      dateLabel={formatDateTime(booking.eventDate)}
                      status={booking.status}
                      statusTone={getBookingStatusTone(booking.status)}
                      to="/bookings"
                    />
                  ))}
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} xl={10}>
            <Card
              className={cardBaseClass}
              title={
                <DashboardSectionTitle
                  darkMode={darkMode}
                  title="Recent Activity"
                />
              }
            >
              <div className={sectionLabelClass}>
                Latest booking and payment events
              </div>

              {isLoading && (
                <div className={panelBodyClass}>
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                </div>
              )}

              {!isLoading && recentActivities.length === 0 && (
                <Alert type="info" showIcon title="No recent activity yet." />
              )}

              {!isLoading && recentActivities.length > 0 && (
                <div className={activityContainerClass}>
                  {recentActivities.map((activity) => (
                    <DashboardActivityItem
                      key={activity.id}
                      darkMode={darkMode}
                      text={activity.text}
                      timeLabel={formatRelativeTime(activity.timeAt)}
                      to={activity.link}
                    />
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: Dashboard,
});
