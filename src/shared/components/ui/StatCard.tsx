import { Card } from 'antd';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  accent: string;
  darkMode?: boolean;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function StatCard({
  title,
  value,
  icon,
  accent,
  darkMode = false,
  className = '',
  align = 'start',
}: StatCardProps) {
  return (
    <Card
      className={`staff-surface staff-stat-card !h-full !w-full !border-0 ${className}`.trim()}
      styles={{ body: { height: '100%' } }}
    >
      <div className="flex h-full min-h-[110px] flex-col">
        <div className="flex items-center justify-between gap-4">
          <div
            className="text-sm font-medium"
            style={{ color: darkMode ? '#cbd5e1' : '#64748b' }}
          >
            {title}
          </div>
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              color: accent,
              background: darkMode ? `${accent}22` : `${accent}14`,
            }}
          >
            {icon}
          </div>
        </div>
        <div
          className="flex flex-1 items-end pt-4 text-2xl font-semibold tracking-tight"
          style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
        >
          <span
            className={
              align === 'center'
                ? 'mx-auto'
                : align === 'end'
                  ? 'ml-auto'
                  : 'ml-0'
            }
          >
            {value}
          </span>
        </div>
      </div>
    </Card>
  );
}
