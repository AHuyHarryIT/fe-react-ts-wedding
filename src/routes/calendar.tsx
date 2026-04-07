import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { CalendarView } from '@features/calendar/CalendarView';

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
  beforeLoad: () => ({ adminOnly: true }),
});

function CalendarPage() {
  return (
    <AdminLayout selectedKey="calendar">
      <CalendarView />
    </AdminLayout>
  );
}
