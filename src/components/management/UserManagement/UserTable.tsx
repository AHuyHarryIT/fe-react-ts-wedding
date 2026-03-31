import { AccountTable } from '@components/management';
import { StatusChip } from '@components/ui';
import type { User } from '@types';
import { Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

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
  const extraColumns: ColumnsType<User> = [
    {
      title: 'Staff ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (value) => value || '-',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: 220,
      render: (roles: User['roles']) =>
        roles?.length ? (
          <Space size={[6, 6]} wrap>
            {roles.map((role) => (
              <StatusChip key={role.id} tone="slate">
                {role.name}
              </StatusChip>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <AccountTable
      data={data}
      loading={loading}
      currentPage={currentPage}
      pageSize={pageSize}
      total={total}
      entityLabel="staff account"
      emptyDescription="No staff accounts found"
      extraColumns={extraColumns}
      onEdit={onEdit}
      onDelete={onDelete}
      onManageRoles={onManageRoles}
      onPageChange={onPageChange}
    />
  );
}
