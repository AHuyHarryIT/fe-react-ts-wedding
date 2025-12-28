import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Layout, message } from 'antd';
import { useState, type ReactNode } from 'react';
import { useTheme } from '@hooks';
import { AntdProvider } from '@providers/AntdProvider';
import { useAuthStore } from '@stores/authStore';
import { Footer } from '@components/partials/Footer';
import { Header } from '@components/partials/Header';
import { Sidebar } from '@components/partials/Sidebar';
import { authApi } from '@services/AuthService';

const { Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
  selectedKey?: string;
}

export function AdminLayout({
  children,
  selectedKey = 'dashboard',
}: AdminLayoutProps) {
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
      clearAuth();
      navigate({ to: '/login' });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <AntdProvider darkMode={darkMode}>
      {contextHolder}
      <Layout className="min-h-screen">
        {/* Header at Top */}
        <Header
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
          userName={user?.firstName}
          onLogout={handleLogout}
          logoutLoading={logoutMutation.isPending}
        />

        {/* Body with Sidebar and Content */}
        <Layout style={{ background: darkMode ? '#1f2937' : '#f9fafb' }}>
          {/* Sidebar */}
          <Sidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
            selectedKey={selectedKey}
            darkMode={darkMode}
          />

          {/* Main Layout */}
          <Layout
            style={{
              marginLeft: collapsed ? 80 : 250,
              transition: 'margin-left 0.2s',
              background: darkMode ? '#1f2937' : '#f9fafb',
            }}
          >
            {/* Content */}
            <Content
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 64px)',
                background: darkMode ? '#1f2937' : '#f9fafb',
              }}
            >
              <div style={{ flex: 1 }}>{children}</div>

              {/* Footer */}
              <Footer darkMode={darkMode} />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </AntdProvider>
  );
}
