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
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  categoryApi,
  type Category,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from '@lib';
import { useTheme } from '@hooks';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CategoryFormData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export function CategoryManagement() {
  const { darkMode: isDark } = useTheme();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Forms
  const [createForm] = Form.useForm<CategoryFormData>();
  const [editForm] = Form.useForm<CategoryFormData>();

  // Queries
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', currentPage, pageSize, searchText],
    queryFn: () =>
      categoryApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      messageApi.success('Category created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create category';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      messageApi.success('Category updated successfully');
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update category';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      messageApi.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete category';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: CategoryFormData) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: CategoryFormData) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    editForm.setFieldsValue({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
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
          <TagOutlined style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
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
      render: (_: unknown, record: Category) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
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
            Category Management
          </Title>
          <Text type="secondary">Manage product categories</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            size="large"
          >
            Create Category
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
          placeholder="Search categories..."
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
          dataSource={categoriesData?.data || []}
          rowKey="id"
          loading={categoriesLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: categoriesData?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New Category"
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
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter category name' },
              {
                max: 255,
                message: 'Category name cannot exceed 255 characters',
              },
            ]}
          >
            <Input placeholder="e.g., Flowers, Cakes, Decorations, etc." />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Describe the category" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter category name' },
              {
                max: 255,
                message: 'Category name cannot exceed 255 characters',
              },
            ]}
          >
            <Input placeholder="e.g., Flowers, Cakes, Decorations, etc." />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Describe the category" />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
