import { App, Modal, Input, Button, Space, Typography } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AlbumShareModalProps {
  open: boolean;
  loading: boolean;
  shareLink: string;
  onRevoke: () => void;
  onCancel: () => void;
}

export function AlbumShareModal({
  open,
  shareLink,
  loading,
  onRevoke,
  onCancel,
}: AlbumShareModalProps) {
  const { message } = App.useApp();

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(shareLink);
    message.success('Share link copied to clipboard');
  };

  return (
    <Modal
      title="Share Album"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={600}
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">
            Share this link to allow others to view this album:
          </Text>
        </div>

        <Space.Compact style={{ display: 'flex', width: '100%' }}>
          <Input value={shareLink} readOnly style={{ flex: 1 }} />
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopyLink}
          >
            Copy
          </Button>
        </Space.Compact>

        <div>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onRevoke}
            loading={loading}
          >
            Revoke Share Link
          </Button>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Revoking the share link will make it inaccessible to anyone who
              has it.
            </Text>
          </div>
        </div>
      </Space>
    </Modal>
  );
}
