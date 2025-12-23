import { Space, Typography } from 'antd';

const { Text } = Typography;

interface FooterProps {
  darkMode: boolean;
}

export function Footer({ darkMode }: FooterProps) {
  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '24px 48px',
        textAlign: 'center',
        borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        background: darkMode ? '#1f2937' : '#ffffff',
      }}
    >
      <Space split="|" size="middle">
        <Text style={{ color: darkMode ? '#9ca3af' : '#64748b' }}>
          © 2025 HaMy Studio. All rights reserved.
        </Text>
        <Text
          style={{
            color: darkMode ? '#9ca3af' : '#64748b',
            cursor: 'pointer',
          }}
        >
          Privacy Policy
        </Text>
        <Text
          style={{
            color: darkMode ? '#9ca3af' : '#64748b',
            cursor: 'pointer',
          }}
        >
          Terms
        </Text>
        <Text
          style={{
            color: darkMode ? '#9ca3af' : '#64748b',
            cursor: 'pointer',
          }}
        >
          Contact
        </Text>
      </Space>
    </div>
  );
}
