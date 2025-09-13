import { useEffect } from 'react';
import { useThemeStore } from '../stores';

interface ThemeInitializerProps {
  children: React.ReactNode;
}

export const ThemeInitializer: React.FC<ThemeInitializerProps> = ({
  children,
}) => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    // Initialize theme on mount
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
};
