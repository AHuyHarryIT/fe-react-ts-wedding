import { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';
import { Spin } from 'antd';

const ReportsView = lazy(() =>
  import('@features/reports/ReportsView').then((mod) => ({
    default: mod.ReportsView,
  }))
);

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
});

function ReportsPage() {
  return (
    <AdminLayout selectedKey="reports">
      <Suspense
        fallback={
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        }
      >
        <ReportsView />
      </Suspense>
    </AdminLayout>
  );
}
