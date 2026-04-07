import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingCartOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { QuotationStatus } from '@types';
import { Button, Popconfirm, Space } from 'antd';

interface QuotationActionsProps {
  status: QuotationStatus;
  onSend: () => void;
  onAccept: () => void;
  onReject: () => void;
  onConvertToBooking: () => void;
}

export function QuotationActions({
  status,
  onSend,
  onAccept,
  onReject,
  onConvertToBooking,
}: QuotationActionsProps) {
  if (status === 'DRAFT') {
    return (
      <Popconfirm
        title="Send Quotation?"
        description="This will mark the quotation as sent to the customer."
        onConfirm={onSend}
        okText="Send"
        cancelText="Cancel"
      >
        <Button type="link" icon={<SendOutlined />}>
          Send
        </Button>
      </Popconfirm>
    );
  }

  if (status === 'SENT') {
    return (
      <Space size="small">
        <Popconfirm
          title="Accept Quotation?"
          description="Mark this quotation as accepted."
          onConfirm={onAccept}
          okText="Accept"
          cancelText="Cancel"
        >
          <Button
            type="link"
            icon={<CheckCircleOutlined />}
            style={{ color: '#52c41a' }}
          >
            Accept
          </Button>
        </Popconfirm>
        <Popconfirm
          title="Reject Quotation?"
          description="Mark this quotation as rejected."
          onConfirm={onReject}
          okText="Reject"
          cancelText="Cancel"
        >
          <Button type="link" danger icon={<CloseCircleOutlined />}>
            Reject
          </Button>
        </Popconfirm>
      </Space>
    );
  }

  if (status === 'ACCEPTED') {
    return (
      <Popconfirm
        title="Convert to Booking?"
        description="This will create a new booking from this quotation."
        onConfirm={onConvertToBooking}
        okText="Convert"
        cancelText="Cancel"
      >
        <Button
          type="link"
          icon={<ShoppingCartOutlined />}
          style={{ color: '#ec4899' }}
        >
          Convert to Booking
        </Button>
      </Popconfirm>
    );
  }

  return null;
}
