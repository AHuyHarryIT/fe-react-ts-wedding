import { Input, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { StaffButton, StaffPanel } from '@components/ui';
import type { ReactNode } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  placeholder?: string;
  helperText?: string;
  extra?: ReactNode;
}

/**
 * Reusable search bar component for management pages
 */
export function SearchBar({
  value,
  onChange,
  onRefresh,
  placeholder = 'Search...',
  helperText,
  extra,
}: SearchBarProps) {
  return (
    <StaffPanel bodyPadding={20} className="mb-6">
      <div className="staff-toolbar">
        <Input
          id="management-search"
          name="management-search"
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          allowClear
          autoComplete="off"
          className="staff-search-input !h-11 !rounded-2xl"
        />

        <div className="flex flex-wrap items-center gap-3">
          {extra}
          {onRefresh && (
            <StaffButton
              variant="secondary"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
            >
              Refresh
            </StaffButton>
          )}
        </div>
      </div>

      {helperText && (
        <Typography.Text className="staff-search-helper">
          {helperText}
        </Typography.Text>
      )}
    </StaffPanel>
  );
}
