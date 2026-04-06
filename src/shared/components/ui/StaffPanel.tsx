import { Card } from 'antd';
import type { ReactNode } from 'react';

interface StaffPanelProps {
  children: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  className?: string;
  bodyClassName?: string;
  bodyPadding?: number;
}

export function StaffPanel({
  children,
  title,
  extra,
  className = '',
  bodyClassName = '',
  bodyPadding = 20,
}: StaffPanelProps) {
  return (
    <Card
      title={title}
      extra={extra}
      className={`staff-surface staff-panel !border-0 ${className}`.trim()}
      styles={{
        body: {
          padding: bodyPadding,
        },
      }}
    >
      <div className={bodyClassName}>{children}</div>
    </Card>
  );
}
