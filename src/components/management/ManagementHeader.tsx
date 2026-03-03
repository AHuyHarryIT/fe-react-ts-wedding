import { Row, Col, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@hooks';

const { Title, Text } = Typography;

interface ManagementHeaderProps {
  title: string;
  subtitle: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  onCreateClick?: () => void;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * Reusable header component for management pages
 */
export function ManagementHeader({
  title,
  subtitle,
  showCreateButton = true,
  createButtonText,
  onCreateClick,
  icon,
  extra,
}: ManagementHeaderProps) {
  const { darkMode: isDark } = useTheme();

  return (
    <Row
      justify="space-between"
      align="middle"
      style={{ marginBottom: '24px' }}
    >
      <Col>
        <Title level={2} style={{ margin: 0, color: isDark ? '#fff' : '#000' }}>
          {title}
        </Title>
        <Text type="secondary">{subtitle}</Text>
      </Col>
      <Col>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {extra}
          {showCreateButton && onCreateClick && (
            <Button
              type="primary"
              icon={icon || <PlusOutlined />}
              onClick={onCreateClick}
              size="large"
            >
              {createButtonText || `Create ${title.replace(' Management', '')}`}
            </Button>
          )}
        </div>
      </Col>
    </Row>
  );
}
