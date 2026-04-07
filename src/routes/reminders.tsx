import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { RemindersManagement } from '@/features/reminders/RemindersManagement';

export const Route = createFileRoute('/reminders')({
  component: RemindersPage,
});

function RemindersPage() {
  return (
    <AdminLayout adminOnly>
      <RemindersManagement />
    </AdminLayout>
  );
}
