import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  initializeTheme: () => void;
}

const updateDocumentTheme = (darkMode: boolean) => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const getInitialTheme = (): boolean => {
  // Check if dark mode was previously saved in localStorage
  const saved = localStorage.getItem('theme-storage');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return parsed.state?.darkMode ?? false;
    } catch {
      // If parsing fails, fall back to the app default
    }
  }

  // Default the staff app to light mode for new sessions.
  return false;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      darkMode: false, // Will be initialized properly in initializeTheme

      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
        updateDocumentTheme(newDarkMode);
      },

      setDarkMode: (value: boolean) => {
        set({ darkMode: value });
        updateDocumentTheme(value);
      },

      initializeTheme: () => {
        const initialTheme = getInitialTheme();
        set({ darkMode: initialTheme });
        updateDocumentTheme(initialTheme);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the darkMode state
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
);
