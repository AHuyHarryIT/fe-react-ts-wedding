import { PlusOutlined } from '@ant-design/icons';
import { Form, Upload, Image, type UploadFile } from 'antd';
import type { FormInstance } from 'antd';
import type { UploadChangeParam, UploadProps } from 'antd/es/upload';
import { useState } from 'react';
import { CloudinaryImage } from './CloudinaryImage';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

interface ImageUploadProps<T extends object> {
  form: FormInstance<T>;
  fieldName: string;
  label?: string;
  currentImageUrl?: string | null;
  maxCount?: number;
  maxSizeMB?: number;
  multiple?: boolean;
  uploadText?: string;
  showInlinePreview?: boolean;
}

export function ImageUpload<T extends object>({
  form,
  fieldName,
  label = 'Image',
  currentImageUrl,
  maxCount = 1,
  maxSizeMB = 5,
  multiple = false,
  uploadText = 'Upload Image',
  showInlinePreview = true,
}: ImageUploadProps<T>) {
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUploadImage, setPreviewUploadImage] = useState('');
  const maxImageSizeBytes = maxSizeMB * 1024 * 1024;
  const fieldPath = fieldName as unknown as Parameters<
    FormInstance<T>['setFieldValue']
  >[0];
  const validationPaths = [fieldName] as unknown as Parameters<
    FormInstance<T>['validateFields']
  >[0];
  const formFieldName = fieldName as unknown as Parameters<
    FormInstance<T>['setFields']
  >[0][number]['name'];

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const getImageValidationError = (file?: File) => {
    if (!file) {
      return null;
    }

    const fileName = file.name.toLowerCase();
    const hasValidType =
      ALLOWED_IMAGE_TYPES.has(file.type) ||
      ALLOWED_IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!hasValidType) {
      return 'Only JPG, JPEG, PNG, GIF, and WEBP files are allowed.';
    }

    if (file.size > maxImageSizeBytes) {
      return `Image size must be ${maxSizeMB}MB or smaller.`;
    }

    return null;
  };

  const validateImage = (_: unknown, file?: File) => {
    if (multiple) {
      return Promise.resolve();
    }

    const error = getImageValidationError(file);
    if (error) {
      return Promise.reject(new Error(error));
    }

    return Promise.resolve();
  };

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    const error = getImageValidationError(file as File);
    if (error) {
      setImageList([]);
      setPreviewImage(undefined);
      form.setFieldValue(fieldPath, undefined);
      form.setFields([{ name: formFieldName, errors: [error] }]);
      return Upload.LIST_IGNORE;
    }

    form.setFields([{ name: formFieldName, errors: [] }]);
    return false;
  };

  const handleUploadChange = (info: UploadChangeParam) => {
    const nextFileList = info.fileList.slice(-maxCount);
    setImageList(nextFileList);
    if (multiple) {
      const files = nextFileList
        .map((item) => item.originFileObj)
        .filter((file) => file instanceof File) as File[];
      form.setFieldValue(fieldPath, files);
      form.validateFields(validationPaths);
      return;
    }

    if (nextFileList.length > 0) {
      const file = nextFileList[nextFileList.length - 1].originFileObj;
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        form.setFieldValue(fieldPath, file);
        form.validateFields(validationPaths);
      }
    } else {
      setPreviewImage(undefined);
      form.setFieldValue(fieldPath, undefined);
      form.validateFields(validationPaths);
    }
  };

  const handlePreview: UploadProps['onPreview'] = async (file) => {
    if (!file.url && !file.preview && file.originFileObj instanceof File) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewUploadImage(
      file.url || (file.preview as string) || currentImageUrl || ''
    );
    setPreviewOpen(true);
  };

  return (
    <>
      <Form.Item
        name={fieldName as never}
        label={label}
        rules={[{ validator: validateImage }]}
      >
        <Upload
          listType="picture-card"
          multiple={multiple}
          maxCount={maxCount}
          beforeUpload={handleBeforeUpload}
          accept="image/*"
          onChange={handleUploadChange}
          onPreview={handlePreview}
        >
          {imageList.length < maxCount && (
            <div>
              <PlusOutlined />
              <div className="mt-2">{uploadText}</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      {showInlinePreview && previewImage && (
        <Form.Item label="Preview">
          <CloudinaryImage
            width={200}
            src={previewImage}
            alt="Service preview"
            cloudinaryCropMode="fit"
          />
        </Form.Item>
      )}

      {currentImageUrl && !previewImage && (
        <Form.Item label="Current Image">
          <CloudinaryImage
            width={200}
            src={currentImageUrl}
            alt="Current service image"
            cloudinaryCropMode="fit"
          />
        </Form.Item>
      )}

      {previewUploadImage && (
        <Image
          styles={{ root: { display: 'none' } }}
          preview={{
            open: previewOpen,
            onOpenChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewUploadImage(''),
          }}
          src={previewUploadImage}
        />
      )}
    </>
  );
}
