import type { Permission, Role } from '@types';
import { Modal, Transfer } from 'antd';
import type { TransferProps } from 'antd';

interface PermissionTransferData {
  key: string;
  title: string;
  description: string;
}

interface RolePermissionModalProps {
  open: boolean;
  loading: boolean;
  selectedRole: Role | null;
  allPermissions: Permission[];
  assignedPermissionIds: string[];
  onAssignPermissions: (permissionIds: string[]) => void;
  onRevokePermissions: (permissionIds: string[]) => void;
  onCancel: () => void;
}

export function RolePermissionModal({
  open,
  loading,
  selectedRole,
  allPermissions,
  assignedPermissionIds,
  onAssignPermissions,
  onRevokePermissions,
  onCancel,
}: RolePermissionModalProps) {
  const handlePermissionChange: TransferProps['onChange'] = (
    _newTargetKeys,
    direction,
    moveKeys
  ) => {
    if (direction === 'right') {
      onAssignPermissions(moveKeys as string[]);
    } else {
      onRevokePermissions(moveKeys as string[]);
    }
  };

  const transferData: PermissionTransferData[] = allPermissions.map((p) => ({
    key: p.id,
    title: p.key,
    description: p.description || '',
  }));

  return (
    <Modal
      title={`Manage Permissions - ${selectedRole?.name}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      confirmLoading={loading}
    >
      <Transfer
        dataSource={transferData}
        titles={['Available', 'Assigned']}
        targetKeys={assignedPermissionIds}
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
        styles={{
          section: {
            width: 350,
            height: 400,
          },
        }}
        showSearch
        pagination={{
          showSizeChanger: true,
        }}
        filterOption={(inputValue, item) =>
          item.title!.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.description!.toLowerCase().includes(inputValue.toLowerCase())
        }
      />
    </Modal>
  );
}
