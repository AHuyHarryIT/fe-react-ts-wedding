import {
  Modal,
  Typography,
  Space,
  Tag,
  Divider,
  Button,
  List,
  Image,
  Empty,
} from 'antd';
import {
  GlobalOutlined,
  LockOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Album, AlbumWithFiles, AlbumFile } from '@lib';

const { Text, Title } = Typography;

interface AlbumDetailsModalProps {
  open: boolean;
  loading: boolean;
  album: Album | null;
  albumWithFiles: AlbumWithFiles | null;
  onCancel: () => void;
  onAddFiles?: (fileIds: string[]) => void;
  onRemoveFile?: (fileId: string) => void;
}

export function AlbumDetailsModal({
  open,
  loading,
  album,
  albumWithFiles,
  onCancel,
  onAddFiles,
  onRemoveFile,
}: AlbumDetailsModalProps) {
  if (!album) return null;

  const files = albumWithFiles?.files || [];

  return (
    <Modal
      title={<Title level={4}>{album.title}</Title>}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={800}
      confirmLoading={loading}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Album Info */}
        <div>
          <Space>
            <Tag
              icon={album.isPublic ? <GlobalOutlined /> : <LockOutlined />}
              color={album.isPublic ? 'green' : 'orange'}
            >
              {album.isPublic ? 'Public' : 'Private'}
            </Tag>
            {album.share_token && <Tag color="blue">Shared</Tag>}
            {album.expiresAt && (
              <Tag icon={<ClockCircleOutlined />} color="red">
                Expires: {new Date(album.expiresAt).toLocaleDateString()}
              </Tag>
            )}
          </Space>
        </div>

        {album.description && (
          <div>
            <Text strong>Description:</Text>
            <div>
              <Text type="secondary">{album.description}</Text>
            </div>
          </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Metadata */}
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined />
            <Text strong>Owner:</Text>
            <Text type="secondary">{album.ownerUserId}</Text>
          </Space>
          <Space>
            <CalendarOutlined />
            <Text strong>Created:</Text>
            <Text type="secondary">
              {new Date(album.createdAt).toLocaleString()}
            </Text>
          </Space>
          {album.bookingId && (
            <Space>
              <CalendarOutlined />
              <Text strong>Booking ID:</Text>
              <Text type="secondary">{album.bookingId}</Text>
            </Space>
          )}
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        {/* Files Section */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Files ({files.length})
            </Title>
            {onAddFiles && (
              <Button type="primary" icon={<PlusOutlined />} size="small">
                Add Files
              </Button>
            )}
          </div>

          {loading ? (
            <Text type="secondary">Loading files...</Text>
          ) : files.length === 0 ? (
            <Empty
              description="No files in this album"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 4,
              }}
              dataSource={files}
              renderItem={(albumFile: AlbumFile) => (
                <List.Item>
                  <div
                    style={{
                      position: 'relative',
                      border: '1px solid #d9d9d9',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={albumFile.file.storageUrl}
                      alt={`File ${albumFile.file.id}`}
                      style={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                      }}
                      preview={{
                        mask: 'Preview',
                      }}
                    />
                    <div
                      style={{
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <Text ellipsis style={{ display: 'block', fontSize: 12 }}>
                        {albumFile.caption || `File ${albumFile.fileId}`}
                      </Text>
                      {onRemoveFile && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => onRemoveFile(albumFile.fileId)}
                          style={{ marginTop: 4 }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Space>
    </Modal>
  );
}
