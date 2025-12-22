import { createFileRoute, redirect } from '@tanstack/react-router';
import { AntdProvider } from '../providers/AntdProvider';
import { useTheme } from '../hooks';
import { useAuthStore } from '../stores/authStore';

function Dashboard() {
  const { darkMode } = useTheme();
  const { user } = useAuthStore();

  return (
    <AntdProvider darkMode={darkMode}>
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        {user && (
          <div>
            <p>Welcome back!</p>
            <p>Phone: {user.phoneNumber}</p>
            {user.firstName && (
              <p>
                Name: {user.firstName} {user.lastName}
              </p>
            )}
            {user.email && <p>Email: {user.email}</p>}
          </div>
        )}
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
