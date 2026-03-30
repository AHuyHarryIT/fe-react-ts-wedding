import { createFileRoute } from '@tanstack/react-router';
import { PackagesManagement } from '@components/packages';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/packages')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: PackagesManagementPage,
});

function PackagesManagementPage() {
  return (
    <AdminLayout selectedKey="packages">
      <PackagesManagement />
    </AdminLayout>
  );
}
