import React from 'react';
import { ConfigProvider } from 'antd';
import { getLightTheme, getDarkTheme } from '../config/antd-theme';

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
      {children}
    </ConfigProvider>
  );
};
