import { Row, Col, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@hooks';

const { Title, Text } = Typography;

interface ManagementHeaderProps {
  title: string;
  subtitle: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  icon?: React.ReactNode;
}

/**
 * Reusable header component for management pages
 */
export function ManagementHeader({
  title,
  subtitle,
  showCreateButton = true,
  onCreateClick,
  icon,
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
      {showCreateButton && onCreateClick && (
        <Col>
          <Button
            type="primary"
            icon={icon || <PlusOutlined />}
            onClick={onCreateClick}
            size="large"
          >
            Create {title.replace(' Management', '')}
          </Button>
        </Col>
      )}
    </Row>
  );
}
