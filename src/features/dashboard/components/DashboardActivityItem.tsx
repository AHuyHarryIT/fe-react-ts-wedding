import { ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';
import { Avatar, Typography } from 'antd';

const { Text } = Typography;

type ActivityLink = '/bookings' | '/orders';

interface DashboardActivityItemProps {
  darkMode: boolean;
  text: string;
  timeLabel: string;
  to: ActivityLink;
}

const getInteractiveRowStyle = (darkMode: boolean) => ({
  borderColor: darkMode ? '#334155' : '#e2e8f0',
  background: darkMode ? 'rgba(15, 23, 42, 0.42)' : 'rgba(248, 250, 252, 0.85)',
});

const getRowPrimaryTextStyle = (darkMode: boolean) => ({
  display: 'block',
  color: darkMode ? '#e5e7eb' : '#1e293b',
  fontWeight: 600,
  lineHeight: 1.35,
});

const getActivitySecondaryTextStyle = (darkMode: boolean) => ({
  fontSize: '12px',
  color: darkMode ? '#9ca3af' : '#64748b',
});

const getChevronStyle = (darkMode: boolean) => ({
  color: darkMode ? '#64748b' : '#94a3b8',
});

const getAvatarStyle = () => ({
  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  flexShrink: 0,
});

export function DashboardActivityItem({
  darkMode,
  text,
  timeLabel,
  to,
}: DashboardActivityItemProps) {
  return (
    <Link to={to} className="block rounded-2xl">
      <div
        className="staff-interactive-surface flex items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200"
        style={getInteractiveRowStyle(darkMode)}
      >
        <Avatar
          size="small"
          icon={<CalendarOutlined />}
          style={getAvatarStyle()}
        />
        <div className="min-w-0 flex-1">
          <Text style={getRowPrimaryTextStyle(darkMode)}>{text}</Text>
          <Text style={getActivitySecondaryTextStyle(darkMode)}>
            {timeLabel}
          </Text>
        </div>
        <ArrowRightOutlined style={getChevronStyle(darkMode)} />
      </div>
    </Link>
  );
}
