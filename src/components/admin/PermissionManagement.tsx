import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Space, Table, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useTheme } from '../../hooks';
import { permissionApi } from '../../lib';

const { Title, Text } = Typography;

export function PermissionManagement() {
  const { darkMode } = useTheme();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['permissions', page, limit, search],
    queryFn: () => permissionApi.list({ page, limit, search }),
  });

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {key}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string | null) => (
        <Text style={{ color: darkMode ? '#d1d5db' : '#475569' }}>
          {description || '-'}
        </Text>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text style={{ color: darkMode ? '#9ca3af' : '#64748b' }}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      ),
    },
  ];

  return (
    <>
      <div className="px-6 py-8">
        <div className="mb-6">
          <Title
            level={2}
            className="!mb-2"
            style={{ color: darkMode ? '#f9fafb' : '#111827' }}
          >
            Permission Management
          </Title>
          <Text
            style={{
              fontSize: '14px',
              color: darkMode ? '#9ca3af' : '#64748b',
            }}
          >
            View and manage system permissions
          </Text>
        </div>

        <Card
          style={{
            background: darkMode
              ? 'rgba(31, 41, 55, 0.5)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: 'none',
          }}
          className="shadow-lg"
        >
          <div className="mb-4 flex justify-between items-center">
            <Space>
              <Input
                placeholder="Search permissions..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: 300,
                  background: darkMode ? '#374151' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#111827',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                style={{
                  background: darkMode ? '#374151' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#111827',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                }}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.pagination?.total || 0,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setLimit(newPageSize || 10);
              },
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} permissions`,
            }}
            style={{
              background: 'transparent',
            }}
          />
        </Card>
      </div>
    </>
  );
}
