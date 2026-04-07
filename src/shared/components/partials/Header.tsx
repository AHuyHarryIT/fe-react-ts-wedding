import {
  HeartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Space, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import * as ReminderService from '@/services/ReminderService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const { Text } = Typography;

interface NotifItem {
  id: string;
  reminderId: string;
  channel: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function NotificationBellInline({ darkMode }: { darkMode: boolean }) {
  const queryClient = useQueryClient();
  const setOpen = useState(false)[1];

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => ReminderService.getUnreadCount(),
    refetchInterval: 300000,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => ReminderService.getNotifications({ limit: 10 }),
    refetchInterval: 300000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => ReminderService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => ReminderService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const unreadCount = unreadData?.count ?? 0;
  const notifications: NotifItem[] = notificationsData?.data ?? [];

  const dropdownItems = notifications.map((n: NotifItem) => ({
    key: n.id,
    label: (
      <div style={{ maxWidth: 340, padding: '8px 4px' }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{n.message}</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
          {dayjs(n.createdAt).fromNow()}
        </div>
      </div>
    ),
    onClick: () => {
      if (!n.isRead) markReadMutation.mutate(n.id);
    },
  }));

  return (
    <Dropdown
      menu={{ items: dropdownItems }}
      onOpenChange={setOpen}
      trigger={['click']}
      popupRender={(menu) => (
        <div style={{ maxWidth: 360 }}>
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f0f0f0',
              background: darkMode ? '#1e293b' : '#fafafa',
              color: darkMode ? '#e2e8f0' : '#1f2937',
            }}
          >
            <strong>{unreadCount} unread</strong>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                onClick={() => markAllReadMutation.mutate()}
                style={{ padding: 0 }}
              >
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                color: '#999',
                background: darkMode ? '#0f172a' : '#fff',
              }}
            >
              No notifications
            </div>
          )}
          {notifications.length > 0 && menu}
        </div>
      )}
    >
      <Badge count={unreadCount > 99 ? '99+' : unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{
            color: darkMode ? '#94a3b8' : '#475569',
            fontSize: 16,
          }}
        />
      </Badge>
    </Dropdown>
  );
}

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
            <NotificationBellInline darkMode={darkMode} />
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
