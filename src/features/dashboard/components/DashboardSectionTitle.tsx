interface DashboardSectionTitleProps {
  darkMode: boolean;
  title: string;
}

const getPanelTitleStyle = (darkMode: boolean) => ({
  color: darkMode ? '#f8fafc' : '#0f172a',
  fontWeight: 700,
  letterSpacing: '-0.01em',
});

export function DashboardSectionTitle({
  darkMode,
  title,
}: DashboardSectionTitleProps) {
  return <span style={getPanelTitleStyle(darkMode)}>{title}</span>;
}
