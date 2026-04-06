import type { ReactNode } from 'react';

interface StaffTableScrollProps {
  children: ReactNode;
  minWidth?: number | string;
  className?: string;
}

export function StaffTableScroll({
  children,
  minWidth,
  className = '',
}: StaffTableScrollProps) {
  return (
    <div className={`staff-table-scroll ${className}`.trim()}>
      <div
        className="staff-table-scroll__content"
        style={minWidth ? { minWidth } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
