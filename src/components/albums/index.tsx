import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@components/management';
import { AlbumGrid } from './AlbumGrid';
import { AlbumFormModal } from './AlbumFormModal';
import { AlbumDetailsModal } from './AlbumDetailsModal';
import { AlbumShareModal } from './AlbumShareModal';
import { useAlbumManagement } from './useAlbumManagement';

export { AlbumManagement };

function AlbumManagement() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isDetailsModalOpen,
    isShareModalOpen,
    selectedAlbum,
    shareLink,
    searchText,
    currentPage,
    pageSize,
    albumsData,
    albumsLoading,
    albumDetailsData,
    albumDetailsLoading,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    revokeShareTokenMutation,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleOpenDetails,
    handleRemoveFiles,
    handleGenerateShareToken,
    handleRevokeShareToken,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailsModal,
    handleCloseShareModal,
  } = useAlbumManagement();

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title="Album Management"
            subtitle="Manage photo albums and collections"
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search albums..."
          />
        }
        table={
          <AlbumGrid
            data={albumsData?.data || []}
            loading={albumsLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={albumsData?.pagination?.total || 0}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onViewDetails={handleOpenDetails}
            onShare={(album) => handleGenerateShareToken(album)}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        }
        createModal={
          <AlbumFormModal
            type="create"
            open={isCreateModalOpen}
            loading={createMutation.isPending}
            selectedAlbum={null}
            form={createForm}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
          />
        }
        editModal={
          <AlbumFormModal
            type="edit"
            open={isEditModalOpen}
            loading={updateMutation.isPending}
            selectedAlbum={selectedAlbum}
            form={editForm}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
          />
        }
      />

      <AlbumDetailsModal
        open={isDetailsModalOpen}
        loading={albumDetailsLoading}
        album={selectedAlbum}
        albumWithFiles={albumDetailsData?.data || null}
        onCancel={handleCloseDetailsModal}
        onRemoveFile={(fileId) => handleRemoveFiles([fileId])}
      />

      <AlbumShareModal
        open={isShareModalOpen}
        loading={revokeShareTokenMutation.isPending}
        shareLink={shareLink}
        onRevoke={() => {
          if (selectedAlbum) {
            handleRevokeShareToken(selectedAlbum.id);
          }
        }}
        onCancel={handleCloseShareModal}
      />
    </>
  );
}
