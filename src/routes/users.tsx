import { createFileRoute } from '@tanstack/react-router';
import { UserManagement } from '@components/management/UserManagement';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/users')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: UserManagementPage,
});

function UserManagementPage() {
  return (
    <AdminLayout selectedKey="users">
      <UserManagement />
    </AdminLayout>
  );
}
