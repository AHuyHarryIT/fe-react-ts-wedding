import type { Category, Product } from '@types';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Upload,
  Image,
  type UploadFile,
} from 'antd';
import { type FormInstance } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { UploadChangeParam } from 'antd/es/upload';

const { TextArea } = Input;

interface ProductFormData {
  name: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
  image?: UploadFile[];
}

interface ProductFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedProduct: Product | null;
  form: FormInstance<ProductFormData>;
  categories: Category[];
  onCancel: () => void;
  onSubmit: (values: ProductFormData) => void;
}

export function ProductFormModal({
  type,
  open,
  loading,
  selectedProduct,
  form,
  categories,
  onCancel,
  onSubmit,
}: ProductFormModalProps) {
  const isEditMode = type === 'edit' && selectedProduct;
  const title = isEditMode ? 'Edit Product' : 'Create New Product';
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);

  const handleUploadChange = (info: UploadChangeParam) => {
    setImageList(info.fileList);
    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      if (file instanceof File) {
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPreviewImage(undefined);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Product Name"
          rules={[
            { required: true, message: 'Please enter product name' },
            {
              max: 255,
              message: 'Product name cannot exceed 255 characters',
            },
          ]}
        >
          <Input placeholder="e.g., Wedding Cake, Flowers, etc." />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Describe the product" />
        </Form.Item>

        <Form.Item name="categoryId" label="Category">
          <Select
            placeholder="Select a category"
            allowClear
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price ($)"
          rules={[{ type: 'number', min: 0 }]}
          initialValue={0}
        >
          <InputNumber
            placeholder="0.00"
            min={0}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="stockQty"
          label="Stock Quantity"
          rules={[{ type: 'number', min: 0 }]}
          initialValue={0}
        >
          <InputNumber placeholder="0" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="image" label="Product Image">
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
            accept="image/*"
            onChange={handleUploadChange}
          >
            {imageList.length === 0 && (
              <div>
                <PlusOutlined />
                <div className="mt-2">Upload Image</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {previewImage && (
          <Form.Item label="Preview">
            <Image width={200} src={previewImage} alt="Product preview" />
          </Form.Item>
        )}

        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
          initialValue={!isEditMode}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
