import { LockOutlined } from '@ant-design/icons';
import {
  ActionButton,
  StaffTableScroll,
  StatusChip,
} from '@shared/components/ui';
import { Button, Empty, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type AccountRecord = {
  id: string;
  phoneNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
};

interface AccountActionState {
  canUpdate: boolean;
  canDelete: boolean;
  updateReason: string | null;
  deleteReason: string | null;
  canManageRoles?: boolean;
  manageRolesReason?: string | null;
}

interface AccountTableProps<T extends AccountRecord> {
  data: T[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  entityLabel: string;
  emptyDescription: string;
  extraColumns?: ColumnsType<T>;
  actionState?: AccountActionState;
  onEdit: (record: T) => void;
  onDelete: (id: string) => void;
  onManageRoles?: (record: T) => void;
  onPageChange: (page: number, pageSize: number) => void;
  rowSelection?: {
    selectedRowKeys: readonly string[];
    onChange: (selectedKeys: React.Key[]) => void;
  };
  selectedCount?: number;
  onBulkDelete?: () => void;
}

export function AccountTable<T extends AccountRecord>({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  entityLabel,
  emptyDescription,
  extraColumns = [],
  actionState,
  onEdit,
  onDelete,
  onManageRoles,
  onPageChange,
  rowSelection,
  selectedCount,
  onBulkDelete,
}: AccountTableProps<T>) {
  const resolvedActionState: Required<AccountActionState> = {
    canUpdate: true,
    canDelete: true,
    updateReason: null,
    deleteReason: null,
    canManageRoles: true,
    manageRolesReason: null,
    ...(actionState ?? {}),
  };

  const columns: ColumnsType<T> = [
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
    },
    {
      title: 'Name',
      key: 'name',
      width: 170,
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
      width: 190,
      render: (email) => email || '-',
    },
    ...extraColumns,
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean) => (
        <StatusChip tone={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </StatusChip>
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
      width: onManageRoles ? 280 : 150,
      render: (_, record) => (
        <Space size="small">
          <ActionButton
            action="edit"
            size="small"
            disabled={!resolvedActionState.canUpdate}
            tooltip={resolvedActionState.updateReason ?? undefined}
            title={resolvedActionState.updateReason ?? undefined}
            onClick={() => onEdit(record)}
          />
          {onManageRoles && (
            <ActionButton
              action="custom"
              icon={<LockOutlined />}
              size="small"
              label="Role"
              showIcon={true}
              disabled={!resolvedActionState.canManageRoles}
              tooltip={resolvedActionState.manageRolesReason ?? undefined}
              title={resolvedActionState.manageRolesReason ?? undefined}
              onClick={() => onManageRoles(record)}
            />
          )}
          <ActionButton
            action="delete"
            size="small"
            disabled={!resolvedActionState.canDelete}
            tooltip={resolvedActionState.deleteReason ?? undefined}
            title={resolvedActionState.deleteReason ?? undefined}
            popconfirmTitle={`Delete ${entityLabel}`}
            popconfirmDescription={`Are you sure you want to delete this ${entityLabel}?`}
            onClick={() => onDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const tableRowSelection = rowSelection
    ? {
        selectedRowKeys: rowSelection.selectedRowKeys,
        onChange: rowSelection.onChange,
      }
    : undefined;

  return (
    <StaffTableScroll>
      {selectedCount && selectedCount > 0 && onBulkDelete && (
        <div
          style={{
            marginBottom: 12,
            padding: '8px 16px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#cf1322', fontWeight: 500 }}>
            {selectedCount} {entityLabel}(s) selected
          </span>
          <Button danger onClick={onBulkDelete}>
            Delete Selected
          </Button>
        </div>
      )}
      <Table
        className="staff-table"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        rowSelection={tableRowSelection}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          onChange: onPageChange,
        }}
        locale={{
          emptyText: <Empty description={emptyDescription} />,
        }}
      />
    </StaffTableScroll>
  );
}
