import type { Role, UserWithRoles } from '@types';
import type { TransferProps } from 'antd';
import { Modal, Transfer } from 'antd';

interface UserRoleModalProps {
  open: boolean;
  loading: boolean;
  user: UserWithRoles | null;
  roles: Role[];
  onCancel: () => void;
  onAssign: (roleIds: string[]) => void;
  onRemove: (roleIds: string[]) => void;
}

export function UserRoleModal({
  open,
  loading,
  user,
  roles,
  onCancel,
  onAssign,
  onRemove,
}: UserRoleModalProps) {
  const currentRoleIds = user?.roles?.map((r) => r.id) || [];

  const handleRoleChange: TransferProps['onChange'] = (
    _newTargetKeys,
    direction,
    moveKeys
  ) => {
    if (direction === 'right') {
      onAssign(moveKeys as string[]);
    } else {
      onRemove(moveKeys as string[]);
    }
  };

  const transferData = roles.map((role) => ({
    key: role.id,
    title: role.name,
  }));

  return (
    <Modal
      title={`Manage Roles for ${user?.firstName} ${user?.lastName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      confirmLoading={loading}
    >
      <Transfer
        dataSource={transferData}
        titles={['Available Roles', 'Assigned Roles']}
        targetKeys={currentRoleIds}
        onChange={handleRoleChange}
        render={(item) => item.title}
        styles={{
          section: {
            width: '100%',
            // height: 300,
          },
        }}
        showSearch
        pagination={{
          showSizeChanger: true,
        }}
        filterOption={(inputValue, item) =>
          item.title!.toLowerCase().includes(inputValue.toLowerCase())
        }
        locale={{
          itemUnit: 'role',
          itemsUnit: 'roles',
        }}
      />
    </Modal>
  );
}
