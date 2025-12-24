import { AdminLayout } from '@components/layouts/AdminLayout';
import { ProductManagement } from '@components/admin/ProductManagement';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/products')({
  component: () => (
    <AdminLayout>
      <ProductManagement />
    </AdminLayout>
  ),
});
