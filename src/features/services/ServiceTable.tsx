import {
  ActionButton,
  StaffTableScroll,
  StatusChip,
} from '@shared/components/ui';
import type { Service } from '@types';
import { formatMoneyVND } from '@utils/money';
import { Image, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ServiceTableProps {
  services: Service[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ServiceTable({
  services,
  loading,
  currentPage,
  pageSize,
  total,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: ServiceTableProps) {
  const columns: ColumnsType<Service> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description) => description || '-',
      ellipsis: true,
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl: string | null | undefined) => {
        if (!imageUrl) return '-';
        return <Image src={imageUrl} width={50} height={50} />;
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `${formatMoneyVND(price)}`,
    },
    {
      title: 'Job',
      dataIndex: ['job', 'name'],
      key: 'job',
      width: 180,
      render: (_, record) => record.job?.name || '-',
    },
    {
      title: 'Location',
      dataIndex: 'isLocation',
      key: 'isLocation',
      width: 110,
      render: (value: boolean | undefined) => (
        <StatusChip tone={value ? 'blue' : 'slate'}>
          {value ? 'Yes' : 'No'}
        </StatusChip>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'isTime',
      key: 'isTime',
      width: 110,
      render: (value: boolean | undefined) => (
        <StatusChip tone={value ? 'blue' : 'slate'}>
          {value ? 'Yes' : 'No'}
        </StatusChip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <StatusChip tone={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </StatusChip>
      ),
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
            popconfirmTitle="Delete Service"
            popconfirmDescription="Are you sure you want to delete this service?"
            onClick={() => onDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <StaffTableScroll minWidth={1300}>
      <Table
        className="staff-table"
        columns={columns}
        dataSource={services}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: onPageChange,
          onShowSizeChange: (_, size) => onPageSizeChange(size),
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} services`,
        }}
      />
    </StaffTableScroll>
  );
}
