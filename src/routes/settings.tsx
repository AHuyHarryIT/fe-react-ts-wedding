import { createFileRoute } from '@tanstack/react-router';
import { StaffSettingsPage } from '@features/settings';
import { AdminLayout } from '@shared/components/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/settings')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <AdminLayout selectedKey="settings">
      <StaffSettingsPage />
    </AdminLayout>
  );
}
