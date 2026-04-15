import { Table, Space, Button, Popconfirm } from 'antd';
import {
  ActionButton,
  StaffTableScroll,
  StatusChip,
} from '@shared/components/ui';
import type { ColumnsType } from 'antd/es/table';
import type { Booking, BookingStatus } from '@types';
import { formatMoneyVND } from '@utils/money';
import { DeleteOutlined } from '@ant-design/icons';

interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  canDelete: boolean;
  deleteReason: string | null;
  onView: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  rowSelection?: {
    selectedRowKeys: readonly string[];
    onSelectionChange: (selectedKeys: React.Key[]) => void;
  };
  selectedCount?: number;
  onBulkDelete?: () => void;
}

const statusToneMap: Record<
  BookingStatus,
  'orange' | 'blue' | 'green' | 'red' | 'purple'
> = {
  PENDING: 'orange',
  DEPOSIT_PAID: 'purple',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'purple',
};

const formatBookingStatus = (status: BookingStatus) =>
  status.replace(/_/g, ' ');

export function BookingTable({
  bookings,
  loading,
  currentPage,
  pageSize,
  total,
  canDelete,
  deleteReason,
  onView,
  onDelete,
  onPageChange,
  onPageSizeChange,
  rowSelection,
  selectedCount,
  onBulkDelete,
}: BookingTableProps) {
  const columns: ColumnsType<Booking> = [
    {
      title: 'Customer',
      dataIndex: ['customer', 'firstName'],
      key: 'customer',
      width: 180,
      render: (_, record) =>
        `${record.customer?.lastName || ''} ${record.customer?.firstName || ''}`.trim() ||
        record.customer?.phoneNumber ||
        '-',
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (price: number) => `${formatMoneyVND(price)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: BookingStatus) => (
        <StatusChip tone={statusToneMap[status]}>
          {formatBookingStatus(status)}
        </StatusChip>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        return (
          <Space size="small">
            <ActionButton
              action="view"
              size="small"
              onClick={() => onView(record)}
            />
            <ActionButton
              action="delete"
              size="small"
              disabled={!canDelete}
              tooltip={deleteReason ?? undefined}
              title={deleteReason ?? undefined}
              popconfirmTitle="Delete Booking"
              popconfirmDescription="Are you sure you want to delete this booking?"
              onClick={() => onDelete(record.id)}
            />
          </Space>
        );
      },
    },
  ];

  const tableRowSelection = rowSelection
    ? {
        selectedRowKeys: rowSelection.selectedRowKeys,
        onChange: rowSelection.onSelectionChange,
        getCheckboxProps: (record: Booking) => ({
          disabled:
            record.status === 'COMPLETED' || record.status === 'CANCELLED',
          name: `booking-${record.id}`,
        }),
      }
    : undefined;

  return (
    <>
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
            {selectedCount} booking(s) selected
          </span>
          <Popconfirm
            title={`Delete ${selectedCount} booking(s)`}
            description={`Are you sure you want to permanently delete ${selectedCount} booking(s)? This action cannot be undone.`}
            okText={`Delete ${selectedCount}`}
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={onBulkDelete}
            disabled={!canDelete}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!canDelete}
              title={deleteReason ?? undefined}
            >
              Delete Selected
            </Button>
          </Popconfirm>
        </div>
      )}
      <StaffTableScroll minWidth={760}>
        <Table
          className="staff-table"
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          rowSelection={tableRowSelection}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: onPageChange,
            onShowSizeChange: (_, size) => onPageSizeChange(size),
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} bookings`,
            size: 'small',
          }}
        />
      </StaffTableScroll>
    </>
  );
}
