import { Modal, Descriptions, Tag, Divider, List, Empty } from 'antd';
import type { Package } from '@types';
import { formatMoneyVND } from '@utils/money';

interface PackageDetailModalProps {
  open: boolean;
  package: Package | null;
  onClose: () => void;
}

export function PackageDetailModal({
  open,
  package: packageItem,
  onClose,
}: PackageDetailModalProps) {
  if (!packageItem) {
    return null;
  }

  return (
    <Modal
      title="Package Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Name" span={2}>
          {packageItem.name}
        </Descriptions.Item>

        <Descriptions.Item label="Description" span={2}>
          {packageItem.description || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Price">
          {formatMoneyVND(packageItem.price || 0)}
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={packageItem.isActive ? 'green' : 'red'}>
            {packageItem.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Created At" span={2}>
          {new Date(packageItem.createdAt).toLocaleString()}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At" span={2}>
          {new Date(packageItem.updatedAt).toLocaleString()}
        </Descriptions.Item>

        {packageItem.deletedAt && (
          <Descriptions.Item label="Deleted At" span={2}>
            {new Date(packageItem.deletedAt).toLocaleString()}
          </Descriptions.Item>
        )}
      </Descriptions>

      {packageItem.services && packageItem.services.length > 0 && (
        <>
          <Divider>Associated Services</Divider>
          <List
            dataSource={packageItem.services}
            renderItem={(item) => (
              <List.Item key={item.serviceId}>
                <List.Item.Meta
                  title={item.service?.name || 'Unknown Service'}
                  description={
                    item.service?.description
                      ? `${formatMoneyVND(item.service.price || 0)} - ${item.service.description}`
                      : `${formatMoneyVND(item.service?.price || 0)}`
                  }
                />
              </List.Item>
            )}
            locale={{
              emptyText: <Empty description="No services associated" />,
            }}
          />
        </>
      )}
    </Modal>
  );
}
