import { Table, Space } from 'antd';
import {
  ActionButton,
  StaffTableScroll,
  StatusChip,
} from '@shared/components/ui';
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
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
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
  onView,
  onPageChange,
  onPageSizeChange,
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
      render: (date) => new Date(date).toLocaleDateString(),
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
          </Space>
        );
      },
    },
  ];

  return (
    <StaffTableScroll minWidth={760}>
      <Table
        className="staff-table"
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
          size: 'small',
        }}
      />
    </StaffTableScroll>
  );
}
