import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Booking, BookingStatus } from '@types';

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
        `${record.customer?.firstName || ''} ${record.customer?.lastName || ''}`.trim() ||
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
      render: (price) => `$${price?.toFixed(2) || '0.00'}`,
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
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            >
              View
            </Button>
            {isPending && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Booking"
                  description="Are you sure you want to delete this booking?"
                  onConfirm={() => onDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger size="small" icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
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
