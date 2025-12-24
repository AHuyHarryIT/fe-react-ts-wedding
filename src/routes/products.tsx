import { AdminLayout } from '@components/layouts/AdminLayout';
import { ProductManagement } from '@components/products';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/products')({
  component: () => (
    <AdminLayout selectedKey="products">
      <ProductManagement />
    </AdminLayout>
  ),
});
