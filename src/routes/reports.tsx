import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { ReportsView } from '@features/reports/ReportsView';

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
  beforeLoad: () => ({ adminOnly: true }),
});

function ReportsPage() {
  return (
    <AdminLayout selectedKey="reports">
      <ReportsView />
    </AdminLayout>
  );
}
