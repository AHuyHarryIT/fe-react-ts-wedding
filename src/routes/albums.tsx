import { createFileRoute } from '@tanstack/react-router';
import { AlbumManagement } from '@features/albums';
import { AdminLayout } from '@shared/components/AdminLayout';
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
