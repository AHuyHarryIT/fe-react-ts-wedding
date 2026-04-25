import { Button } from 'antd';
import {
  ManagementLayout,
  ManagementHeader,
  SearchBar,
} from '@shared/components/management';
import { AlbumGrid } from './AlbumGrid';
import { AlbumDeletedGrid } from './AlbumDeletedGrid';
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
    uploadProgress,
    showTrash,
    showDeletedAlbums,
    deletedAlbumsData,
    deletedAlbumsLoading,
    deletedFilesData,
    deletedFilesLoading,
    albumsData,
    albumsLoading,
    albumDetailsData,
    albumDetailsLoading,
    albumDetailsFetching,
    createForm,
    editForm,
    contextHolder,
    createMutation,
    updateMutation,
    revokeShareTokenMutation,
    uploadImageMutation,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    setShowTrash,
    setShowDeletedAlbums,
    handleCreate,
    handleEdit,
    handleDelete,
    handleRestoreAlbum,
    handleForceDeleteAlbum,
    handleOpenEdit,
    handleOpenDetails,
    handleRemoveFiles,
    handleRestoreFiles,
    handleForceDeleteFiles,
    handleGenerateShareToken,
    handleRevokeShareToken,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailsModal,
    handleCloseShareModal,
    handleUploadImage,
    handleCancelUpload,
    handleRefreshAlbumDetails,
  } = useAlbumManagement();

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            title={showDeletedAlbums ? '🗑️ Deleted Albums' : 'Album Management'}
            subtitle={
              showDeletedAlbums
                ? 'View and manage deleted albums'
                : 'Manage photo albums and collections'
            }
            onCreateClick={
              showDeletedAlbums ? undefined : () => setIsCreateModalOpen(true)
            }
            extra={
              <Button
                onClick={() => {
                  setShowDeletedAlbums(!showDeletedAlbums);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: showDeletedAlbums ? '#52c41a' : '#ff4d4f',
                  background: showDeletedAlbums ? '#f6ffed' : '#fff2f0',
                  color: showDeletedAlbums ? '#52c41a' : '#ff4d4f',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {showDeletedAlbums ? '← Back to Albums' : '🗑️ View Deleted'}
              </Button>
            }
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder={
              showDeletedAlbums
                ? 'Search deleted albums...'
                : 'Search albums...'
            }
          />
        }
        table={
          showDeletedAlbums ? (
            <AlbumDeletedGrid
              data={deletedAlbumsData?.data || []}
              loading={deletedAlbumsLoading}
              currentPage={currentPage}
              pageSize={pageSize}
              total={deletedAlbumsData?.pagination?.total || 0}
              onRestore={handleRestoreAlbum}
              onForceDelete={handleForceDeleteAlbum}
              onPageChange={(page: number, size: number) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          ) : (
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
          )
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
        loading={albumDetailsLoading || uploadImageMutation.isPending}
        fetching={albumDetailsFetching}
        album={selectedAlbum}
        albumWithFiles={albumDetailsData?.data || null}
        uploadProgress={uploadProgress}
        showTrash={showTrash}
        deletedFiles={deletedFilesData?.data || []}
        deletedFilesLoading={deletedFilesLoading}
        onCancel={handleCloseDetailsModal}
        onRemoveFile={(fileId) => handleRemoveFiles([fileId])}
        onRestoreFile={(fileId) => handleRestoreFiles([fileId])}
        onForceDeleteFile={(fileId) => handleForceDeleteFiles([fileId])}
        onToggleTrash={setShowTrash}
        onRefresh={handleRefreshAlbumDetails}
        onCancelUpload={handleCancelUpload}
        onUploadImage={(files, caption, sortOrder) => {
          if (selectedAlbum) {
            handleUploadImage(files, caption, sortOrder);
          }
        }}
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
