import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { QuotationDetailDrawer } from '@features/quotations/QuotationDetailDrawer';
import { QuotationFormModal } from '@features/quotations/QuotationFormModal';
import { QuotationTable } from '@features/quotations/QuotationTable';
import { useQuotationManagement } from '@features/quotations/hooks/useQuotationManagement';
import type { QuotationStatus } from '@types';
import {
  ManagementHeader,
  ManagementLayout,
  SearchBar,
} from '@shared/components/management';
import { Tabs, Typography } from 'antd';

const { Text } = Typography;

const STATUS_TABS: Array<{
  label: string;
  key: QuotationStatus | 'ALL';
}> = [
  { label: 'All', key: 'ALL' },
  { label: 'Draft', key: 'DRAFT' },
  { label: 'Sent', key: 'SENT' },
  { label: 'Accepted', key: 'ACCEPTED' },
  { label: 'Rejected', key: 'REJECTED' },
  { label: 'Expired', key: 'EXPIRED' },
  { label: 'Converted', key: 'CONVERTED' },
];

export function QuotationManagement() {
  const {
    quotations,
    loading,
    loadingDetail,
    total,
    createForm,
    editForm,
    isCreateModalOpen,
    isEditModalOpen,
    detailQuotation,
    selectedQuotation,
    searchText,
    currentPage,
    pageSize,
    contextHolder,
    createSelectedItems,
    editSelectedItems,
    isDetailDrawerOpen,
    activeStatusFilter,
    setActiveStatusFilter,
    setIsCreateModalOpen,
    setSearchText,
    setCurrentPage,
    setPageSize,
    handleCreate,
    handleEdit,
    handleDelete,
    handleOpenEdit,
    handleViewQuotation,
    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDetailDrawer,
    handleAddCreateItem,
    handleRemoveCreateItem,
    handleAddEditItem,
    handleRemoveEditItem,
    calculateCreateSubtotal,
    calculateEditSubtotal,
    calculateCreateTotal,
    calculateEditTotal,
    handleUpdateCreateItemQuantity,
    handleUpdateEditItemQuantity,
    handleSend,
    handleAccept,
    handleReject,
    handleConvertToBooking,
  } = useQuotationManagement();

  return (
    <>
      {contextHolder}
      <ManagementLayout
        header={
          <ManagementHeader
            kicker="Quotation operations"
            title="Quotations"
            subtitle="Create and manage quotations for wedding services, send them to customers, and track their status until conversion to bookings."
            createButtonText="New Quotation"
            icon={<PlusOutlined />}
            onCreateClick={() => setIsCreateModalOpen(true)}
            summary={
              <div className="staff-surface rounded-3xl px-4 py-3">
                <Text className="!text-xs !font-semibold !uppercase !tracking-[0.18em] !text-slate-500 dark:!text-slate-400">
                  Live records
                </Text>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {total} quotations
                </div>
              </div>
            }
          />
        }
        searchBar={
          <SearchBar
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            placeholder="Search quotations by customer, title, or number"
            helperText="Create quotes, track their status, and convert accepted quotations into bookings."
          />
        }
        table={
          <div className="staff-table-wrap">
            <Tabs
              items={STATUS_TABS.map((tab) => ({
                label: (
                  <span
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {tab.label}
                    {tab.key === activeStatusFilter && (
                      <FileTextOutlined
                        style={{ fontSize: 12, color: '#ec4899' }}
                      />
                    )}
                  </span>
                ),
                key: tab.key,
              }))}
              activeKey={activeStatusFilter}
              onChange={(key) => {
                setActiveStatusFilter(key as QuotationStatus | 'ALL');
                setCurrentPage(1);
              }}
              size="small"
              className="mb-4"
            />
            <QuotationTable
              quotations={quotations}
              loading={loading}
              currentPage={currentPage}
              pageSize={pageSize}
              total={total}
              onView={handleViewQuotation}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onSend={handleSend}
              onAccept={handleAccept}
              onReject={handleReject}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        }
        createModal={
          <QuotationFormModal
            type="create"
            open={isCreateModalOpen}
            loading={false}
            selectedQuotation={null}
            form={createForm}
            selectedItems={createSelectedItems}
            onCancel={handleCloseCreateModal}
            onSubmit={handleCreate}
            onItemAdd={handleAddCreateItem}
            onItemRemove={handleRemoveCreateItem}
            onItemQuantityChange={handleUpdateCreateItemQuantity}
            calculateSubtotal={calculateCreateSubtotal}
            calculateTotal={calculateCreateTotal}
          />
        }
        editModal={
          <QuotationFormModal
            type="edit"
            open={isEditModalOpen}
            loading={loadingDetail}
            selectedQuotation={selectedQuotation}
            form={editForm}
            selectedItems={editSelectedItems}
            onCancel={handleCloseEditModal}
            onSubmit={handleEdit}
            onItemAdd={handleAddEditItem}
            onItemRemove={handleRemoveEditItem}
            onItemQuantityChange={handleUpdateEditItemQuantity}
            calculateSubtotal={calculateEditSubtotal}
            calculateTotal={calculateEditTotal}
          />
        }
        additionalModals={[
          <QuotationDetailDrawer
            key="quotation-detail-drawer"
            open={isDetailDrawerOpen}
            quotation={detailQuotation}
            onClose={handleCloseDetailDrawer}
            onSend={handleSend}
            onAccept={handleAccept}
            onReject={handleReject}
            onConvertToBooking={handleConvertToBooking}
          />,
        ]}
      />
    </>
  );
}
