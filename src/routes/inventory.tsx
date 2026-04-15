import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { InventoryManagement } from '@features/inventory';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/inventory')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: InventoryManagementPage,
});

function InventoryManagementPage() {
  return (
    <AdminLayout selectedKey="inventory">
      <InventoryManagement />
    </AdminLayout>
  );
}
