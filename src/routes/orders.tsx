import { createFileRoute } from '@tanstack/react-router';
import { OrdersPage } from '@components/orders';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/orders')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: OrdersPageRoute,
});

function OrdersPageRoute() {
  return (
    <AdminLayout selectedKey="orders">
      <OrdersPage />
    </AdminLayout>
  );
}
