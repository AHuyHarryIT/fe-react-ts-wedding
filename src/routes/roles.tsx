import { createFileRoute } from '@tanstack/react-router';
import { RoleManagement } from '../components/admin/RoleManagement';
import { AdminLayout } from '../components/layouts/AdminLayout';

export const Route = createFileRoute('/roles')({
  component: RoleManagementPage,
});

function RoleManagementPage() {
  return (
    <AdminLayout selectedKey="roles">
      <RoleManagement />
    </AdminLayout>
  );
}
