import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Popconfirm,
  Tooltip,
  Typography,
  Tag,
  Empty,
  Pagination,
} from 'antd';
import {
  DeleteOutlined,
  UndoOutlined,
  PictureOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTheme } from '@hooks';
import type { Album } from '@/types';

const { Text } = Typography;

interface AlbumDeletedGridProps {
  data: Album[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onRestore: (id: string) => void;
  onForceDelete: (id: string) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export function AlbumDeletedGrid({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  onRestore,
  onForceDelete,
  onPageChange,
}: AlbumDeletedGridProps) {
  const { darkMode: isDark } = useTheme();

  if (!loading && data.length === 0) {
    return (
      <Empty
        description="No deleted albums"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {data.map((album) => (
          <Col key={album.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              loading={loading}
              cover={
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark
                      ? 'linear-gradient(135deg, #434343 0%, #000000 100%)'
                      : 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)',
                    position: 'relative',
                  }}
                >
                  <PictureOutlined
                    style={{
                      fontSize: 64,
                      color: 'white',
                      opacity: 0.5,
                    }}
                  />
                  <Tag
                    color="red"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 600,
                    }}
                  >
                    DELETED
                  </Tag>
                </div>
              }
              actions={[
                <Popconfirm
                  key="restore"
                  title="Restore Album"
                  description="Restore this album from trash?"
                  onConfirm={() => onRestore(album.id)}
                  okText="Restore"
                  cancelText="Cancel"
                >
                  <Tooltip title="Restore">
                    <Button
                      type="text"
                      icon={<UndoOutlined />}
                      style={{ color: '#52c41a' }}
                    />
                  </Tooltip>
                </Popconfirm>,
                <Popconfirm
                  key="force-delete"
                  title="Permanently Delete Album"
                  description="This will permanently delete the album and all its files from OneDrive. This action cannot be undone!"
                  onConfirm={() => onForceDelete(album.id)}
                  okText="Delete Forever"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                >
                  <Tooltip title="Delete Forever">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={
                  <Text ellipsis style={{ opacity: 0.7 }} delete>
                    {album.title}
                  </Text>
                }
                description={
                  <div>
                    {album.description && (
                      <Text
                        type="secondary"
                        ellipsis
                        style={{ display: 'block', marginBottom: 8 }}
                      >
                        {album.description}
                      </Text>
                    )}
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: '100%' }}
                    >
                      <Space>
                        <ClockCircleOutlined />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Created:{' '}
                          {new Date(album.createdAt).toLocaleDateString()}
                        </Text>
                      </Space>
                      {album.deletedAt && (
                        <Space>
                          <DeleteOutlined style={{ color: '#ff4d4f' }} />
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, color: '#ff4d4f' }}
                          >
                            Deleted:{' '}
                            {new Date(album.deletedAt).toLocaleDateString()}
                          </Text>
                        </Space>
                      )}
                    </Space>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showTotal={(total) => `Total ${total} deleted albums`}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}
