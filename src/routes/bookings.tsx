import { createFileRoute } from '@tanstack/react-router';
import { BookingsManagement } from '@features/bookings';
import { AdminLayout } from '@shared/components/AdminLayout';
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
