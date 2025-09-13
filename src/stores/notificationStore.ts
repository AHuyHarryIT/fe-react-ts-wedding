import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
  }>;
  addNotification: (
    notification: Omit<
      NotificationState['notifications'][0],
      'id' | 'timestamp'
    >
  ) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 10), // Keep only 10 recent notifications
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
