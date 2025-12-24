import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  InputNumber,
  Switch,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productApi,
  categoryApi,
  type Product,
  type Category,
  type CreateProductRequest,
  type UpdateProductRequest,
} from '@lib';
import { useTheme } from '@hooks';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProductFormData {
  name: string;
  description?: string;
  price?: number;
  stockQty?: number;
  isActive?: boolean;
  categoryId?: string;
}

export function ProductManagement() {
  const { darkMode: isDark } = useTheme();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Forms
  const [createForm] = Form.useForm<ProductFormData>();
  const [editForm] = Form.useForm<ProductFormData>();

  // Queries
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', currentPage, pageSize, searchText],
    queryFn: () =>
      productApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => productApi.create(data),
    onSuccess: () => {
      messageApi.success('Product created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create product';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productApi.update(id, data),
    onSuccess: () => {
      messageApi.success('Product updated successfully');
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update product';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      messageApi.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete product';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: ProductFormData) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: ProductFormData) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    editForm.setFieldsValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQty: product.stockQty,
      isActive: product.isActive,
      categoryId: product.categoryId,
    });
    setIsEditModalOpen(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <ShoppingOutlined style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) =>
        text || <Text type="secondary">No description</Text>,
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text: string) =>
        text || <Text type="secondary">No category</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      align: 'right' as const,
    },
    {
      title: 'Stock',
      dataIndex: 'stockQty',
      key: 'stockQty',
      render: (stock: number) => <Text strong>{stock} units</Text>,
      align: 'right' as const,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Text strong style={{ color: isActive ? '#22c55e' : '#ef4444' }}>
          {isActive ? 'Active' : 'Inactive'}
        </Text>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
        backgroundColor: isDark ? '#111827' : '#f9fafb',
      }}
    >
      {contextHolder}

      {/* Header */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: '24px' }}
      >
        <Col>
          <Title
            level={2}
            style={{ margin: 0, color: isDark ? '#fff' : '#000' }}
          >
            Product Management
          </Title>
          <Text type="secondary">Manage your products and inventory</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            size="large"
          >
            Create Product
          </Button>
        </Col>
      </Row>

      {/* Search */}
      <Card
        style={{
          marginBottom: '24px',
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderColor: isDark ? '#374151' : '#d9d9d9',
        }}
      >
        <Input
          placeholder="Search products..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          allowClear
          style={{
            backgroundColor: isDark ? '#111827' : '#fff',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#374151' : '#d9d9d9',
          }}
        />
      </Card>

      {/* Table */}
      <Card
        style={{
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderColor: isDark ? '#374151' : '#d9d9d9',
        }}
      >
        <Table
          columns={columns}
          dataSource={productsData?.data || []}
          rowKey="id"
          loading={productsLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: productsData?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New Product"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
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
              options={
                categoriesData?.data?.map((cat: Category) => ({
                  label: cat.name,
                  value: cat.id,
                })) || []
              }
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

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Product"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
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
              options={
                categoriesData?.data?.map((cat: Category) => ({
                  label: cat.name,
                  value: cat.id,
                })) || []
              }
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

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
