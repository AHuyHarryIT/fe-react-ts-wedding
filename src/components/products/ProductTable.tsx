import { LazyImage } from '@/components/partials/LazyImage';
import { PictureOutlined, ShoppingOutlined } from '@ant-design/icons';
import { ActionButton } from '@components/ui';
import { useTheme } from '@hooks';
import { albumApi } from '@services/AlbumService';
import type { Product } from '@types';
import { formatMoneyVND } from '@utils/money';
import { Space, Table, Typography } from 'antd';

const { Text } = Typography;

// Default placeholder element
const DEFAULT_IMAGE_PLACEHOLDER = (
  <div
    style={{
      width: '60px',
      height: '60px',
      background: '#f0f0f0',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#8c8c8c',
    }}
  >
    <PictureOutlined style={{ fontSize: '20px' }} />
  </div>
);

interface ProductTableProps {
  data: Product[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export function ProductTable({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  onEdit,
  onDelete,
  onPageChange,
}: ProductTableProps) {
  const { darkMode: isDark } = useTheme();

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageFileId',
      key: 'image',
      width: 80,
      render: (fileId: string) =>
        fileId ? (
          <LazyImage
            src={albumApi.getThumbnailUrl(fileId)}
            cacheKey={fileId}
            alt="Product"
            width={60}
            height={60}
            preview={false}
          />
        ) : (
          DEFAULT_IMAGE_PLACEHOLDER
        ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <ShoppingOutlined style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) =>
        text || <Text type="secondary">No description</Text>,
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text: string) =>
        text || <Text type="secondary">No category</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${formatMoneyVND(price)}`,
      align: 'right' as const,
    },
    {
      title: 'Stock',
      dataIndex: 'stockQty',
      key: 'stockQty',
      render: (stock: number) => <Text strong>{stock} units</Text>,
      align: 'right' as const,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Text strong style={{ color: isActive ? '#22c55e' : '#ef4444' }}>
          {isActive ? 'Active' : 'Inactive'}
        </Text>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space>
          <ActionButton
            action="edit"
            buttonType="link"
            showIcon={true}
            onClick={() => onEdit(record)}
          />
          <ActionButton
            action="delete"
            buttonType="link"
            showIcon={true}
            popconfirmTitle="Delete Product"
            popconfirmDescription="Are you sure you want to delete this product?"
            onClick={() => onDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} products`,
        onChange: onPageChange,
      }}
    />
  );
}
