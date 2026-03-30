import { Button } from 'antd';
import type { ComponentProps, ReactNode } from 'react';

type AntdButtonProps = ComponentProps<typeof Button>;

type StaffButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

interface StaffButtonProps extends Omit<AntdButtonProps, 'type' | 'variant'> {
  variant?: StaffButtonVariant;
  iconOnly?: boolean;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<StaffButtonVariant, string> = {
  primary:
    '!border-none !text-white staff-button-primary hover:!text-white focus:!text-white',
  secondary:
    '!border-slate-200 !bg-white !text-slate-700 hover:!border-slate-300 hover:!bg-slate-50 hover:!text-slate-900 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-100 dark:hover:!border-slate-600 dark:hover:!bg-slate-800',
  ghost:
    '!border-transparent !bg-transparent !text-slate-600 hover:!bg-slate-100 hover:!text-slate-900 dark:!text-slate-200 dark:hover:!bg-slate-800',
  danger:
    '!border-none !bg-rose-600 !text-white hover:!bg-rose-700 hover:!text-white focus:!text-white',
  link: '!border-none !bg-transparent !px-0 !shadow-none !text-sky-600 hover:!text-sky-700 dark:!text-sky-300 dark:hover:!text-sky-200',
};

const SIZE_CLASSES = {
  small: '!h-9 !rounded-xl !px-3 !text-sm',
  middle: '!h-10 !rounded-2xl !px-4 !text-sm',
  large: '!h-11 !rounded-2xl !px-5 !text-sm',
} as const;

export function StaffButton({
  variant = 'secondary',
  size = 'middle',
  className = '',
  iconOnly = false,
  children,
  ...buttonProps
}: StaffButtonProps) {
  const sizeClass =
    SIZE_CLASSES[size as keyof typeof SIZE_CLASSES] ?? SIZE_CLASSES.middle;

  return (
    <Button
      {...buttonProps}
      type={variant === 'link' ? 'link' : 'default'}
      className={`!inline-flex !items-center !justify-center !gap-2 !font-medium !shadow-none transition-all duration-200 ${sizeClass} ${iconOnly ? '!w-10 !px-0' : ''} ${VARIANT_CLASSES[variant]} ${className}`.trim()}
    >
      {children}
    </Button>
  );
}
