import { createFileRoute } from '@tanstack/react-router';
import PaymentResultPage from '@features/payments/PaymentResultPage';
import { AdminLayout } from '@shared/components/AdminLayout';

export const Route = createFileRoute('/payments/result')({
  component: PaymentsResultRoute,
});

function PaymentsResultRoute() {
  return (
    <AdminLayout selectedKey="orders">
      <PaymentResultPage />
    </AdminLayout>
  );
}
