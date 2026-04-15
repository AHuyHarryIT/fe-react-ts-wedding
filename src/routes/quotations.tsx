import { createFileRoute } from '@tanstack/react-router';
import { QuotationManagement } from '@features/quotations';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/quotations')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: QuotationsManagementPage,
});

function QuotationsManagementPage() {
  return (
    <AdminLayout selectedKey="quotations">
      <QuotationManagement />
    </AdminLayout>
  );
}
