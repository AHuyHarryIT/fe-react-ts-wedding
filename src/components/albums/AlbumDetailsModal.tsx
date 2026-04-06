import {
  App,
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
  Progress,
  Row,
  Col,
  Tooltip,
  Spin,
} from 'antd';
import {
  GlobalOutlined,
  LockOutlined,
  DeleteOutlined,
  RestFilled,
  UndoOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ClearOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import type { Album, AlbumImage, AlbumWithFiles } from '@/types';
import type { UploadFile, UploadProps } from 'antd';
import { albumApi, type UploadProgress } from '@/services/AlbumService';
import { useState, memo, useEffect, useCallback } from 'react';
import { LazyImage } from '@/components/partials/LazyImage';

const { Text, Title } = Typography;

/* ─── Memoized image grid — won't re-render during upload progress ticks ─── */
const ImageGrid = memo(function ImageGrid({
  files,
  onRemoveFile,
}: {
  files: AlbumImage[];
  onRemoveFile?: (fileId: string) => void;
}) {
  const { modal } = App.useApp();
  return (
    <Image.PreviewGroup>
      <Row gutter={[12, 12]}>
        {files.map((albumFile: AlbumImage) => (
          <Col key={albumFile.fileId} xs={24} sm={8} lg={6}>
            <div
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
                <LazyImage
                  src={albumApi.getThumbnailUrl(albumFile.fileId)}
                  cacheKey={albumFile.fileId}
                  alt={albumFile.image.name}
                  preview={{
                    src: albumApi.getOriginalContentUrl(albumFile.fileId),
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 0,
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
                    modal.confirm({
                      title: 'Move to Trash',
                      content: `Move "${albumFile.image.name}" to trash? You can restore it later.`,
                      okText: 'Move to Trash',
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
          </Col>
        ))}
      </Row>
    </Image.PreviewGroup>
  );
});

interface AlbumDetailsModalProps {
  open: boolean;
  loading: boolean;
  fetching: boolean;
  album: Album | null;
  albumWithFiles: AlbumWithFiles | null;
  uploadProgress?: UploadProgress[];
  showTrash: boolean;
  deletedFiles?: AlbumImage[];
  deletedFilesLoading?: boolean;
  onCancel: () => void;
  onAddFiles?: (fileIds: string[]) => void;
  onRemoveFile?: (fileId: string) => void;
  onRestoreFile?: (fileId: string) => void;
  onForceDeleteFile?: (fileId: string) => void;
  onUploadImage?: (files: File[], caption?: string, sortOrder?: number) => void;
  onToggleTrash: (show: boolean) => void;
  onRefresh?: () => void;
  onCancelUpload?: () => void;
}

export function AlbumDetailsModal({
  open,
  loading,
  fetching,
  album,
  albumWithFiles,
  uploadProgress = [],
  showTrash,
  deletedFiles = [],
  deletedFilesLoading = false,
  onCancel,
  onRemoveFile,
  onRestoreFile,
  onForceDeleteFile,
  onUploadImage,
  onToggleTrash,
  onRefresh,
  onCancelUpload,
}: AlbumDetailsModalProps) {
  const { modal } = App.useApp();
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [uploadForm] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [processingFiles, setProcessingFiles] = useState(false);
  const pageSize = 12;

  const isUploading =
    uploadProgress.length > 0 &&
    uploadProgress.some(
      (p) => p.status === 'uploading' || p.status === 'waiting'
    );

  // Warn when closing / refreshing the browser tab during upload
  useEffect(() => {
    if (!isUploading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isUploading]);

  // Guard modal close — ask for confirmation if upload is in progress
  const handleCancel = useCallback(() => {
    if (isUploading) {
      modal.confirm({
        title: 'Upload in progress',
        icon: <ExclamationCircleOutlined />,
        content:
          'Files are still uploading. If you close now, the remaining uploads will be cancelled. Are you sure?',
        okText: 'Close anyway',
        okType: 'danger',
        cancelText: 'Keep uploading',
        onOk: onCancel,
      });
      return;
    }
    onCancel();
  }, [isUploading, modal, onCancel]);

  const files = albumWithFiles?.files || [];
  const paginatedFiles = files.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleUploadChange: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    // Show spinner immediately, defer heavy state update so it paints first
    setProcessingFiles(true);
    requestAnimationFrame(() => {
      setUploadFileList(newFileList);
      setProcessingFiles(false);
    });
  };

  // Append individual files to the existing list (for "Select files" button)
  const handleAppendFiles: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    setProcessingFiles(true);
    requestAnimationFrame(() => {
      setUploadFileList((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const unique = newFileList.filter((f) => !existingNames.has(f.name));
        return [...prev, ...unique];
      });
      setProcessingFiles(false);
    });
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleUploadSubmit = () => {
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

    // Clear the file picker immediately so user can add more while uploading
    setUploadFileList([]);
    uploadForm.resetFields();

    onUploadImage?.(uploadFiles);
  };

  if (!album) return null;
  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
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
              {/* File picker — hidden while uploading */}
              {!isUploading && (
                <>
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Upload
                        listType="text"
                        multiple={true}
                        fileList={uploadFileList}
                        onChange={handleUploadChange}
                        beforeUpload={beforeUpload}
                        accept="image/*"
                        disabled={loading || processingFiles}
                        showUploadList={false}
                        directory
                      >
                        <Button
                          icon={<FolderOpenOutlined />}
                          loading={processingFiles}
                          style={{ borderColor: '#0078d4', color: '#0078d4' }}
                        >
                          {processingFiles
                            ? 'Reading folder…'
                            : 'Select folder'}
                        </Button>
                      </Upload>
                      <Upload
                        listType="text"
                        multiple={true}
                        fileList={[]}
                        onChange={handleAppendFiles}
                        beforeUpload={beforeUpload}
                        accept="image/*"
                        disabled={loading || processingFiles}
                        showUploadList={false}
                      >
                        <Button
                          icon={<FileImageOutlined />}
                          disabled={loading || processingFiles}
                          style={{ borderColor: '#0078d4', color: '#0078d4' }}
                        >
                          Select files
                        </Button>
                      </Upload>
                      {processingFiles && (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          <Spin size="small" style={{ marginRight: 6 }} />
                          Processing files, please wait…
                        </Text>
                      )}
                      {!processingFiles && uploadFileList.length > 0 && (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          ✅ {uploadFileList.length} image(s) selected
                        </Text>
                      )}
                    </div>
                  </Form.Item>

                  {uploadFileList.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid #e8e8e8',
                        display: 'flex',
                        gap: 8,
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
                        Upload ({uploadFileList.length})
                      </Button>
                      <Button
                        icon={<ClearOutlined />}
                        onClick={() => {
                          setUploadFileList([]);
                          uploadForm.resetFields();
                        }}
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Cancel button — shown while uploading */}
              {isUploading && onCancelUpload && (
                <div style={{ marginBottom: 8 }}>
                  <Button
                    danger
                    onClick={() => {
                      modal.confirm({
                        title: 'Cancel upload?',
                        icon: <ExclamationCircleOutlined />,
                        content:
                          'Already uploaded files will be kept. Remaining files will not be uploaded.',
                        okText: 'Cancel upload',
                        okType: 'danger',
                        cancelText: 'Keep uploading',
                        onOk: onCancelUpload,
                      });
                    }}
                  >
                    Cancel upload
                  </Button>
                </div>
              )}

              {uploadProgress.length > 0 &&
                (() => {
                  const total = uploadProgress.length;
                  const completed = uploadProgress.filter(
                    (p) => p.status === 'complete' || p.status === 'failed'
                  ).length;
                  const succeeded = uploadProgress.filter(
                    (p) => p.status === 'complete'
                  ).length;
                  const failed = uploadProgress.filter(
                    (p) => p.status === 'failed'
                  ).length;
                  const overallPct =
                    total > 0 ? Math.round((completed / total) * 100) : 0;
                  const isUploading = completed < total;

                  // Calculate aggregate upload speed from active uploads
                  const activeUploads = uploadProgress.filter(
                    (p) => p.status === 'uploading' && p.speed && p.speed > 0
                  );
                  const totalSpeed = activeUploads.reduce(
                    (sum, p) => sum + (p.speed || 0),
                    0
                  );
                  const formatSpeed = (bytesPerSec: number) => {
                    if (bytesPerSec >= 1024 * 1024)
                      return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
                    if (bytesPerSec >= 1024)
                      return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
                    return `${Math.round(bytesPerSec)} B/s`;
                  };

                  return (
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: '1px solid #e8e8e8',
                      }}
                    >
                      {/* Overall label */}
                      <Text
                        strong
                        style={{
                          fontSize: '13px',
                          display: 'block',
                          marginBottom: 8,
                        }}
                      >
                        {isUploading
                          ? `Uploading… ${completed} / ${total} done`
                          : 'Upload complete!'}
                      </Text>

                      {/* Overall progress bar */}
                      <Progress
                        percent={overallPct}
                        status={
                          !isUploading && failed === 0
                            ? 'success'
                            : !isUploading && failed > 0
                              ? 'exception'
                              : 'active'
                        }
                        strokeColor={
                          !isUploading && failed === 0
                            ? '#52c41a'
                            : !isUploading && failed > 0
                              ? '#ff4d4f'
                              : '#1890ff'
                        }
                        showInfo={false}
                      />

                      {/* Summary text */}
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '12px',
                          display: 'block',
                          marginTop: 6,
                        }}
                      >
                        {completed} / {total} completed ({overallPct}%) — ✅{' '}
                        {succeeded} ok
                        {failed > 0 && ` · ❌ ${failed} failed`}
                        {isUploading &&
                          totalSpeed > 0 &&
                          ` · ⚡ ${formatSpeed(totalSpeed)}`}
                      </Text>

                      {/* Per-file completion log (last 8) */}
                      {uploadProgress.some(
                        (p) => p.status === 'complete' || p.status === 'failed'
                      ) && (
                        <div style={{ marginTop: 12 }}>
                          {uploadProgress
                            .filter(
                              (p) =>
                                p.status === 'complete' || p.status === 'failed'
                            )
                            .slice(-8)
                            .map((item) => (
                              <div
                                key={item.fileName}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  background: '#faf9f8',
                                  marginBottom: 4,
                                  fontSize: '12px',
                                }}
                              >
                                <span>
                                  {item.status === 'complete' ? '✅' : '❌'}
                                </span>
                                <Text
                                  ellipsis
                                  title={item.fileName}
                                  style={{
                                    flex: 1,
                                    fontWeight: 500,
                                    fontSize: '12px',
                                  }}
                                >
                                  {item.fileName}
                                  {item.status === 'failed' && (
                                    <Text
                                      type="danger"
                                      style={{
                                        fontSize: '12px',
                                        marginLeft: 4,
                                      }}
                                    >
                                      — Failed
                                    </Text>
                                  )}
                                </Text>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
            </Form>
          </div>
        </div>

        {/* Section Toggle */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Title level={5} style={{ margin: 0, color: '#1f1f1f' }}>
                {showTrash
                  ? `🗑️ Trash (${deletedFiles.length})`
                  : `All Photos (${files.length})`}
              </Title>
              {onRefresh && (
                <Tooltip title="Refresh">
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined spin={fetching} />}
                    onClick={onRefresh}
                    disabled={fetching}
                  />
                </Tooltip>
              )}
            </div>
            <Button
              type={showTrash ? 'primary' : 'default'}
              icon={showTrash ? <UndoOutlined /> : <RestFilled />}
              size="small"
              onClick={() => onToggleTrash(!showTrash)}
              danger={showTrash}
            >
              {showTrash
                ? 'Back to Photos'
                : `Trash${deletedFiles.length > 0 ? ` (${deletedFiles.length})` : ''}`}
            </Button>
          </div>

          {/* Active Files View */}
          {!showTrash && (
            <>
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
                  <ImageGrid
                    files={paginatedFiles}
                    onRemoveFile={onRemoveFile}
                  />

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
            </>
          )}

          {/* Trash View */}
          {showTrash && (
            <>
              {deletedFilesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin />
                  <br />
                  <Text type="secondary" style={{ marginTop: 8 }}>
                    Loading deleted files...
                  </Text>
                </div>
              ) : deletedFiles.length === 0 ? (
                <Empty
                  description="Trash is empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ paddingTop: 40 }}
                />
              ) : (
                <Image.PreviewGroup>
                  <Row gutter={[12, 12]}>
                    {deletedFiles.map((albumFile: AlbumImage) => (
                      <Col key={albumFile.fileId} xs={24} sm={8} lg={6}>
                        <div
                          style={{
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#fff',
                            border: '1px dashed #ff4d4f',
                            opacity: 0.85,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            height: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.boxShadow =
                              '0 2px 8px rgba(255, 77, 79, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.85';
                            e.currentTarget.style.boxShadow = 'none';
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
                            <LazyImage
                              src={albumApi.getThumbnailUrl(albumFile.fileId)}
                              cacheKey={`trash-${albumFile.fileId}`}
                              alt={albumFile.image.name}
                              preview={{
                                src: albumApi.getOriginalContentUrl(
                                  albumFile.fileId
                                ),
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 0,
                              }}
                            />
                          </div>

                          {/* Action Buttons */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              display: 'flex',
                              gap: '4px',
                            }}
                          >
                            {/* Restore Button */}
                            {onRestoreFile && (
                              <Tooltip title="Restore">
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<UndoOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRestoreFile(albumFile.fileId);
                                  }}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    color: '#52c41a',
                                    borderColor: '#52c41a',
                                    borderRadius: '4px',
                                  }}
                                />
                              </Tooltip>
                            )}
                            {/* Force Delete Button */}
                            {onForceDeleteFile && (
                              <Tooltip title="Delete permanently">
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    modal.confirm({
                                      title: 'Permanently Delete',
                                      icon: <ExclamationCircleOutlined />,
                                      content: `Permanently delete "${albumFile.image.name}"? This will remove it from OneDrive and cannot be undone!`,
                                      okText: 'Delete Forever',
                                      okType: 'danger',
                                      cancelText: 'Cancel',
                                      onOk() {
                                        onForceDeleteFile(albumFile.fileId);
                                      },
                                    });
                                  }}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '4px',
                                  }}
                                />
                              </Tooltip>
                            )}
                          </div>

                          {/* Info Section */}
                          <div
                            style={{
                              padding: '8px',
                              borderTop: '1px solid #ffccc7',
                              minHeight: '48px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              background: '#fff2f0',
                            }}
                          >
                            <Text
                              ellipsis
                              title={albumFile.image.name}
                              style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#cf1322',
                                lineHeight: '1.4',
                              }}
                            >
                              {albumFile.image.name}
                            </Text>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
