import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { Quotation, QuotationStatus } from '@types';
import { formatMoneyVND } from '@utils/money';
import { Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const STATUS_CONFIG: Record<
  QuotationStatus,
  { color: string; label: string; icon: JSX.Element }
> = {
  DRAFT: { color: 'default', label: 'Draft', icon: <CopyOutlined /> },
  SENT: { color: 'processing', label: 'Sent', icon: <SendOutlined /> },
  ACCEPTED: {
    color: 'success',
    label: 'Accepted',
    icon: <CheckCircleOutlined />,
  },
  REJECTED: {
    color: 'error',
    label: 'Rejected',
    icon: <CloseCircleOutlined />,
  },
  EXPIRED: {
    color: 'warning',
    label: 'Expired',
    icon: <CloseCircleOutlined />,
  },
  CONVERTED: {
    color: 'geekblue',
    label: 'Converted',
    icon: <CheckCircleOutlined />,
  },
};

interface QuotationTableProps {
  quotations: Quotation[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function QuotationTable({
  quotations,
  loading,
  currentPage,
  pageSize,
  total,
  onView,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
  onPageChange,
  onPageSizeChange,
}: QuotationTableProps) {
  const columns = [
    {
      title: 'Quotation #',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      width: 140,
      render: (text: string) => (
        <Text strong style={{ color: '#ec4899' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 200,
      render: (customer?: Quotation['customer']) => {
        if (!customer) return <Text type="secondary">N/A</Text>;
        return (
          <div>
            <Text strong>
              {customer.lastName} {customer.firstName}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {customer.phoneNumber}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: QuotationStatus) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 150,
      align: 'right' as const,
      render: (price: number) => <Text strong>{formatMoneyVND(price)}</Text>,
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      key: 'validUntil',
      width: 140,
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{dayjs(date).format('DD/MM/YYYY')}</Text>
      ),
    },
    {
      title: 'Converted',
      dataIndex: 'convertedBookingId',
      key: 'converted',
      width: 100,
      align: 'center' as const,
      render: (bookingId: string) => (
        <Tag color={bookingId ? 'success' : 'default'}>
          {bookingId ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: Quotation) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
          {record.status === 'DRAFT' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
              <Popconfirm
                title="Delete Quotation?"
                description="This action cannot be undone."
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </>
          )}
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              style={{ color: '#1677ff' }}
              onClick={() => onSend(record.id)}
            />
          )}
          {record.status === 'SENT' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => onAccept(record.id)}
              />
              <Button
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                danger
                onClick={() => onReject(record.id)}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={quotations}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (totalCount) => `${totalCount} quotations`,
        onChange: onPageChange,
        onShowSizeChange: (_, size) => onPageSizeChange(size),
      }}
    />
  );
}
