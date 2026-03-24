import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import type { ComponentProps, ReactNode } from 'react';

type AntdButtonProps = ComponentProps<typeof Button>;

export type ActionType =
  | 'view'
  | 'edit'
  | 'delete'
  | 'create'
  | 'save'
  | 'cancel'
  | 'custom';

interface ActionButtonProps extends Omit<AntdButtonProps, 'type'> {
  action: ActionType;
  label?: ReactNode;
  buttonType?: AntdButtonProps['type'];
  popconfirmTitle?: string;
  popconfirmDescription?: string;
  showIcon?: boolean;
}

const ACTION_DEFAULTS: Record<
  Exclude<ActionType, 'custom'>,
  {
    label: string;
    icon: ReactNode;
    type?: AntdButtonProps['type'];
    danger?: boolean;
  }
> = {
  view: {
    label: 'View',
    icon: <EyeOutlined />,
    type: 'primary',
  },
  edit: {
    label: 'Edit',
    icon: <EditOutlined />,
    type: 'primary',
  },
  delete: {
    label: 'Delete',
    icon: <DeleteOutlined />,
    danger: true,
  },
  create: {
    label: 'Create',
    icon: <PlusOutlined />,
    type: 'primary',
  },
  save: {
    label: 'Save',
    icon: <SaveOutlined />,
    type: 'primary',
  },
  cancel: {
    label: 'Cancel',
    icon: <StopOutlined />,
  },
};

export function ActionButton({
  action,
  label,
  buttonType,
  icon,
  danger,
  children,
  popconfirmTitle,
  popconfirmDescription,
  showIcon = true,
  ...buttonProps
}: ActionButtonProps) {
  const actionDefaults =
    action === 'custom' ? undefined : ACTION_DEFAULTS[action];
  const displayIcon = showIcon ? (icon ?? actionDefaults?.icon) : undefined;

  if (action === 'delete') {
    const { onClick, ...restButtonProps } = buttonProps;

    const deleteButton = (
      <Button
        type={buttonType ?? actionDefaults?.type}
        danger={danger ?? actionDefaults?.danger}
        icon={displayIcon}
        {...restButtonProps}
      >
        {children ?? label ?? actionDefaults?.label}
      </Button>
    );

    return (
      <Popconfirm
        title={popconfirmTitle ?? 'Delete'}
        description={
          popconfirmDescription ?? 'Are you sure you want to delete this item?'
        }
        onConfirm={() =>
          onClick?.(
            new MouseEvent('click') as unknown as React.MouseEvent<HTMLElement>
          )
        }
        okText="Yes"
        cancelText="No"
      >
        {deleteButton}
      </Popconfirm>
    );
  }

  return (
    <Button
      type={buttonType ?? actionDefaults?.type}
      danger={danger ?? actionDefaults?.danger}
      icon={displayIcon}
      {...buttonProps}
    >
      {children ?? label ?? actionDefaults?.label}
    </Button>
  );
}
