import { Card, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTheme } from '@hooks';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  placeholder?: string;
  width?: number;
}

/**
 * Reusable search bar component for management pages
 */
export function SearchBar({
  value,
  onChange,
  onRefresh,
  placeholder = 'Search...',
  width = 300,
}: SearchBarProps) {
  const { darkMode: isDark } = useTheme();

  return (
    <Card
      style={{
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderColor: isDark ? '#374151' : '#d9d9d9',
      }}
    >
      <Space>
        <Input
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="large"
          allowClear
          style={{
            width,
            backgroundColor: isDark ? '#111827' : '#fff',
            color: isDark ? '#fff' : '#000',
            borderColor: isDark ? '#374151' : '#d9d9d9',
          }}
        />
        {onRefresh && (
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            style={{
              backgroundColor: isDark ? '#111827' : '#fff',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? '#374151' : '#d9d9d9',
            }}
          >
            Refresh
          </Button>
        )}
      </Space>
    </Card>
  );
}
