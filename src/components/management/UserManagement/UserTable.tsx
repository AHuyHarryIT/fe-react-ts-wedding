import { Table, Button, Space, Popconfirm, Badge, Tooltip, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@types';

interface UserTableProps {
  data: User[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onManageRoles: (user: User) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export function UserTable({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  onEdit,
  onDelete,
  onManageRoles,
  onPageChange,
}: UserTableProps) {
  const columns: ColumnsType<User> = [
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
    },
    {
      title: 'Name',
      key: 'name',
      width: 150,
      render: (_, record) => {
        const fullName = [record.lastName, record.firstName]
          .filter(Boolean)
          .join(' ');
        return fullName || '-';
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      render: (email) => email || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit user">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Manage roles">
            <Button
              type="default"
              size="small"
              icon={<LockOutlined />}
              onClick={() => onManageRoles(record)}
            />
          </Tooltip>
          <Tooltip title="Delete user">
            <Popconfirm
              title="Delete user"
              description="Are you sure you want to delete this user?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: total,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true,
        onChange: onPageChange,
      }}
      locale={{
        emptyText: <Empty description="No users found" />,
      }}
    />
  );
}
