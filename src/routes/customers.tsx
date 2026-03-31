import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { CustomerManagement } from '@components/management/CustomerManagement';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/customers')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: CustomerManagementPage,
});

function CustomerManagementPage() {
  return (
    <AdminLayout selectedKey="customers">
      <CustomerManagement />
    </AdminLayout>
  );
}
