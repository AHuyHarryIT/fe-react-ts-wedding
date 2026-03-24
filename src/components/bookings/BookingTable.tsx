import { Table, Space, Tag } from 'antd';
import { ActionButton } from '@components/ui';
import type { ColumnsType } from 'antd/es/table';
import type { Booking, BookingStatus } from '@types';
import { formatMoneyVND } from '@utils/money';

interface BookingTableProps {
  bookings: Booking[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onView: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const statusColorMap: Record<BookingStatus, string> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RESCHEDULED: 'purple',
};

export function BookingTable({
  bookings,
  loading,
  currentPage,
  pageSize,
  total,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: BookingTableProps) {
  const columns: ColumnsType<Booking> = [
    {
      title: 'Customer',
      dataIndex: ['customer', 'firstName'],
      key: 'customer',
      width: 150,
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
      render: (date) => new Date(date).toLocaleDateString(),
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
        <Tag color={statusColorMap[status]}>{status}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const isPending = record.status === 'PENDING';
        return (
          <Space size="small">
            <ActionButton
              action="view"
              size="small"
              onClick={() => onView(record)}
            />
            {isPending && (
              <>
                <ActionButton
                  action="edit"
                  size="small"
                  onClick={() => onEdit(record)}
                />
                <ActionButton
                  action="delete"
                  size="small"
                  popconfirmTitle="Delete Booking"
                  popconfirmDescription="Are you sure you want to delete this booking?"
                  onClick={() => onDelete(record.id)}
                />
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={bookings}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        onChange: onPageChange,
        onShowSizeChange: (_, size) => onPageSizeChange(size),
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} bookings`,
      }}
    />
  );
}
