import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { POSView } from '@features/pos/POSView';

export const Route = createFileRoute('/pos')({
  component: POSPage,
  beforeLoad: () => ({ adminOnly: true }),
});

function POSPage() {
  return (
    <AdminLayout selectedKey="pos">
      <POSView />
    </AdminLayout>
  );
}
