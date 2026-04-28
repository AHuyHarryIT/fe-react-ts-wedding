import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Grid, Layout, message } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '@hooks';
import { AntdProvider } from '@shared/providers/AntdProvider';
import { useAuthStore } from '@stores/authStore';
import { Footer } from '@shared/components/partials/Footer';
import { Header } from '@shared/components/partials/Header';
import { Sidebar } from '@shared/components/partials/Sidebar';
import { authApi } from '@services/AuthService';

const { Content } = Layout;
const { useBreakpoint } = Grid;

interface AdminLayoutProps {
  children: ReactNode;
  selectedKey?: string;
  showFooter?: boolean;
}

export function AdminLayout({
  children,
  selectedKey = 'dashboard',
  showFooter = true,
}: AdminLayoutProps) {
  const { darkMode, setDarkMode } = useTheme();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  // Hydrate user from API - data fetching via useQuery, side effects via useEffect
  const { data: currentUser, error: hydrateError } = useQuery({
    queryKey: ['admin-layout-current-user'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !isAuthenticated && !user?.id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min
  });

  useEffect(() => {
    if (currentUser?.id) {
      setAuth(currentUser);
    }
  }, [currentUser, setAuth]);

  useEffect(() => {
    if (hydrateError) {
      clearAuth();
      navigate({ to: '/login' });
    }
  }, [hydrateError, clearAuth, navigate]);

  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [isMobile]);

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
      <Layout className="staff-app-shell min-h-screen">
        <Layout
          className="staff-app-shell"
          style={{ background: darkMode ? '#0f172a' : '#f8fafc' }}
        >
          {/* Sidebar */}
          <Sidebar
            collapsed={collapsed}
            onCollapse={setCollapsed}
            selectedKey={selectedKey}
            darkMode={darkMode}
            mobile={isMobile}
            open={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />

          {/* Main Layout */}
          <Layout
            style={{
              marginLeft: isMobile ? 0 : collapsed ? 92 : 280,
              transition: 'margin-left 0.2s ease',
              background: 'transparent',
            }}
          >
            <Header
              collapsed={isMobile ? mobileSidebarOpen : collapsed}
              onToggleCollapse={() => {
                if (isMobile) {
                  setMobileSidebarOpen((open) => !open);
                  return;
                }

                setCollapsed(!collapsed);
              }}
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode(!darkMode)}
              userName={user?.firstName}
              onLogout={handleLogout}
              logoutLoading={logoutMutation.isPending}
            />

            {/* Content */}
            <Content
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 88px)',
                background: 'transparent',
                overflow: 'hidden',
              }}
            >
              <div
                style={{ flex: 1, minHeight: 0 }}
                className={
                  showFooter
                    ? 'px-0 pb-4 pt-2 md:pb-6 md:pt-3'
                    : 'h-full overflow-hidden px-0'
                }
              >
                {children}
              </div>

              {showFooter && <Footer darkMode={darkMode} />}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </AntdProvider>
  );
}
