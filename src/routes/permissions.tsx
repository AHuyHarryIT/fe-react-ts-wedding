import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { PermissionManagement } from '@features/permissions';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/permissions')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: PermissionManagementPage,
});

function PermissionManagementPage() {
  return (
    <AdminLayout selectedKey="permissions">
      <PermissionManagement />
    </AdminLayout>
  );
}
