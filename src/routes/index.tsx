import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import {
  Button,
  Card,
  message,
  Row,
  Col,
  Statistic,
  Avatar,
  Space,
  Badge,
  Typography,
  Layout,
  Menu,
} from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  HeartOutlined,
  CameraOutlined,
  TeamOutlined,
  DashboardOutlined,
  SettingOutlined,
  FileImageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { AntdProvider } from '../providers/AntdProvider';
import { useTheme } from '../hooks';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../lib/api';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

function Dashboard() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      messageApi.success('Logged out successfully');
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 500);
    },
    onError: () => {
      // Even if API fails, clear local auth state
      clearAuth();
      navigate({ to: '/login' });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'Bookings',
    },
    {
      key: 'clients',
      icon: <TeamOutlined />,
      label: 'Clients',
    },
    {
      key: 'services',
      icon: <CameraOutlined />,
      label: 'Services',
    },
    {
      key: 'packages',
      icon: <GiftOutlined />,
      label: 'Packages',
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Products',
    },
    {
      key: 'albums',
      icon: <FileImageOutlined />,
      label: 'Albums',
    },
    {
      key: 'payments',
      icon: <DollarOutlined />,
      label: 'Payments',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <AntdProvider darkMode={darkMode}>
      {contextHolder}
      <Layout
        className="min-h-screen"
        style={{ background: darkMode ? '#1f2937' : '#f9fafb' }}
      >
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: darkMode ? '#1f2937' : '#ffffff',
            borderRight: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          }}
        >
          {/* Logo */}
          <div
            style={{
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0' : '0 24px',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                <HeartOutlined className="text-white text-xl" />
              </div>
              {!collapsed && (
                <div>
                  <Title
                    level={5}
                    className="!mb-0 bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent"
                  >
                    HaMy Studio
                  </Title>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <Menu
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            items={menuItems}
            theme={darkMode ? 'dark' : 'light'}
            style={{
              border: 'none',
              paddingTop: '1rem',
              background: darkMode ? '#1f2937' : '#ffffff',
            }}
          />
        </Sider>

        {/* Main Layout */}
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 250,
            transition: 'margin-left 0.2s',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: darkMode
                ? 'rgba(31, 41, 55, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <Space size="middle">
                  <Button
                    type="text"
                    icon={
                      collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                    }
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ color: darkMode ? '#d1d5db' : '#475569' }}
                  />
                  <Text
                    style={{
                      color: darkMode ? '#9ca3af' : '#64748b',
                      fontSize: '12px',
                    }}
                  >
                    Admin Dashboard
                  </Text>
                </Space>

                <Space size="middle">
                  <Button
                    type="text"
                    onClick={() => setDarkMode(!darkMode)}
                    style={{ color: darkMode ? '#d1d5db' : '#475569' }}
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </Button>
                  <Badge dot>
                    <Avatar
                      className="bg-gradient-to-br from-pink-500 to-rose-600"
                      icon={<UserOutlined />}
                    />
                  </Badge>
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    loading={logoutMutation.isPending}
                  >
                    Logout
                  </Button>
                </Space>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Content
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #fdf2f8 100%)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <div className="px-6 py-8" style={{ flex: 1 }}>
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
                          <span
                            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                          >
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
                          <span
                            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                          >
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
                          <span
                            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                          >
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
                          <span
                            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                          >
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
                        <span
                          style={{ color: darkMode ? '#f9fafb' : '#111827' }}
                        >
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
                      <Space
                        direction="vertical"
                        className="w-full"
                        size="middle"
                      >
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
                        <span
                          style={{ color: darkMode ? '#f9fafb' : '#111827' }}
                        >
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
                      <Space
                        direction="vertical"
                        className="w-full"
                        size="middle"
                      >
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

            {/* Footer - Sticky at Bottom */}
            <div
              style={{
                background: darkMode
                  ? 'rgba(31, 41, 55, 0.5)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                padding: '24px',
                textAlign: 'center',
                marginTop: 'auto',
              }}
            >
              <Space direction="vertical" size="small">
                <Text
                  style={{
                    color: darkMode ? '#9ca3af' : '#64748b',
                    fontSize: '14px',
                  }}
                >
                  © 2025 HaMy Studio. All rights reserved.
                </Text>
                <Space size="middle">
                  <Text
                    style={{
                      color: darkMode ? '#d1d5db' : '#475569',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    className="hover:text-pink-500 transition-colors"
                  >
                    Privacy Policy
                  </Text>
                  <span style={{ color: darkMode ? '#4b5563' : '#d1d5db' }}>
                    |
                  </span>
                  <Text
                    style={{
                      color: darkMode ? '#d1d5db' : '#475569',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    className="hover:text-pink-500 transition-colors"
                  >
                    Terms of Service
                  </Text>
                  <span style={{ color: darkMode ? '#4b5563' : '#d1d5db' }}>
                    |
                  </span>
                  <Text
                    style={{
                      color: darkMode ? '#d1d5db' : '#475569',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    className="hover:text-pink-500 transition-colors"
                  >
                    Contact Support
                  </Text>
                </Space>
              </Space>
            </div>
          </Content>
        </Layout>
      </Layout>
    </AntdProvider>
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
