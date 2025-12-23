import {
  HeartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Space, Typography } from 'antd';

const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  userName?: string;
  onLogout: () => void;
  logoutLoading?: boolean;
}

export function Header({
  collapsed,
  onToggleCollapse,
  darkMode,
  onToggleTheme,
  userName,
  onLogout,
  logoutLoading,
}: HeaderProps) {
  return (
    <div
      style={{
        background: darkMode
          ? 'rgba(31, 41, 55, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <Space size="middle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onToggleCollapse}
              style={{ color: darkMode ? '#d1d5db' : '#475569' }}
            />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <HeartOutlined className="text-white text-sm" />
              </div>
              <Text
                style={{
                  color: darkMode ? '#f9fafb' : '#111827',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                HaMy Studio
              </Text>
            </div>
            <Text
              style={{
                color: darkMode ? '#9ca3af' : '#64748b',
                fontSize: '12px',
              }}
            >
              | Admin Dashboard
            </Text>
          </Space>

          <Space size="middle">
            <Button
              type="text"
              icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={onToggleTheme}
              style={{ color: darkMode ? '#d1d5db' : '#475569' }}
            />
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{
                background:
                  'linear-gradient(to bottom right, #ec4899, #e11d48)',
              }}
            />
            <Text style={{ color: darkMode ? '#e5e7eb' : '#1f2937' }}>
              {userName || 'Admin'}
            </Text>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={onLogout}
              loading={logoutLoading}
            >
              Logout
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
