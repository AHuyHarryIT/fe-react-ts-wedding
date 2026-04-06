import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { ServicesManagement } from '@features/services';
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
