import { Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { StaffButton } from '@shared/components/ui';

const { Text } = Typography;

interface ManagementHeaderProps {
  title: string;
  subtitle: string;
  kicker?: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  summary?: React.ReactNode;
}

/**
 * Reusable header component for management pages
 */
export function ManagementHeader({
  title,
  subtitle,
  kicker = 'Management',
  showCreateButton = true,
  createButtonText,
  onCreateClick,
  icon,
  extra,
  summary,
}: ManagementHeaderProps) {
  return (
    <div className="staff-page-header">
      <div className="min-w-0">
        <div className="staff-kicker">{kicker}</div>
        <h1 className="staff-title mt-4">{title}</h1>
        <p className="staff-subtitle mt-3">{subtitle}</p>
      </div>

      <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
        {summary}
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {extra}
          {showCreateButton && onCreateClick && (
            <StaffButton
              variant="primary"
              icon={icon || <PlusOutlined />}
              onClick={onCreateClick}
              size="large"
            >
              {createButtonText || `Create ${title.replace(' Management', '')}`}
            </StaffButton>
          )}
        </div>
        {!summary && !extra && (
          <Text className="!text-sm !text-slate-500 dark:!text-slate-400">
            Keep records clean, actions obvious, and the workflow easy to scan.
          </Text>
        )}
      </div>
    </div>
  );
}
