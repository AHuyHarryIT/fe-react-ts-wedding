import { createFileRoute } from '@tanstack/react-router';
import { UserManagement } from '@features/users';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/users')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: UserManagementPage,
});

function UserManagementPage() {
  return (
    <AdminLayout selectedKey="staff">
      <UserManagement />
    </AdminLayout>
  );
}
