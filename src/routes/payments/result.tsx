import { createFileRoute } from '@tanstack/react-router';
import PaymentResultPage from '@features/payments/PaymentResultPage';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/payments/result')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: PaymentsResultRoute,
});

function PaymentsResultRoute() {
  return (
    <AdminLayout selectedKey="orders">
      <PaymentResultPage />
    </AdminLayout>
  );
}
