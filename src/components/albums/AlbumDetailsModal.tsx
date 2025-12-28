import {
  Modal,
  Typography,
  Tag,
  Divider,
  Button,
  Image,
  Empty,
  Upload,
  Form,
  message,
  Pagination,
} from 'antd';
import {
  GlobalOutlined,
  LockOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Album, AlbumImage, AlbumWithFiles } from '@/types';
import type { UploadFile, UploadProps } from 'antd';
import { albumApi } from '@/services/AlbumService';
import { useState, useEffect } from 'react';

const { Text, Title } = Typography;

interface AlbumDetailsModalProps {
  open: boolean;
  loading: boolean;
  fetching: boolean;
  album: Album | null;
  albumWithFiles: AlbumWithFiles | null;
  onCancel: () => void;
  onAddFiles?: (fileIds: string[]) => void;
  onRemoveFile?: (fileId: string) => void;
  onUploadImage?: (files: File[], caption?: string, sortOrder?: number) => void;
}

export function AlbumDetailsModal({
  open,
  loading,
  fetching,
  album,
  albumWithFiles,
  onCancel,
  onRemoveFile,
  onUploadImage,
}: AlbumDetailsModalProps) {
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [uploadForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const pageSize = 12;

  const files = albumWithFiles?.files || [];
  const paginatedFiles = files.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Load thumbnails for current page files
  useEffect(() => {
    const loadThumbnails = async () => {
      const newThumbnails = new Map(thumbnails);
      let hasChanges = false;

      for (const albumFile of paginatedFiles) {
        // Skip if already loaded
        if (newThumbnails.has(albumFile.fileId)) {
          continue;
        }

        try {
          const url = await albumApi.getThumbnailUrl(albumFile.fileId);
          if (url) {
            newThumbnails.set(albumFile.fileId, url);
            hasChanges = true;
          }
        } catch (error) {
          console.error(
            `Failed to load thumbnail for ${albumFile.fileId}:`,
            error
          );
        }
      }

      if (hasChanges) {
        setThumbnails(newThumbnails);
      }
    };

    if (paginatedFiles.length > 0) {
      loadThumbnails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedFiles]);

  const handleUploadChange: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    setUploadFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleUploadSubmit = async () => {
    if (uploadFileList.length === 0) {
      message.error('Please select images to upload');
      return;
    }

    const uploadFiles: File[] = [];
    uploadFileList.forEach((f) => {
      if (f.originFileObj) {
        uploadFiles.push(f.originFileObj);
      }
    });

    if (uploadFiles.length === 0) {
      message.error('Failed to get files');
      return;
    }

    try {
      onUploadImage?.(uploadFiles);

      // Reset after upload
      setTimeout(() => {
        setUploadFileList([]);
        uploadForm.resetFields();
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  if (!album) return null;
  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      confirmLoading={loading}
      styles={{
        body: { padding: 0 },
        header: { borderBottom: '1px solid #e8e8e8', padding: '16px 24px' },
      }}
    >
      {/* Header with Album Title and Info */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>
            {album.title}
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: '14px', marginTop: '4px', display: 'block' }}
          >
            {files.length} items
          </Text>
        </div>

        {/* Album Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Tag
            icon={album.isPublic ? <GlobalOutlined /> : <LockOutlined />}
            color={album.isPublic ? 'blue' : 'default'}
            style={{ cursor: 'default' }}
          >
            {album.isPublic ? 'Public' : 'Private'}
          </Tag>
          {album.share_token && (
            <Tag color="success" style={{ cursor: 'default' }}>
              Shared
            </Tag>
          )}
          {album.expiresAt && (
            <Tag color="warning" style={{ cursor: 'default' }}>
              Expires {new Date(album.expiresAt).toLocaleDateString()}
            </Tag>
          )}
        </div>

        {album.description && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">{album.description}</Text>
          </div>
        )}
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Content Area */}
      <div style={{ padding: '24px' }}>
        {/* Upload Section */}
        <div style={{ marginBottom: 32 }}>
          <Title level={5} style={{ marginBottom: 16, color: '#1f1f1f' }}>
            Add Photos
          </Title>
          <div
            style={{
              padding: '20px',
              background: '#f3f3f3',
              borderRadius: '8px',
              border: '1px solid #e8e8e8',
            }}
          >
            <Form
              form={uploadForm}
              layout="vertical"
              style={{ marginBottom: 0 }}
            >
              <Form.Item
                name="files"
                style={{ marginBottom: 12 }}
                rules={[
                  {
                    required: uploadFileList.length === 0,
                    message: 'Please select images',
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  multiple={true}
                  fileList={uploadFileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  accept="image/*"
                  disabled={loading}
                  style={{ margin: 0 }}
                >
                  <div style={{ padding: '8px' }}>
                    <PlusOutlined
                      style={{ fontSize: '20px', color: '#0078d4' }}
                    />
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '13px',
                        color: '#333',
                      }}
                    >
                      Add images
                    </div>
                  </div>
                </Upload>
              </Form.Item>

              {uploadFileList.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid #e8e8e8',
                  }}
                >
                  <Button
                    type="primary"
                    onClick={handleUploadSubmit}
                    loading={loading}
                    disabled={loading}
                    style={{
                      backgroundColor: '#0078d4',
                      borderColor: '#0078d4',
                    }}
                  >
                    Upload{' '}
                    {uploadFileList.length > 0 && `(${uploadFileList.length})`}
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </div>

        {/* Files Section */}
        <div>
          <Title level={5} style={{ marginBottom: 16, color: '#1f1f1f' }}>
            All Photos ({files.length})
          </Title>

          {fetching ? (
            <Text type="secondary">Loading files...</Text>
          ) : files.length === 0 ? (
            <Empty
              description="No files in this album"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ paddingTop: 40 }}
            />
          ) : (
            <>
              <Image.PreviewGroup>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {paginatedFiles.map((albumFile: AlbumImage) => (
                    <div
                      key={albumFile.fileId}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        height: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px rgba(0, 0, 0, 0.12)';
                        e.currentTarget.style.borderColor = '#d0d0d0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e8e8e8';
                      }}
                    >
                      {/* Image */}
                      <div
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          position: 'relative',
                          background: '#fafafa',
                        }}
                      >
                        <Image
                          src={
                            thumbnails.get(albumFile.fileId) ||
                            albumApi.getFileUrl(albumFile.fileId)
                          }
                          alt={albumFile.image.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          preview={{
                            src: albumApi.getFileUrl(albumFile.fileId),
                          }}
                        />
                      </div>

                      {/* Delete Button */}
                      {onRemoveFile && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: 'Delete Image',
                              content: `Are you sure you want to delete "${albumFile.image.name}"?`,
                              okText: 'Delete',
                              okType: 'danger',
                              cancelText: 'Cancel',
                              onOk() {
                                onRemoveFile(albumFile.fileId);
                              },
                            });
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '4px',
                          }}
                        />
                      )}

                      {/* Info Section */}
                      <div
                        style={{
                          padding: '8px',
                          borderTop: '1px solid #f0f0f0',
                          minHeight: '48px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          ellipsis
                          title={albumFile.image.name}
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#1f1f1f',
                            lineHeight: '1.4',
                          }}
                        >
                          {albumFile.image.name}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>

              {files.length > pageSize && (
                <div
                  style={{
                    marginTop: 24,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={files.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
