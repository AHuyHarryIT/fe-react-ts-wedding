import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Button, Card, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { AntdProvider } from '../providers/AntdProvider';
import { useTheme } from '../hooks';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../lib/api';

function Dashboard() {
  const { darkMode } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

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

  return (
    <AntdProvider darkMode={darkMode}>
      {contextHolder}
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              loading={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>

          {user && (
            <Card className="shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
              <div className="space-y-2">
                <p>
                  <strong>Phone:</strong> {user.phoneNumber}
                </p>
                {user.firstName && (
                  <p>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                )}
                {user.email && (
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
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
