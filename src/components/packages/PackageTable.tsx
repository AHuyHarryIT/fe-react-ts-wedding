import { ActionButton, CloudinaryImage } from '@components/ui';
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
  onView: (pkg: Package) => void;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PackageTable({
  packages,
  loading,
  currentPage,
  pageSize,
  total,
  onView,
  onEdit,
  onDelete,
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
        <span style={{ color: isActive ? '#22c55e' : '#ef4444' }}>
          {isActive ? '●' : '●'} {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
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
            onClick={() => onEdit(record)}
          />
          <ActionButton
            action="delete"
            size="small"
            popconfirmTitle="Delete Package"
            popconfirmDescription="Are you sure you want to delete this package?"
            onClick={() => onDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
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
  );
}
