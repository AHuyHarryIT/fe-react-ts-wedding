import { createFileRoute } from '@tanstack/react-router';
import { AlbumManagement } from '@components/albums';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { requireStaffAuth } from '@utils/authGuard';

export const Route = createFileRoute('/albums')({
  beforeLoad: async () => {
    await requireStaffAuth();
  },
  component: AlbumsPage,
});

function AlbumsPage() {
  return (
    <AdminLayout selectedKey="albums">
      <AlbumManagement />
    </AdminLayout>
  );
}
