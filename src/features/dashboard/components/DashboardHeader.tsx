import { Typography } from 'antd';

const { Text } = Typography;

interface DashboardHeaderProps {
  darkMode: boolean;
  greetingName: string;
  focusTitle: string;
  focusBody: string;
}

const getHeaderBodyTextStyle = (darkMode: boolean) => ({
  color: darkMode ? '#cbd5e1' : '#475569',
  fontSize: '0.92rem',
  lineHeight: 1.55,
});

const getHeaderTitleTextStyle = (darkMode: boolean) => ({
  color: darkMode ? '#f8fafc' : '#0f172a',
  letterSpacing: '-0.01em',
});

export function DashboardHeader({
  darkMode,
  greetingName,
  focusTitle,
  focusBody,
}: DashboardHeaderProps) {
  return (
    <div className="staff-page-header">
      <div className="min-w-0">
        <div className="staff-kicker">Studio overview</div>
        <h1 className="staff-title mt-4">Welcome back, {greetingName}</h1>
        <p className="staff-subtitle mt-3">
          Track bookings, payments, and today&apos;s priorities with live
          operational data.
        </p>
      </div>

      <div className="staff-surface flex w-full flex-col gap-2.5 rounded-3xl p-4 md:w-auto md:max-w-[24rem] md:p-5">
        <Text strong style={getHeaderTitleTextStyle(darkMode)}>
          {focusTitle}
        </Text>
        <Text style={getHeaderBodyTextStyle(darkMode)}>{focusBody}</Text>
      </div>
    </div>
  );
}
