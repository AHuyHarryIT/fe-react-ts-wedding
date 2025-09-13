import { createContext } from 'react';

export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
