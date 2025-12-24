import { theme } from 'antd';

export const getLightTheme = () => ({
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',

    // Background colors
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#fafafa',

    // Text colors - using Ant Design standard for better contrast
    colorText: '#000000d9', // Standard Ant Design primary text
    colorTextSecondary: '#00000073', // Standard Ant Design secondary text
    colorTextTertiary: '#00000045', // Standard Ant Design tertiary text

    // Border
    colorBorder: '#d9d9d9', // Standard Ant Design border
    borderRadius: 6,

    // Typography
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontSize: 14,

    // Spacing
    padding: 16,
    margin: 16,

    // Shadows
    boxShadow:
      '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 8,
      boxShadow:
        '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
  },
});

export const getDarkTheme = () => ({
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary colors (same as light theme)
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',

    // Background colors - Dark mode variants
    colorBgBase: '#1f2937', // Matches Tailwind gray-800
    colorBgContainer: '#1f2937', // Matches Tailwind gray-800
    colorBgLayout: '#111827', // Matches Tailwind gray-900

    // Text colors - Dark mode variants
    colorText: '#f3f4f6', // Matches Tailwind gray-100
    colorTextSecondary: '#d1d5db', // Matches Tailwind gray-300
    colorTextTertiary: '#9ca3af', // Matches Tailwind gray-400

    // Border - Dark mode variants
    colorBorder: '#374151', // Matches Tailwind gray-700
    borderRadius: 6,

    // Typography
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontSize: 14,

    // Spacing
    padding: 16,
    margin: 16,
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 8,
    },
  },
});

// Legacy export for backward compatibility
export const antdTheme = getLightTheme();
