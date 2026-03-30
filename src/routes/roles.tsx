import { createFileRoute } from '@tanstack/react-router';
import { RoleManagement } from '@components/roles';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/roles')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: RoleManagementPage,
});

function RoleManagementPage() {
  return (
    <AdminLayout selectedKey="roles">
      <RoleManagement />
    </AdminLayout>
  );
}
