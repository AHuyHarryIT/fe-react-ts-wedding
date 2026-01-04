import { Modal, Select, Button, Space, Divider, Empty, Tag, Card } from 'antd';
import { useState, useEffect } from 'react';
import type { Role, UserWithRoles } from '@types';

interface UserRoleModalProps {
  open: boolean;
  loading: boolean;
  user: UserWithRoles | null;
  roles: Role[];
  isFetchingNextPage?: boolean;
  onCancel: () => void;
  onAssign: (roleIds: string[]) => void;
  onRemove: (roleIds: string[]) => void;
  onRoleScrollEnd?: () => void;
}

export function UserRoleModal({
  open,
  loading,
  user,
  roles,
  isFetchingNextPage,
  onCancel,
  onAssign,
  onRemove,
  onRoleScrollEnd,
}: UserRoleModalProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const currentRoleIds = user?.roles?.map((r) => r.id) || [];
  const availableRoles = roles.filter((r) => !currentRoleIds.includes(r.id));

  useEffect(() => {
    setSelectedRoleIds([]);
  }, [open]);

  const handleAssign = () => {
    if (selectedRoleIds.length > 0) {
      onAssign(selectedRoleIds);
      setSelectedRoleIds([]);
    }
  };

  const handleRemove = (roleId: string) => {
    onRemove([roleId]);
  };

  return (
    <Modal
      title={`Manage Roles for ${user?.firstName} ${user?.lastName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div style={{ marginBottom: 24 }}>
        <h3>Current Roles</h3>
        {user?.roles && user.roles.length > 0 ? (
          <Card>
            <Space wrap>
              {user.roles.map((role) => (
                <Tag
                  key={role.id}
                  closable
                  onClose={() => handleRemove(role.id)}
                  color="blue"
                >
                  {role.name}
                </Tag>
              ))}
            </Space>
          </Card>
        ) : (
          <Card>
            <Empty description="No roles assigned" style={{ margin: 0 }} />
          </Card>
        )}
      </div>

      <Divider />

      <div style={{ marginBottom: 24 }}>
        <h3>Assign New Roles</h3>
        <Select
          mode="multiple"
          placeholder="Select roles to assign"
          loading={isFetchingNextPage}
          style={{ width: '100%', marginBottom: 16 }}
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          options={availableRoles.map((role) => ({
            label: role.name,
            value: role.id,
          }))}
          dropdownRender={(menu) => (
            <>
              {menu}
              {onRoleScrollEnd && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <Button
                    onClick={onRoleScrollEnd}
                    loading={isFetchingNextPage}
                    style={{ width: '100%' }}
                    type="dashed"
                  >
                    Show more
                  </Button>
                </div>
              )}
            </>
          )}
        />
        <Button
          type="primary"
          onClick={handleAssign}
          disabled={selectedRoleIds.length === 0}
          loading={loading}
          block
        >
          Assign Selected Roles
        </Button>
      </div>

      <Divider />

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Close</Button>
      </Space>
    </Modal>
  );
}
