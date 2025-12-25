import {
  CalendarOutlined,
  CameraOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileImageOutlined,
  GiftOutlined,
  KeyOutlined,
  SafetyOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Layout, Menu } from 'antd';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  selectedKey: string;
  darkMode: boolean;
}

export function Sidebar({
  collapsed,
  onCollapse,
  selectedKey,
  darkMode,
}: SidebarProps) {
  const navigate = useNavigate();

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
    },
    {
      key: 'clients',
      icon: <TeamOutlined />,
      label: 'Clients',
    },
    {
      key: 'services',
      icon: <CameraOutlined />,
      label: 'Services',
    },
    {
      key: 'packages',
      icon: <GiftOutlined />,
      label: 'Packages',
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Products',
      onClick: () => navigate({ to: '/products' }),
    },
    {
      key: 'categories',
      icon: <TagOutlined />,
      label: 'Categories',
      onClick: () => navigate({ to: '/categories' }),
    },
    {
      key: 'albums',
      icon: <FileImageOutlined />,
      label: 'Albums',
      onClick: () => navigate({ to: '/albums' }),
    },
    {
      key: 'payments',
      icon: <DollarOutlined />,
      label: 'Payments',
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
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={250}
      style={{
        overflow: 'auto',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64,
        bottom: 0,
        background: darkMode ? '#1f2937' : '#ffffff',
        borderRight: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      }}
    >
      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        theme={darkMode ? 'dark' : 'light'}
        style={{
          border: 'none',
          paddingTop: '1rem',
          background: darkMode ? '#1f2937' : '#ffffff',
        }}
      />
    </Sider>
  );
}
