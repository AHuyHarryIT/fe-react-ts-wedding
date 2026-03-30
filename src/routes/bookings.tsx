import { createFileRoute } from '@tanstack/react-router';
import { BookingsManagement } from '@components/bookings';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/bookings')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: BookingsManagementPage,
});

function BookingsManagementPage() {
  return (
    <AdminLayout selectedKey="bookings">
      <BookingsManagement />
    </AdminLayout>
  );
}
