import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  SendOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { Quotation, QuotationStatus } from '@types';
import { formatMoneyVND } from '@utils/money';
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const STATUS_CONFIG: Record<
  QuotationStatus,
  { color: string; label: string; icon: JSX.Element }
> = {
  DRAFT: { color: 'default', label: 'Draft', icon: <ClockCircleOutlined /> },
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
    icon: <ClockCircleOutlined />,
  },
  CONVERTED: {
    color: 'geekblue',
    label: 'Converted to Booking',
    icon: <ShoppingCartOutlined />,
  },
};

interface QuotationDetailDrawerProps {
  open: boolean;
  quotation: Quotation | null;
  actionState: {
    canSend: boolean;
    canAccept: boolean;
    canReject: boolean;
    canConvert: boolean;
    sendReason: string | null;
    acceptReason: string | null;
    rejectReason: string | null;
    convertReason: string | null;
  };
  onClose: () => void;
  onSend: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onConvertToBooking: (id: string) => void;
}

export function QuotationDetailDrawer({
  open,
  quotation,
  actionState,
  onClose,
  onSend,
  onAccept,
  onReject,
  onConvertToBooking,
}: QuotationDetailDrawerProps) {
  if (!quotation) return null;

  const statusConfig = STATUS_CONFIG[quotation.status] || STATUS_CONFIG.DRAFT;

  const itemColumns = [
    {
      title: 'Item',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name: string, record: Quotation['items'][number]) => (
        <div>
          <Text>{name}</Text>
          <br />
          <Tag size="small" style={{ marginTop: 4 }}>
            {record.itemType}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right' as const,
      render: (price: number) => formatMoneyVND(price),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      width: 140,
      align: 'right' as const,
      render: (_: unknown, record: Quotation['items'][number]) =>
        formatMoneyVND(record.unitPrice * record.quantity),
    },
  ];

  const renderStatusActions = () => {
    const actions: JSX.Element[] = [];

    if (quotation.status === 'DRAFT') {
      actions.push(
        <Popconfirm
          key="send"
          title="Send Quotation?"
          description="This will mark the quotation as sent."
          onConfirm={() => onSend(quotation.id)}
          okText="Send"
          cancelText="Cancel"
          disabled={!actionState.canSend}
        >
          <Button
            type="primary"
            icon={<SendOutlined />}
            disabled={!actionState.canSend}
            title={actionState.sendReason ?? undefined}
          >
            Send
          </Button>
        </Popconfirm>
      );
    }

    if (quotation.status === 'SENT') {
      actions.push(
        <Popconfirm
          key="accept"
          title="Mark as Accepted?"
          description="This will confirm the quotation."
          onConfirm={() => onAccept(quotation.id)}
          okText="Accept"
          cancelText="Cancel"
          disabled={!actionState.canAccept}
        >
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            disabled={!actionState.canAccept}
            title={actionState.acceptReason ?? undefined}
          >
            Accept
          </Button>
        </Popconfirm>
      );
      actions.push(
        <Popconfirm
          key="reject"
          title="Reject Quotation?"
          description="This will mark the quotation as rejected."
          onConfirm={() => onReject(quotation.id)}
          okText="Reject"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          disabled={!actionState.canReject}
        >
          <Button
            danger
            icon={<CloseCircleOutlined />}
            disabled={!actionState.canReject}
            title={actionState.rejectReason ?? undefined}
          >
            Reject
          </Button>
        </Popconfirm>
      );
    }

    if (quotation.status === 'ACCEPTED') {
      actions.push(
        <Popconfirm
          key="convert"
          title="Convert to Booking?"
          description="This will create a booking from this quotation."
          onConfirm={() => onConvertToBooking(quotation.id)}
          okText="Convert"
          cancelText="Cancel"
          disabled={!actionState.canConvert}
        >
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            style={{
              background:
                'linear-gradient(135deg, rgba(236,72,153,0.96), rgba(225,29,72,0.92))',
              borderColor: '#ec4899',
            }}
            disabled={!actionState.canConvert}
            title={actionState.convertReason ?? undefined}
          >
            Convert to Booking
          </Button>
        </Popconfirm>
      );
    }

    actions.push(
      <Button key="pdf" icon={<DownloadOutlined />}>
        Export PDF
      </Button>
    );

    return <Space wrap>{actions}</Space>;
  };

  return (
    <Drawer
      title={
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Quotation #{quotation.quotationNumber}
          </Text>
          <br />
          <Title level={4} style={{ margin: '4px 0 0' }}>
            {quotation.title}
          </Title>
        </div>
      }
      open={open}
      onClose={onClose}
      width={720}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Text strong style={{ fontSize: 18, color: '#ec4899' }}>
              {formatMoneyVND(quotation.totalPrice)}
            </Text>
          </div>
          <Space>{renderStatusActions()}</Space>
        </div>
      }
    >
      {/* Status */}
      <div className="mb-4">
        <Tag
          color={statusConfig.color}
          icon={statusConfig.icon}
          style={{ fontSize: 14, padding: '4px 12px' }}
        >
          {statusConfig.label}
        </Tag>
      </div>

      {/* Details */}
      <Descriptions bordered column={2} size="small" className="mb-4">
        <Descriptions.Item label="Customer" span={2}>
          {quotation.customer
            ? `${quotation.customer.lastName} ${quotation.customer.firstName} (${quotation.customer.phoneNumber})`
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Valid Until">
          {dayjs(quotation.validUntil).format('DD MMM YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {dayjs(quotation.createdAt).format('DD MMM YYYY, HH:mm')}
        </Descriptions.Item>
        {quotation.sentAt && (
          <Descriptions.Item label="Sent At">
            {dayjs(quotation.sentAt).format('DD MMM YYYY, HH:mm')}
          </Descriptions.Item>
        )}
        {quotation.acceptedAt && (
          <Descriptions.Item label="Accepted At">
            {dayjs(quotation.acceptedAt).format('DD MMM YYYY, HH:mm')}
          </Descriptions.Item>
        )}
        {quotation.rejectedAt && (
          <Descriptions.Item label="Rejected At">
            {dayjs(quotation.rejectedAt).format('DD MMM YYYY, HH:mm')}
          </Descriptions.Item>
        )}
        {quotation.convertedAt && (
          <Descriptions.Item label="Converted At">
            {dayjs(quotation.convertedAt).format('DD MMM YYYY, HH:mm')}
          </Descriptions.Item>
        )}
        {quotation.convertedBookingId && (
          <Descriptions.Item label="Booking ID" span={2}>
            {quotation.convertedBookingId}
          </Descriptions.Item>
        )}
        {quotation.notes && (
          <Descriptions.Item label="Notes" span={2}>
            {quotation.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Items */}
      <Title level={5} className="mt-4">
        Items ({quotation.items?.length || 0})
      </Title>

      <Table
        dataSource={quotation.items || []}
        columns={itemColumns}
        rowKey={(record) => `${record.itemType}:${record.itemId}`}
        size="small"
        pagination={false}
        className="mb-4"
      />

      {/* Pricing Summary */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text type="secondary">Subtotal</Text>
          <Text>{formatMoneyVND(quotation.subtotal)}</Text>
        </div>
        {quotation.discountAmount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text type="secondary">
              Discount ({quotation.discountPercent}%)
            </Text>
            <Text type="success">
              -{formatMoneyVND(quotation.discountAmount)}
            </Text>
          </div>
        )}
        {quotation.taxAmount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <Text type="secondary">Tax ({quotation.taxPercent}%)</Text>
            <Text>{formatMoneyVND(quotation.taxAmount)}</Text>
          </div>
        )}
        <Divider style={{ margin: '8px 0' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            Grand Total
          </Title>
          <Title level={5} style={{ margin: 0, color: '#ec4899' }}>
            {formatMoneyVND(quotation.totalPrice)}
          </Title>
        </div>
      </div>
    </Drawer>
  );
}
