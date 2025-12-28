import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tooltip,
  Typography,
  Tag,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useTheme } from '@hooks';
import type { Role } from '@/types';

const { Text } = Typography;

interface RoleTableProps {
  data: Role[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onManagePermissions: (role: Role) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export function RoleTable({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  onEdit,
  onDelete,
  onManagePermissions,
  onPageChange,
}: RoleTableProps) {
  const { darkMode: isDark } = useTheme();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <SafetyOutlined style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
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
      title: 'Permissions',
      key: 'permissions',
      render: (_: unknown, record: Role) => (
        <Space size={[0, 8]} wrap>
          {record.permissions && record.permissions.length > 0 ? (
            <>
              {record.permissions.slice(0, 3).map((rp) => (
                <Tag key={rp.permissionId} color="blue">
                  {rp.permission.key}
                </Tag>
              ))}
              {record.permissions.length > 3 && (
                <Tag color="default">+{record.permissions.length - 3} more</Tag>
              )}
            </>
          ) : (
            <Text type="secondary">No permissions</Text>
          )}
        </Space>
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
      render: (_: unknown, record: Role) => (
        <Space>
          <Tooltip title="Manage Permissions">
            <Button
              type="link"
              icon={<SafetyOutlined />}
              onClick={() => onManagePermissions(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Role"
            description="Are you sure you want to delete this role?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
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
        showTotal: (total) => `Total ${total} roles`,
        onChange: onPageChange,
      }}
    />
  );
}
