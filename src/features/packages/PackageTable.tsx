import {
  ActionButton,
  CloudinaryImage,
  StaffTableScroll,
  StatusChip,
} from '@shared/components/ui';
import type { Package } from '@types';
import { formatMoneyVND } from '@utils/money';
import { Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface PackageTableProps {
  packages: Package[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  actionState: {
    canUpdate: boolean;
    canDelete: boolean;
    updateReason: string | null;
    deleteReason: string | null;
  };
  onView: (pkg: Package) => void;
  onEdit: (pkg: Package) => void;
  onDeactivate: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
export function PackageTable({
  packages,
  loading,
  currentPage,
  pageSize,
  total,
  actionState,
  onView,
  onEdit,
  onDeactivate,
  onPageChange,
  onPageSizeChange,
}: PackageTableProps) {
  const columns: ColumnsType<Package> = [
    {
      title: 'Cover',
      dataIndex: 'coverImageUrl',
      key: 'coverImageUrl',
      width: 110,
      render: (coverImageUrl?: string | null) =>
        coverImageUrl ? (
          <CloudinaryImage
            src={coverImageUrl}
            alt="Package cover"
            width={72}
            height={72}
            style={{ objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description) => description || '-',
      ellipsis: true,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `${formatMoneyVND(price)}`,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <StatusChip tone={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </StatusChip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <ActionButton
            action="view"
            size="small"
            onClick={() => onView(record)}
          />
          <ActionButton
            action="edit"
            size="small"
            disabled={!actionState.canUpdate}
            tooltip={actionState.updateReason ?? undefined}
            title={actionState.updateReason ?? undefined}
            onClick={() => onEdit(record)}
          />
          <ActionButton
            action="delete"
            size="small"
            disabled={!actionState.canDelete}
            tooltip={actionState.deleteReason ?? undefined}
            title={actionState.deleteReason ?? undefined}
            label="Deactivate"
            popconfirmTitle="Deactivate Package"
            popconfirmDescription="Deactivate this package? It will be hidden from new sales but kept for historical records."
            onClick={() => onDeactivate(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <StaffTableScroll minWidth={960}>
      <Table
        className="staff-table"
        columns={columns}
        dataSource={packages}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: onPageChange,
          onShowSizeChange: (_, size) => onPageSizeChange(size),
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} packages`,
        }}
      />
    </StaffTableScroll>
  );
}
