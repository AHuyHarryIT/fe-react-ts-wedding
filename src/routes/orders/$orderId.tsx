import { createFileRoute } from '@tanstack/react-router';
import { OrderDetailView } from '@features/orders/OrderDetailView';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: OrderDetailPageRoute,
});

function OrderDetailPageRoute() {
  const { orderId } = Route.useParams();
  return (
    <AdminLayout selectedKey="orders">
      <OrderDetailView orderId={orderId} />
    </AdminLayout>
  );
}
