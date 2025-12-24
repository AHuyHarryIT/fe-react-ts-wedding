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
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Transfer,
  Tooltip,
} from 'antd';
import type { TransferProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  roleApi,
  permissionApi,
  type Role,
  type Permission,
  type CreateRoleRequest,
  type UpdateRoleRequest,
} from '../../lib/api';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface RoleFormData {
  name: string;
  description?: string;
}

export function RoleManagement() {
  const { darkMode: isDark } = useTheme();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Forms
  const [createForm] = Form.useForm<RoleFormData>();
  const [editForm] = Form.useForm<RoleFormData>();

  // Queries
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', currentPage, pageSize, searchText],
    queryFn: () =>
      roleApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
      }),
  });

  // Fetch all permissions across multiple pages
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const allPermissions: Permission[] = [];
      const pageLimit = 100;

      // Fetch first page to get total pages
      const firstPage = await permissionApi.list({ page: 1, limit: pageLimit });
      allPermissions.push(...firstPage.data);

      const { totalPages } = firstPage.pagination;

      // Fetch remaining pages in parallel
      if (totalPages > 1) {
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, i) => i + 2
        );

        const remainingData = await Promise.all(
          remainingPages.map((page) =>
            permissionApi.list({ page, limit: pageLimit })
          )
        );

        remainingData.forEach((response) => {
          allPermissions.push(...response.data);
        });
      }

      return { data: allPermissions };
    },
  });

  const { data: rolePermissionsData } = useQuery({
    queryKey: ['role-permissions', selectedRole?.id],
    queryFn: () => roleApi.getPermissions(selectedRole!.id),
    enabled: !!selectedRole && isPermissionModalOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.create(data),
    onSuccess: () => {
      messageApi.success('Role created successfully');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create role';
      messageApi.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      roleApi.update(id, data),
    onSuccess: () => {
      messageApi.success('Role updated successfully');
      setIsEditModalOpen(false);
      setSelectedRole(null);
      editForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update role';
      messageApi.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      messageApi.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete role';
      messageApi.error(errorMessage);
    },
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => roleApi.assignPermissions(id, { permissionIds }),
    onSuccess: () => {
      messageApi.success('Permissions assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to assign permissions';
      messageApi.error(errorMessage);
    },
  });

  const revokePermissionsMutation = useMutation({
    mutationFn: ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => roleApi.revokePermissions(id, { permissionIds }),
    onSuccess: () => {
      messageApi.success('Permissions revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to revoke permissions';
      messageApi.error(errorMessage);
    },
  });

  // Handlers
  const handleCreate = (values: RoleFormData) => {
    createMutation.mutate(values);
  };

  const handleEdit = (values: RoleFormData) => {
    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, data: values });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    editForm.setFieldsValue({
      name: role.name,
      description: role.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  const handlePermissionChange: TransferProps['onChange'] = (
    _newTargetKeys,
    direction,
    moveKeys
  ) => {
    if (!selectedRole) return;

    if (direction === 'right') {
      // Assign permissions
      assignPermissionsMutation.mutate({
        id: selectedRole.id,
        permissionIds: moveKeys as string[],
      });
    } else {
      // Revoke permissions
      revokePermissionsMutation.mutate({
        id: selectedRole.id,
        permissionIds: moveKeys as string[],
      });
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <SafetyOutlined style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
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
      title: 'Permissions',
      key: 'permissions',
      render: (_: unknown, record: Role) => (
        <Space size={[0, 8]} wrap>
          {record.permissions && record.permissions.length > 0 ? (
            <>
              {record.permissions.slice(0, 3).map((rp) => (
                <Tag key={rp.permissionId} color="blue">
                  {rp.permission.key}
                </Tag>
              ))}
              {record.permissions.length > 3 && (
                <Tag color="default">+{record.permissions.length - 3} more</Tag>
              )}
            </>
          ) : (
            <Text type="secondary">No permissions</Text>
          )}
        </Space>
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
      render: (_: unknown, record: Role) => (
        <Space>
          <Tooltip title="Manage Permissions">
            <Button
              type="link"
              icon={<SafetyOutlined />}
              onClick={() => handleOpenPermissions(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Role"
            description="Are you sure you want to delete this role?"
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

  // Transfer data source
  const allPermissions = permissionsData?.data || [];
  const currentPermissionIds =
    rolePermissionsData?.data?.map((p: Permission) => p.id) || [];

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
            Role Management
          </Title>
          <Text type="secondary">Manage roles and their permissions</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            size="large"
          >
            Create Role
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
          placeholder="Search roles..."
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
          dataSource={rolesData?.data || []}
          rowKey="id"
          loading={rolesLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: rolesData?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} roles`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New Role"
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
            label="Role Name"
            rules={[
              { required: true, message: 'Please enter role name' },
              { max: 255, message: 'Role name cannot exceed 255 characters' },
            ]}
          >
            <Input placeholder="e.g., Admin, Manager, User" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              rows={4}
              placeholder="Describe the purpose of this role"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Role"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedRole(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="name"
            label="Role Name"
            rules={[
              { required: true, message: 'Please enter role name' },
              { max: 255, message: 'Role name cannot exceed 255 characters' },
            ]}
          >
            <Input placeholder="e.g., Admin, Manager, User" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              rows={4}
              placeholder="Describe the purpose of this role"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Permission Management Modal */}
      <Modal
        title={`Manage Permissions - ${selectedRole?.name}`}
        open={isPermissionModalOpen}
        onCancel={() => {
          setIsPermissionModalOpen(false);
          setSelectedRole(null);
        }}
        footer={null}
        width={800}
      >
        <Transfer
          dataSource={allPermissions.map((p) => ({
            key: p.id,
            title: p.key,
            description: p.description || '',
          }))}
          titles={['Available', 'Assigned']}
          targetKeys={currentPermissionIds}
          onChange={handlePermissionChange}
          render={(item) => (
            <div>
              <div style={{ fontWeight: 500 }}>{item.title}</div>
              {item.description && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {item.description}
                </div>
              )}
            </div>
          )}
          listStyle={{
            width: 350,
            height: 400,
          }}
          showSearch
          pagination={{
            pageSize: 10,
          }}
          filterOption={(inputValue, item) =>
            item.title!.toLowerCase().includes(inputValue.toLowerCase()) ||
            item.description!.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
      </Modal>
    </div>
  );
}
