import { Card, Button, Space, Input, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ServiceFormModal } from '@components/services/ServiceFormModal';
import { ServiceTable } from '@components/services/ServiceTable';
import { useServiceManagement } from './useServiceManagement';

export function ServicesManagement() {
  const {
    services,
    loading,
    createLoading,
    updateLoading,
    total,
    contextHolder,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    selectedService,
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
  } = useServiceManagement();

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}
      <Card
        title="Services Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Service
          </Button>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="Search services..."
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

          <ServiceTable
            services={services}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            total={total}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </Space>
      </Card>

      <ServiceFormModal
        type="create"
        open={isCreateModalOpen}
        loading={createLoading}
        selectedService={null}
        form={createForm}
        onCancel={handleCloseCreateModal}
        onSubmit={handleCreate}
      />

      <ServiceFormModal
        type="edit"
        open={isEditModalOpen}
        loading={updateLoading}
        selectedService={selectedService}
        form={editForm}
        onCancel={handleCloseEditModal}
        onSubmit={handleEdit}
      />
    </div>
  );
}
