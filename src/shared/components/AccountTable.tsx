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

interface AccountTableProps<T extends AccountRecord> {
  data: T[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  entityLabel: string;
  emptyDescription: string;
  extraColumns?: ColumnsType<T>;
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
  onEdit,
  onDelete,
  onManageRoles,
  onPageChange,
  rowSelection,
  selectedCount,
  onBulkDelete,
}: AccountTableProps<T>) {
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
      width: onManageRoles ? 210 : 150,
      render: (_, record) => (
        <Space size="small">
          <ActionButton
            action="edit"
            size="small"
            onClick={() => onEdit(record)}
          />
          {onManageRoles ? (
            <ActionButton
              action="custom"
              icon={<LockOutlined />}
              size="small"
              label="Role"
              showIcon={true}
              onClick={() => onManageRoles(record)}
            />
          ) : null}
          <ActionButton
            action="delete"
            size="small"
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
    <StaffTableScroll minWidth={onManageRoles ? 1160 : 1220}>
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
