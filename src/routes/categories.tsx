import { AdminLayout } from '@components/layouts/AdminLayout';
import { CategoryManagement } from '@components/categories';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/categories')({
  component: () => (
    <AdminLayout selectedKey="categories">
      <CategoryManagement />
    </AdminLayout>
  ),
});
