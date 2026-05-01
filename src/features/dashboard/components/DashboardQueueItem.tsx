import { Link } from '@tanstack/react-router';
import { Typography } from 'antd';
import { StatusChip } from '@shared/components/ui/StatusChip';

const { Text } = Typography;

type QueueLink = '/bookings';
type QueueStatusTone = 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'slate';

interface DashboardQueueItemProps {
  darkMode: boolean;
  customerName: string;
  dateLabel: string;
  status: string;
  statusTone: QueueStatusTone;
  to: QueueLink;
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

const getRowSecondaryTextStyle = (darkMode: boolean) => ({
  fontSize: '12px',
  color: darkMode ? '#94a3b8' : '#64748b',
});

export function DashboardQueueItem({
  darkMode,
  customerName,
  dateLabel,
  status,
  statusTone,
  to,
}: DashboardQueueItemProps) {
  return (
    <Link to={to} className="block">
      <div
        className="staff-interactive-surface flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-200"
        style={getInteractiveRowStyle(darkMode)}
      >
        <div className="min-w-0 flex-1">
          <Text style={getRowPrimaryTextStyle(darkMode)}>{customerName}</Text>
          <Text style={getRowSecondaryTextStyle(darkMode)}>{dateLabel}</Text>
        </div>
        <StatusChip tone={statusTone}>{status}</StatusChip>
      </div>
    </Link>
  );
}
