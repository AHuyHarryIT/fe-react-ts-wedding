import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { ServicesManagement } from '@components/services';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/services')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: ServicesManagementPage,
});

function ServicesManagementPage() {
  return (
    <AdminLayout selectedKey="services">
      <ServicesManagement />
    </AdminLayout>
  );
}
