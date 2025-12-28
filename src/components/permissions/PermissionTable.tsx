import { Table, Tag, Typography } from 'antd';
import { useTheme } from '@hooks';
import type { Permission } from '@/types';

const { Text } = Typography;

interface PermissionTableProps {
  data: Permission[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export function PermissionTable({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  onPageChange,
}: PermissionTableProps) {
  const { darkMode } = useTheme();

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {key}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string | null) => (
        <Text style={{ color: darkMode ? '#d1d5db' : '#475569' }}>
          {description || '-'}
        </Text>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text style={{ color: darkMode ? '#9ca3af' : '#64748b' }}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
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
        onChange: onPageChange,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} permissions`,
      }}
      style={{
        background: 'transparent',
      }}
    />
  );
}
