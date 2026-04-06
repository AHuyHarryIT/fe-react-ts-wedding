import React from 'react';
import { App, ConfigProvider } from 'antd';
import { getLightTheme, getDarkTheme } from '@shared/config/antd-theme';

interface AntdProviderProps {
  children: React.ReactNode;
  darkMode?: boolean;
}

export const AntdProvider: React.FC<AntdProviderProps> = ({
  children,
  darkMode = false,
}) => {
  const currentTheme = darkMode ? getDarkTheme() : getLightTheme();

  return (
    <ConfigProvider theme={currentTheme} componentSize="middle">
      <App>{children}</App>
    </ConfigProvider>
  );
};
