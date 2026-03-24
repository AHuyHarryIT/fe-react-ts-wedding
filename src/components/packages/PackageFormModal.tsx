import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Space,
  List,
  Typography,
} from 'antd';
import { type FormInstance } from 'antd';
import type { Package, Service } from '@types';
import { useEffect, useState } from 'react';
import { ImageUpload } from '@components/ui/ImageUpload';
import { CloudinaryImage } from '@components/ui/CloudinaryImage';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { TextArea } = Input;

interface PackageFormData {
  name: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  serviceIds?: string[];
  coverImage?: File;
  galleryImages?: File[];
  galleryOrder?: string[];
}

interface PackageFormModalProps {
  type: 'create' | 'edit';
  open: boolean;
  loading: boolean;
  selectedPackage: Package | null;
  form: FormInstance<PackageFormData>;
  services: Service[];
  onCancel: () => void;
  onSubmit: (values: PackageFormData) => void;
}

interface SortableGalleryItemProps {
  id: string;
  imageUrl: string;
  label: string;
}

function SortableGalleryItem({
  id,
  imageUrl,
  label,
}: SortableGalleryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <List.Item
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
        touchAction: 'none',
        opacity: isDragging ? 0.6 : 1,
        background: isDragging ? 'rgba(0,0,0,0.02)' : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <Space>
        <CloudinaryImage
          width={64}
          height={64}
          src={imageUrl}
          alt={label}
          cloudinaryCropMode="fill"
        />
        <span>{label}</span>
      </Space>
    </List.Item>
  );
}

export function PackageFormModal({
  type,
  open,
  loading,
  selectedPackage,
  form,
  services,
  onCancel,
  onSubmit,
}: PackageFormModalProps) {
  const isEditMode = type === 'edit' && selectedPackage;
  const title = isEditMode ? 'Edit Package' : 'Create New Package';
  const [galleryOrder, setGalleryOrder] = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode && selectedPackage?.images) {
      const orderedIds = [...selectedPackage.images]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => image.id);
      setGalleryOrder(orderedIds);
      form.setFieldValue('galleryOrder', orderedIds);
    } else {
      setGalleryOrder([]);
      form.setFieldValue('galleryOrder', []);
    }
  }, [open, isEditMode, selectedPackage, form]);

  const handleGalleryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = galleryOrder.indexOf(String(active.id));
    const newIndex = galleryOrder.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const next = arrayMove(galleryOrder, oldIndex, newIndex);
    setGalleryOrder(next);
    form.setFieldValue('galleryOrder', next);
  };

  const orderedExistingImages =
    isEditMode && selectedPackage?.images
      ? [...selectedPackage.images].sort(
          (a, b) => galleryOrder.indexOf(a.id) - galleryOrder.indexOf(b.id)
        )
      : [];

  return (
    <Modal
      title={title}
      width={1000}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      loading={loading}
      okText={isEditMode ? 'Update' : 'Create'}
      destroyOnHidden
    >
      <Form<PackageFormData> form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Package Name"
          rules={[
            { required: true, message: 'Please enter package name' },
            {
              max: 255,
              message: 'Package name cannot exceed 255 characters',
            },
          ]}
        >
          <Input placeholder="e.g., Premium Wedding Package, Silver Package, etc." />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea
            rows={4}
            placeholder="Describe what's included in this package"
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price (VND)"
          rules={[{ type: 'number', min: 0 }]}
        >
          <InputNumber placeholder="0" step={1000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="serviceIds"
          label="Services"
          rules={[
            {
              required: true,
              message: 'Please select at least one service',
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select services to include in this package"
            showSearch={{ optionFilterProp: 'label' }}
            options={services.map((service) => ({
              label: service.name,
              value: service.id,
            }))}
          />
        </Form.Item>

        <ImageUpload
          form={form}
          fieldName="coverImage"
          label="Cover Image"
          currentImageUrl={
            isEditMode ? selectedPackage?.coverImageUrl : undefined
          }
          maxCount={1}
          maxSizeMB={5}
        />

        <ImageUpload
          form={form}
          fieldName="galleryImages"
          label="Gallery Images"
          maxCount={12}
          maxSizeMB={5}
          multiple
          uploadText="Upload Gallery"
          showInlinePreview={false}
        />

        {orderedExistingImages.length > 0 && (
          <Form.Item label="Gallery Order (Existing Images)">
            <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
              Drag and drop images to set display order.
            </Typography.Paragraph>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleGalleryDragEnd}
            >
              <SortableContext
                items={orderedExistingImages.map((image) => image.id)}
                strategy={verticalListSortingStrategy}
              >
                <List
                  size="small"
                  bordered
                  dataSource={orderedExistingImages}
                  renderItem={(image, index) => (
                    <SortableGalleryItem
                      id={image.id}
                      imageUrl={image.imageUrl}
                      label={`Image ${index + 1}`}
                    />
                  )}
                />
              </SortableContext>
            </DndContext>
          </Form.Item>
        )}

        <Form.Item name="galleryOrder" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
