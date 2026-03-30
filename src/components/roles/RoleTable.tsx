import type { Role } from '@/types';
import { SafetyOutlined } from '@ant-design/icons';
import { ActionButton, StaffTableScroll } from '@components/ui';
import { useTheme } from '@hooks';
import { Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

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

  const columns: ColumnsType<Role> = [
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
          <ActionButton
            action="custom"
            icon={<SafetyOutlined />}
            variant="link"
            label="Permissions"
            showIcon={true}
            onClick={() => onManagePermissions(record)}
          />
          <ActionButton
            action="edit"
            variant="link"
            showIcon={true}
            onClick={() => onEdit(record)}
          />
          <ActionButton
            action="delete"
            variant="link"
            showIcon={true}
            popconfirmTitle="Delete Role"
            popconfirmDescription="Are you sure you want to delete this role?"
            onClick={() => onDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <StaffTableScroll minWidth={980}>
      <Table
        className="staff-table"
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
    </StaffTableScroll>
  );
}
