import type { Album } from '@/types';
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  LockOutlined,
  PictureOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useTheme } from '@hooks';
import {
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';

const { Text } = Typography;

interface AlbumGridProps {
  data: Album[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onEdit: (album: Album) => void;
  onDelete: (id: string) => void;
  onViewDetails: (album: Album) => void;
  onShare: (album: Album) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export function AlbumGrid({
  data,
  loading,
  currentPage,
  pageSize,
  total,
  onEdit,
  onDelete,
  onViewDetails,
  onShare,
  onPageChange,
}: AlbumGridProps) {
  const { darkMode: isDark } = useTheme();

  if (!loading && data.length === 0) {
    return (
      <Empty
        description="No albums found"
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
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                  onClick={() => onViewDetails(album)}
                >
                  <PictureOutlined
                    style={{
                      fontSize: 64,
                      color: 'white',
                      opacity: 0.8,
                    }}
                  />
                </div>
              }
              actions={[
                <Tooltip key="edit" title="Edit">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(album)}
                  />
                </Tooltip>,
                <Tooltip key="share" title="Share">
                  <Button
                    type="text"
                    icon={<ShareAltOutlined />}
                    onClick={() => onShare(album)}
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="Delete Album"
                  description="Are you sure you want to delete this album?"
                  onConfirm={() => onDelete(album.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={
                  <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Text ellipsis style={{ flex: 1 }}>
                      {album.title}
                    </Text>
                    {album.isPublic ? (
                      <GlobalOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <LockOutlined style={{ color: '#faad14' }} />
                    )}
                  </Space>
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
                      orientation="vertical"
                      size={4}
                      style={{ width: '100%' }}
                    >
                      <Space>
                        <ClockCircleOutlined />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(album.createdAt).toLocaleDateString()}
                        </Text>
                      </Space>
                      {album.expiresAt && (
                        <Tag color="orange" style={{ marginTop: 4 }}>
                          Expires:{' '}
                          {new Date(album.expiresAt).toLocaleDateString()}
                        </Tag>
                      )}
                      {album.share_token && (
                        <Tag color="blue" style={{ marginTop: 4 }}>
                          Shared
                        </Tag>
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
          showTotal={(total) => `Total ${total} albums`}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}
