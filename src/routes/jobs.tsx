import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@shared/components/AdminLayout';
import { JobManagement } from '@features/jobs';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/jobs')({
  beforeLoad: ({ location }) => requireStaffAuth({ location }),
  component: JobsManagementPage,
});

function JobsManagementPage() {
  return (
    <AdminLayout selectedKey="jobs">
      <JobManagement />
    </AdminLayout>
  );
}
