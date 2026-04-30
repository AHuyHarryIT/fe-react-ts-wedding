import {
  BarChartOutlined,
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
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@stores/authStore';
import { Button, Drawer, Layout, Menu, Typography } from 'antd';
import {
  MENU_REQUIRED_PERMISSION,
  hasRequiredPermission,
} from '@/auth/staffAccessPolicy';

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
  const user = useAuthStore((state) => state.user);
  const background = darkMode ? '#111827' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const menuItems = [
    {
      type: 'group' as const,
      label: 'Operations',
      children: [
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
        {
          key: 'jobs',
          icon: <ToolOutlined />,
          label: 'Jobs',
          onClick: () => navigate({ to: '/jobs' }),
        },
        {
          key: 'chat',
          icon: <MessageOutlined />,
          label: 'Chat',
          onClick: () => navigate({ to: '/chat' }),
        },
      ],
    },
    {
      type: 'group' as const,
      label: 'Catalog',
      children: [
        {
          key: 'services',
          icon: <CameraOutlined />,
          label: 'Services',
          onClick: () => navigate({ to: '/services' }),
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
      ],
    },
    {
      type: 'group' as const,
      label: 'Sales & Insights',
      children: [
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: 'Reports',
          onClick: () => navigate({ to: '/reports' }),
        },
      ],
    },
    {
      type: 'group' as const,
      label: 'People & Access',
      children: [
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
      ],
    },
    {
      type: 'group' as const,
      label: 'System',
      children: [
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Settings',
          onClick: () => navigate({ to: '/settings' }),
        },
      ],
    },
  ];

  const filteredMenuItems = menuItems
    .map((group) => ({
      ...group,
      children: group.children.filter((item) =>
        hasRequiredPermission(user, MENU_REQUIRED_PERMISSION[item.key])
      ),
    }))
    .filter((group) => group.children.length > 0);

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
            <Button
              type="text"
              aria-label="Close navigation"
              onClick={() => onClose?.()}
              className="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl !border transition-colors"
              style={{
                borderColor,
                color: darkMode ? '#e2e8f0' : '#334155',
                background: darkMode ? 'rgba(30, 41, 59, 0.88)' : '#f8fafc',
              }}
              icon={<CloseOutlined />}
            />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-3 pb-4">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={filteredMenuItems}
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

      {(!collapsed || mobile) && (
        <div className="border-t px-4 py-4" style={{ borderColor }}>
          <Text
            style={{
              color: darkMode ? '#cbd5e1' : '#334155',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Tips
          </Text>
          <ul
            className="mt-2 list-disc space-y-1 pl-4 text-xs"
            style={{ color: darkMode ? '#94a3b8' : '#64748b' }}
          >
            <li>Review today&apos;s bookings before opening your schedule.</li>
            <li>Check reports weekly to spot booking and revenue trends.</li>
          </ul>
        </div>
      )}
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
