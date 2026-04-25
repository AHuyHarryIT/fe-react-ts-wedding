import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CameraOutlined,
  ShoppingOutlined,
  ToolOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { AdminLayout } from '@shared/components/AdminLayout';
import { StatCard } from '@shared/components/ui/StatCard';
import { useTheme } from '@hooks';
import { useAuthStore } from '@stores/authStore';
import { requireStaffAuth } from '@utils/authGuard';
import { Avatar, Button, Card, Col, Row, Space, Typography } from 'antd';

const { Text, Title } = Typography;

function Dashboard() {
  const { darkMode } = useTheme();
  const { user } = useAuthStore();

  const stats = {
    totalBookings: 42,
    totalRevenue: 125000000,
    activeClients: 28,
    upcomingSessions: 15,
  };

  const overviewCards = [
    {
      key: 'total-bookings',
      title: 'Total Bookings',
      value: `${stats.totalBookings}`,
      accent: '#2563eb',
      icon: <CalendarOutlined />,
    },
    {
      key: 'total-revenue',
      title: 'Total Revenue',
      value: `${stats.totalRevenue.toLocaleString('vi-VN')} ₫`,
      accent: '#16a34a',
      icon: <ShoppingOutlined />,
    },
    {
      key: 'active-clients',
      title: 'Active Clients',
      value: `${stats.activeClients}`,
      accent: '#7c3aed',
      icon: <TeamOutlined />,
    },
    {
      key: 'upcoming-sessions',
      title: 'Upcoming Sessions',
      value: `${stats.upcomingSessions}`,
      accent: '#e11d48',
      icon: <CameraOutlined />,
    },
  ];

  const recentActivities = [
    { id: 1, text: 'New booking from Nguyen Van A', time: '2 hours ago' },
    { id: 2, text: 'Payment received for session #1234', time: '5 hours ago' },
    { id: 3, text: 'New customer inquiry', time: '1 day ago' },
  ];

  return (
    <AdminLayout selectedKey="dashboard">
      <div className="staff-page">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="staff-page-header"
        >
          <div className="min-w-0">
            <div className="staff-kicker">Studio overview</div>
            <h1 className="staff-title mt-4">
              Welcome back, {user?.firstName || 'Admin'}
            </h1>
            <p className="staff-subtitle mt-3">
              Track bookings, revenue, and team workload from a dashboard that
              stays readable on mobile and desktop.
            </p>
          </div>

          <div className="staff-surface flex w-full flex-col gap-3 rounded-3xl p-4 md:w-auto">
            <Text strong style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}>
              Today&apos;s focus
            </Text>
            <Text style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
              Review recent inquiries, confirm deposits, and keep sessions on
              schedule.
            </Text>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Row gutter={[16, 16]}>
            {overviewCards.map((card) => (
              <Col key={card.key} xs={24} sm={12} xl={6} className="flex">
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  accent={card.accent}
                  darkMode={darkMode}
                />
              </Col>
            ))}
          </Row>
        </div>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} xl={14}>
            <div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <Card
                className="staff-surface !border-0"
                title={
                  <span style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    Quick Actions
                  </span>
                }
              >
                <div className="grid gap-3 md:grid-cols-4">
                  <Link to="/bookings" className="block">
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      size="large"
                      className="!h-11 !w-full !rounded-2xl !border-none"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(236,72,153,0.96), rgba(225,29,72,0.92))',
                      }}
                    >
                      New Booking
                    </Button>
                  </Link>
                  <Link to="/customers" className="block">
                    <Button
                      icon={<UserOutlined />}
                      size="large"
                      className="!h-11 !w-full !rounded-2xl"
                    >
                      Manage Customers
                    </Button>
                  </Link>
                  <Link to="/services" className="block">
                    <Button
                      icon={<ShoppingOutlined />}
                      size="large"
                      className="!h-11 !w-full !rounded-2xl"
                    >
                      View Services
                    </Button>
                  </Link>
                  <Link to="/jobs" className="block">
                    <Button
                      icon={<ToolOutlined />}
                      size="large"
                      className="!h-11 !w-full !rounded-2xl"
                    >
                      Manage Jobs
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </Col>

          <Col xs={24} xl={10}>
            <div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
            >
              <Card
                className="staff-surface !border-0"
                title={
                  <span style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    Recent Activity
                  </span>
                }
              >
                <div className="flex w-full flex-col gap-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 rounded-2xl border p-3"
                      style={{
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        background: darkMode
                          ? 'rgba(15, 23, 42, 0.42)'
                          : 'rgba(248, 250, 252, 0.85)',
                      }}
                    >
                      <Avatar
                        size="small"
                        icon={<CalendarOutlined />}
                        style={{
                          background:
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          flexShrink: 0,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <Text
                          style={{
                            display: 'block',
                            marginBottom: '4px',
                            color: darkMode ? '#e5e7eb' : '#1e293b',
                          }}
                        >
                          {activity.text}
                        </Text>
                        <Text
                          style={{
                            fontSize: '12px',
                            color: darkMode ? '#9ca3af' : '#64748b',
                          }}
                        >
                          {activity.time}
                        </Text>
                      </div>
                      <ArrowRightOutlined
                        style={{ color: darkMode ? '#64748b' : '#94a3b8' }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="mt-6"
        >
          <Card
            className="staff-surface !border-0"
            title={
              <span style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                Profile Information
              </span>
            }
          >
            {user && (
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} lg={16}>
                  <Space size="large" className="items-start">
                    <Avatar
                      size={64}
                      className="bg-gradient-to-br from-pink-500 to-rose-600"
                      icon={<UserOutlined />}
                    />
                    <div>
                      <Title
                        level={4}
                        className="!mb-1"
                        style={{
                          color: darkMode ? '#f9fafb' : '#111827',
                        }}
                      >
                        {user.firstName
                          ? `${user.lastName} ${user.firstName || ''}`
                          : 'Admin User'}
                      </Title>
                      <div className="flex flex-col gap-1">
                        <Text
                          style={{
                            color: darkMode ? '#9ca3af' : '#64748b',
                          }}
                        >
                          {user.phoneNumber}
                        </Text>
                        {user.email && (
                          <Text
                            style={{
                              color: darkMode ? '#9ca3af' : '#64748b',
                            }}
                          >
                            {user.email}
                          </Text>
                        )}
                      </div>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} lg={8}>
                  <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                    <Text
                      className="!text-xs !font-semibold !uppercase !tracking-[0.18em]"
                      style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
                    >
                      Access level
                    </Text>
                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Staff administrator
                    </div>
                    <Text style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>
                      Use the sidebar to manage bookings, orders, and account
                      permissions from any device size.
                    </Text>
                  </div>
                </Col>
              </Row>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: Dashboard,
});
