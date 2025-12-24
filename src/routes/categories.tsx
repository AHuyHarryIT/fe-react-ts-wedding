import { AdminLayout } from '@components/layouts/AdminLayout';
import { CategoryManagement } from '@components/admin/CategoryManagement';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/categories')({
  component: () => (
    <AdminLayout>
      <CategoryManagement />
    </AdminLayout>
  ),
});
