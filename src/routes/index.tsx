import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Space,
  Typography,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CameraOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { motion } from 'motion/react';
import { useTheme } from '../hooks';
import { useAuthStore } from '../stores/authStore';
import { AdminLayout } from '../components/layouts/AdminLayout';

const { Title, Text } = Typography;

function Dashboard() {
  const { darkMode } = useTheme();
  const { user } = useAuthStore();

  // Mock statistics data - replace with real API calls later
  const stats = {
    totalBookings: 42,
    totalRevenue: 125000000,
    activeClients: 28,
    upcomingSessions: 15,
  };

  const recentActivities = [
    { id: 1, text: 'New booking from Nguyen Van A', time: '2 hours ago' },
    { id: 2, text: 'Payment received for session #1234', time: '5 hours ago' },
    { id: 3, text: 'New customer inquiry', time: '1 day ago' },
  ];

  return (
    <AdminLayout selectedKey="dashboard">
      <div className="px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Title
            level={2}
            className="!mb-2"
            style={{ color: darkMode ? '#f9fafb' : '#111827' }}
          >
            Welcome back, {user?.firstName || 'Admin'}! 👋
          </Title>
          <Text
            style={{
              fontSize: '16px',
              color: darkMode ? '#9ca3af' : '#64748b',
            }}
          >
            Here's what's happening with your studio today.
          </Text>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Row gutter={[16, 16]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: darkMode
                    ? 'rgba(31, 41, 55, 0.5)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                }}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Statistic
                  title={
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Total Bookings
                    </span>
                  }
                  value={stats.totalBookings}
                  prefix={<CalendarOutlined className="text-blue-500" />}
                  valueStyle={{ color: darkMode ? '#fff' : '#1f2937' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: darkMode
                    ? 'rgba(31, 41, 55, 0.5)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                }}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Statistic
                  title={
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Total Revenue
                    </span>
                  }
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined className="text-green-500" />}
                  suffix="₫"
                  valueStyle={{ color: darkMode ? '#fff' : '#1f2937' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: darkMode
                    ? 'rgba(31, 41, 55, 0.5)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                }}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Statistic
                  title={
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Active Clients
                    </span>
                  }
                  value={stats.activeClients}
                  prefix={<TeamOutlined className="text-purple-500" />}
                  valueStyle={{ color: darkMode ? '#fff' : '#1f2937' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: darkMode
                    ? 'rgba(31, 41, 55, 0.5)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                }}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Statistic
                  title={
                    <span style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      Upcoming Sessions
                    </span>
                  }
                  value={stats.upcomingSessions}
                  prefix={<CameraOutlined className="text-pink-500" />}
                  valueStyle={{ color: darkMode ? '#fff' : '#1f2937' }}
                />
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Quick Actions & Recent Activity */}
        <Row gutter={[16, 16]}>
          {/* Quick Actions */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                title={
                  <span style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    Quick Actions
                  </span>
                }
                style={{
                  background: darkMode
                    ? 'rgba(31, 41, 55, 0.5)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                  height: '100%',
                }}
                className="shadow-lg"
              >
                <Space direction="vertical" className="w-full" size="middle">
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    block
                    size="large"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 border-none"
                  >
                    New Booking
                  </Button>
                  <Button
                    icon={<UserOutlined />}
                    block
                    size="large"
                    style={{
                      background: darkMode ? '#374151' : '#ffffff',
                      color: darkMode ? '#ffffff' : '#111827',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    }}
                  >
                    Manage Clients
                  </Button>
                  <Button
                    icon={<ShoppingOutlined />}
                    block
                    size="large"
                    style={{
                      background: darkMode ? '#374151' : '#ffffff',
                      color: darkMode ? '#ffffff' : '#111827',
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                    }}
                  >
                    View Services
                  </Button>
                </Space>
              </Card>
            </motion.div>
          </Col>

          {/* Recent Activity */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                title={
                  <span style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                    Recent Activity
                  </span>
                }
                style={{
                  background: darkMode
                    ? 'rgba(31, 41, 55, 0.5)'
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                  height: '100%',
                }}
                className="shadow-lg"
              >
                <Space direction="vertical" className="w-full" size="middle">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: darkMode
                          ? 'rgba(55, 65, 81, 0.5)'
                          : '#f8fafc',
                      }}
                    >
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
                  ))}
                </Space>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card
            title={
              <span style={{ color: darkMode ? '#f9fafb' : '#111827' }}>
                Profile Information
              </span>
            }
            style={{
              background: darkMode
                ? 'rgba(31, 41, 55, 0.5)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              border: 'none',
            }}
            className="shadow-lg"
          >
            {user && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Space size="large">
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
                          ? `${user.firstName} ${user.lastName || ''}`
                          : 'Admin User'}
                      </Title>
                      <Space direction="vertical" size={0}>
                        <Text
                          style={{
                            color: darkMode ? '#9ca3af' : '#64748b',
                          }}
                        >
                          📱 {user.phoneNumber}
                        </Text>
                        {user.email && (
                          <Text
                            style={{
                              color: darkMode ? '#9ca3af' : '#64748b',
                            }}
                          >
                            ✉️ {user.email}
                          </Text>
                        )}
                      </Space>
                    </div>
                  </Space>
                </Col>
              </Row>
            )}
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Check if user is authenticated
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: Dashboard,
});
