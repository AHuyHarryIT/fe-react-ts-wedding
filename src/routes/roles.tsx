import { createFileRoute } from '@tanstack/react-router';
import { RoleManagement } from '@features/roles';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/roles')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: RoleManagementPage,
});

function RoleManagementPage() {
  return (
    <AdminLayout selectedKey="roles">
      <RoleManagement />
    </AdminLayout>
  );
}
