import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Popconfirm } from 'antd';
import type { ComponentProps, ReactNode } from 'react';
import { StaffButton } from './StaffButton';

type AntdButtonProps = ComponentProps<typeof StaffButton>;

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
  variant?: ComponentProps<typeof StaffButton>['variant'];
  popconfirmTitle?: string;
  popconfirmDescription?: string;
  showIcon?: boolean;
}

const ACTION_DEFAULTS: Record<
  Exclude<ActionType, 'custom'>,
  {
    label: string;
    icon: ReactNode;
    variant?: ComponentProps<typeof StaffButton>['variant'];
    danger?: boolean;
  }
> = {
  view: {
    label: 'View',
    icon: <EyeOutlined />,
    variant: 'secondary',
  },
  edit: {
    label: 'Edit',
    icon: <EditOutlined />,
    variant: 'secondary',
  },
  delete: {
    label: 'Delete',
    icon: <DeleteOutlined />,
    variant: 'danger',
  },
  create: {
    label: 'Create',
    icon: <PlusOutlined />,
    variant: 'primary',
  },
  save: {
    label: 'Save',
    icon: <SaveOutlined />,
    variant: 'primary',
  },
  cancel: {
    label: 'Cancel',
    icon: <StopOutlined />,
    variant: 'ghost',
  },
};

export function ActionButton({
  action,
  label,
  variant,
  icon,
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
      <StaffButton
        variant={variant ?? actionDefaults?.variant}
        icon={displayIcon}
        {...restButtonProps}
      >
        {children ?? label ?? actionDefaults?.label}
      </StaffButton>
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
    <StaffButton
      variant={variant ?? actionDefaults?.variant}
      icon={displayIcon}
      {...buttonProps}
    >
      {children ?? label ?? actionDefaults?.label}
    </StaffButton>
  );
}
