import { createFileRoute } from '@tanstack/react-router';
import { UserManagement } from '@components/management/UserManagement';
import { AdminLayout } from '@components/layouts/AdminLayout';

export const Route = createFileRoute('/users')({
  component: UserManagementPage,
});

function UserManagementPage() {
  return (
    <AdminLayout selectedKey="users">
      <UserManagement />
    </AdminLayout>
  );
}
