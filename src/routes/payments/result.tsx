import { createFileRoute } from '@tanstack/react-router';
import PaymentResultPage from '@components/payments/PaymentResultPage';
import { AdminLayout } from '@components/layouts/AdminLayout';

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
