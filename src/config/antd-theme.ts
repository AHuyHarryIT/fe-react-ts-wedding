import { theme } from 'antd';

export const getLightTheme = () => ({
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary colors
    colorPrimary: '#e11d48',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#0ea5e9',

    // Background colors
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',

    // Text colors - using Ant Design standard for better contrast
    colorText: '#000000d9', // Standard Ant Design primary text
    colorTextSecondary: '#00000073', // Standard Ant Design secondary text
    colorTextTertiary: '#00000045', // Standard Ant Design tertiary text

    // Border
    colorBorder: '#d9d9d9', // Standard Ant Design border
    borderRadius: 12,

    // Typography
    fontFamily:
      '"Plus Jakarta Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
      borderRadius: 14,
      controlHeight: 42,
    },
    Input: {
      borderRadius: 14,
      controlHeight: 42,
    },
    Card: {
      borderRadius: 20,
      boxShadow:
        '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    Layout: {
      headerBg: 'transparent',
      bodyBg: '#f8fafc',
      siderBg: '#ffffff',
    },
    Menu: {
      itemBorderRadius: 14,
      itemHeight: 46,
      itemMarginInline: 10,
      itemMarginBlock: 6,
      itemSelectedBg: 'rgba(225, 29, 72, 0.12)',
      itemSelectedColor: '#be123c',
      itemHoverColor: '#be123c',
    },
  },
});

export const getDarkTheme = () => ({
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary colors (same as light theme)
    colorPrimary: '#fb7185',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#38bdf8',

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
    borderRadius: 12,

    // Typography
    fontFamily:
      '"Plus Jakarta Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,

    // Spacing
    padding: 16,
    margin: 16,
  },
  components: {
    Button: {
      borderRadius: 14,
      controlHeight: 42,
    },
    Input: {
      borderRadius: 14,
      controlHeight: 42,
    },
    Card: {
      borderRadius: 20,
    },
    Layout: {
      headerBg: 'transparent',
      bodyBg: '#0f172a',
      siderBg: '#111827',
    },
    Menu: {
      itemBorderRadius: 14,
      itemHeight: 46,
      itemMarginInline: 10,
      itemMarginBlock: 6,
      itemSelectedBg: 'rgba(251, 113, 133, 0.16)',
      itemSelectedColor: '#fecdd3',
      itemHoverColor: '#fecdd3',
    },
  },
});

// Legacy export for backward compatibility
export const antdTheme = getLightTheme();
