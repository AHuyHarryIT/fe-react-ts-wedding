import { createFileRoute } from '@tanstack/react-router';
import { PackagesManagement } from '@components/packages';
import { AdminLayout } from '@components/layouts/AdminLayout';

export const Route = createFileRoute('/packages')({
  component: PackagesManagementPage,
});

function PackagesManagementPage() {
  return (
    <AdminLayout selectedKey="packages">
      <PackagesManagement />
    </AdminLayout>
  );
}
