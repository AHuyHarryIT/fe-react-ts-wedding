import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { PermissionManagement } from '@components/permissions';

export const Route = createFileRoute('/permissions')({
  component: PermissionManagementPage,
});

function PermissionManagementPage() {
  return (
    <AdminLayout selectedKey="permissions">
      <PermissionManagement />
    </AdminLayout>
  );
}
