import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { CloudinaryImage } from '@components/ui/CloudinaryImage';
import type { Package } from '@types';
import { formatMoneyVND } from '@utils/money';
import { Button, Popconfirm, Space, Table } from 'antd';
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
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Package"
            description="Are you sure you want to delete this package?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
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
