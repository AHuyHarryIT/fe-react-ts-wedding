import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { ServicesManagement } from '@components/services';

export const Route = createFileRoute('/services')({
  component: ServicesManagementPage,
});

function ServicesManagementPage() {
  return (
    <AdminLayout selectedKey="services">
      <ServicesManagement />
    </AdminLayout>
  );
}
