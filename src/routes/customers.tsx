import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { CustomerManagement } from '@features/customers';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/customers')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: CustomerManagementPage,
});

function CustomerManagementPage() {
  return (
    <AdminLayout selectedKey="customers">
      <CustomerManagement />
    </AdminLayout>
  );
}
