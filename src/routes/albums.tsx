import { createFileRoute } from '@tanstack/react-router';
import { AlbumManagement } from '@components/albums';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export const Route = createFileRoute('/albums')({
  component: AlbumsPage,
});

function AlbumsPage() {
  return (
    <AdminLayout selectedKey="albums">
      <AlbumManagement />
    </AdminLayout>
  );
}
