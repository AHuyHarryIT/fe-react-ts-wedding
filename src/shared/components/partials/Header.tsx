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
      className="mx-3 mt-3 rounded-2xl border md:mx-5 md:mt-5"
      style={{
        background: darkMode
          ? 'rgba(15, 23, 42, 0.98)'
          : 'rgba(255, 255, 255, 0.98)',
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: darkMode
          ? '0 10px 24px -22px rgba(2, 6, 23, 0.9)'
          : '0 10px 24px -22px rgba(15, 23, 42, 0.18)',
      }}
    >
      <div className="px-4 py-3 md:px-5 md:py-3.5">
        <div className="flex items-center justify-between gap-3">
          <Space size="middle" className="min-w-0">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Open navigation' : 'Collapse navigation'}
              className="!flex !h-11 !w-11 !items-center !justify-center !rounded-2xl"
              style={{
                color: darkMode ? '#d1d5db' : '#475569',
                background: darkMode
                  ? 'rgba(30, 41, 59, 0.88)'
                  : 'rgba(248, 250, 252, 1)',
              }}
            />
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <HeartOutlined className="text-sm text-white" />
              </div>
              <div className="min-w-0">
                <Text
                  className="block truncate"
                  style={{
                    color: darkMode ? '#f9fafb' : '#111827',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  HaMy Studio
                </Text>
                <Text
                  className="hidden md:block"
                  style={{
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: '12px',
                  }}
                >
                  Operations dashboard
                </Text>
              </div>
            </div>
          </Space>

          <Space size="small" className="shrink-0">
            <Button
              type="text"
              icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={onToggleTheme}
              aria-label={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="!flex !h-11 !w-11 !items-center !justify-center !rounded-2xl"
              style={{
                color: darkMode ? '#d1d5db' : '#475569',
                background: darkMode
                  ? 'rgba(30, 41, 59, 0.88)'
                  : 'rgba(248, 250, 252, 1)',
              }}
            />
            <div
              className="hidden items-center gap-3 rounded-xl border px-3 py-2 sm:flex"
              style={{
                borderColor: darkMode ? '#334155' : '#e2e8f0',
                background: darkMode ? 'rgba(30, 41, 59, 0.82)' : '#f8fafc',
              }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{
                  background:
                    'linear-gradient(to bottom right, #ec4899, #e11d48)',
                }}
              />
              <div className="leading-tight">
                <Text
                  className="block"
                  style={{ color: darkMode ? '#f1f5f9' : '#1f2937' }}
                >
                  {userName || 'Admin'}
                </Text>
                <Text
                  style={{
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: 12,
                  }}
                >
                  Staff access
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              onClick={onLogout}
              loading={logoutLoading}
              className="!h-11 !rounded-xl !border-none !px-3 sm:!px-4"
              style={{
                background: '#e11d48',
              }}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
