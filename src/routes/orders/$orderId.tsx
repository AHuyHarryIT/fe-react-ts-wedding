import { createFileRoute } from '@tanstack/react-router';
import { OrderDetailView } from '@features/orders/OrderDetailView';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/orders/$orderId')({
  // Keep guard parity with sibling protected routes for redirect-intent restore.
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
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
