import {
  ActionButton,
  StaffButton,
  StaffTableScroll,
  StatusChip,
} from '@shared/components/ui';
import type { Job } from '@types';
import { Empty, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

interface JobTableProps {
  jobs: Job[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function JobTable({
  jobs,
  loading,
  currentPage,
  pageSize,
  total,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
  onPageSizeChange,
}: JobTableProps) {
  const columns: ColumnsType<Job> = [
    {
      title: 'Job Name',
      dataIndex: 'name',
      key: 'name',
      width: 260,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 420,
      render: (description: Job['description']) => description || '-',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <StatusChip tone={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </StatusChip>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 190,
      render: (_, record) => (
        <Space size="small">
          <ActionButton
            action="edit"
            size="small"
            onClick={() => onEdit(record)}
          />
          <ActionButton
            action="delete"
            size="small"
            popconfirmTitle="Delete Job"
            popconfirmDescription="Are you sure you want to delete this job?"
            onClick={() => onDelete(record.id)}
          />
          <StaffButton
            variant={record.isActive ? 'ghost' : 'primary'}
            size="small"
            icon={
              record.isActive ? (
                <PauseCircleOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => onToggleStatus(record.id)}
          >
            {record.isActive ? 'Deactivate' : 'Activate'}
          </StaffButton>
        </Space>
      ),
    },
  ];

  return (
    <StaffTableScroll minWidth={1080}>
      <Table
        className="staff-table"
        columns={columns}
        dataSource={jobs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: onPageChange,
          onShowSizeChange: (_, size) => onPageSizeChange(size),
          showSizeChanger: true,
          showTotal: (count) => `Total ${count} jobs`,
        }}
        locale={{
          emptyText: <Empty description="No jobs found" />,
        }}
      />
    </StaffTableScroll>
  );
}
