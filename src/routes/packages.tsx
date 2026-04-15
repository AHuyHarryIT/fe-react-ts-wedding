import { createFileRoute } from '@tanstack/react-router';
import { PackagesManagement } from '@features/packages';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/packages')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: PackagesManagementPage,
});

function PackagesManagementPage() {
  return (
    <AdminLayout selectedKey="packages">
      <PackagesManagement />
    </AdminLayout>
  );
}
