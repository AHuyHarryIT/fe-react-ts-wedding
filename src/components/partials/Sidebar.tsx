import {
  CalendarOutlined,
  CameraOutlined,
  CloseOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileImageOutlined,
  GiftOutlined,
  ToolOutlined,
  KeyOutlined,
  MessageOutlined,
  SafetyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Drawer, Layout, Menu, Typography } from 'antd';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  selectedKey: string;
  darkMode: boolean;
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  collapsed,
  onCollapse,
  selectedKey,
  darkMode,
  mobile = false,
  open = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const background = darkMode ? '#111827' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate({ to: '/' }),
    },
    {
      key: 'bookings',
      icon: <CalendarOutlined />,
      label: 'Bookings',
      onClick: () => navigate({ to: '/bookings' }),
    },
    {
      key: 'orders',
      icon: <DollarOutlined />,
      label: 'Orders',
      onClick: () => navigate({ to: '/orders' }),
    },
    // {
    //   key: 'clients',
    //   icon: <TeamOutlined />,
    //   label: 'Clients',
    // },
    {
      key: 'services',
      icon: <CameraOutlined />,
      label: 'Services',
      onClick: () => navigate({ to: '/services' }),
    },
    {
      key: 'jobs',
      icon: <ToolOutlined />,
      label: 'Jobs',
      onClick: () => navigate({ to: '/jobs' }),
    },
    {
      key: 'packages',
      icon: <GiftOutlined />,
      label: 'Packages',
      onClick: () => navigate({ to: '/packages' }),
    },
    {
      key: 'albums',
      icon: <FileImageOutlined />,
      label: 'Albums',
      onClick: () => navigate({ to: '/albums' }),
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: 'Customers',
      onClick: () => navigate({ to: '/customers' }),
    },
    {
      key: 'staff',
      icon: <TeamOutlined />,
      label: 'Staff',
      onClick: () => navigate({ to: '/users' }),
    },
    {
      key: 'roles',
      icon: <SafetyOutlined />,
      label: 'Roles',
      onClick: () => navigate({ to: '/roles' }),
    },
    {
      key: 'permissions',
      icon: <KeyOutlined />,
      label: 'Permissions',
      onClick: () => navigate({ to: '/permissions' }),
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'Chat',
      onClick: () => navigate({ to: '/chat' }),
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'Settings',
    // },
  ];

  const menuNode = (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 pb-4 pt-5" style={{ borderColor }}>
        <div
          className="flex items-center justify-between gap-3"
          style={{
            background: 'transparent',
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
              <DashboardOutlined />
            </div>
            {(!collapsed || mobile) && (
              <div className="min-w-0">
                <div
                  className="truncate text-sm font-semibold"
                  style={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                >
                  Studio HaMy
                </div>
                <Text
                  style={{
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: 12,
                  }}
                >
                  Admin navigation
                </Text>
              </div>
            )}
          </div>

          {mobile && (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => onClose?.()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
              style={{
                borderColor,
                color: darkMode ? '#e2e8f0' : '#334155',
                background: darkMode ? 'rgba(30, 41, 59, 0.88)' : '#f8fafc',
              }}
            >
              <CloseOutlined />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-3 pb-4">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          theme={darkMode ? 'dark' : 'light'}
          onClick={() => {
            if (mobile) {
              onClose?.();
            }
          }}
          style={{
            border: 'none',
            background,
          }}
        />
      </div>
    </div>
  );

  if (mobile) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        placement="left"
        size="default"
        closable={false}
        styles={{
          body: {
            padding: 0,
            background,
          },
        }}
      >
        {menuNode}
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      collapsedWidth={92}
      width={280}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background,
        borderRight: `1px solid ${borderColor}`,
      }}
    >
      {menuNode}
    </Sider>
  );
}
