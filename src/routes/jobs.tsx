import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { JobManagement } from '@components/jobs';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/jobs')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: JobsManagementPage,
});

function JobsManagementPage() {
  return (
    <AdminLayout selectedKey="jobs">
      <JobManagement />
    </AdminLayout>
  );
}
