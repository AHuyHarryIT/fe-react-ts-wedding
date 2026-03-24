import { Card, Button, Space, Input, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { PackageFormModal } from '@components/packages/PackageFormModal';
import { PackageTable } from '@components/packages/PackageTable';
import { PackageDetailModal } from '@components/packages/PackageDetailModal';
import { usePackageManagement } from '@components/packages/usePackageManagement';
import type { Package } from '@types';

export function PackagesManagement() {
  const [detailPackage, setDetailPackage] = useState<Package | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    packages,
    loading,
    createLoading,
    updateLoading,
    total,
    services,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedPackage,
    searchText,
    currentPage,
    pageSize,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleCloseCreateModal,
    handleCloseEditModal,
  } = usePackageManagement();

  const handleViewPackage = (pkg: Package) => {
    setDetailPackage(pkg);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailPackage(null);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Packages Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Package
          </Button>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="Search packages..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                allowClear
              />
            </Col>
          </Row>

          <PackageTable
            packages={packages}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onView={handleViewPackage}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </Space>
      </Card>

      <PackageFormModal
        type="create"
        open={isCreateModalOpen}
        loading={createLoading}
        selectedPackage={null}
        form={createForm}
        services={services}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreate}
      />

      <PackageFormModal
        type="edit"
        open={isEditModalOpen}
        loading={updateLoading}
        selectedPackage={selectedPackage}
        form={editForm}
        services={services}
        onCancel={handleCloseEditModal}
        onSubmit={handleEdit}
      />

      <PackageDetailModal
        open={isDetailModalOpen}
        package={detailPackage}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
