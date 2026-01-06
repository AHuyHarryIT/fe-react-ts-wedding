import { createFileRoute } from '@tanstack/react-router';
import { BookingsManagement } from '@components/bookings';
import { AdminLayout } from '@components/layouts/AdminLayout';

export const Route = createFileRoute('/bookings')({
  component: BookingsManagementPage,
});

function BookingsManagementPage() {
  return (
    <AdminLayout selectedKey="bookings">
      <BookingsManagement />
    </AdminLayout>
  );
}
