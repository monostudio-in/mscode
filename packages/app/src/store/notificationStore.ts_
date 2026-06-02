// src/store/notificationStore.ts
import { create } from 'zustand';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'type2';
  customStyle?: React.CSSProperties;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'loading' | 'confirmation';
  title: string;
  message?: string;
  fullMessage?: string;
  source?: string;
  iconUrl?: string;
  progress?: number;
  actions?: NotificationAction[];
  read?: boolean;
  isToast?: boolean;
  collapsed?: boolean;
  count?: number;
}

interface NotificationState {
  notifications: AppNotification[];
  isCenterOpen: boolean;
  
  addNotification: (notif: Omit<AppNotification, 'id'> & { id?: string }) => void;
  removeNotification: (id: string) => void;
  dismissToast: (id: string) => void;
  toggleCollapse: (id: string) => void;
  toggleCenter: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isCenterOpen: false,

  addNotification: (payload) => {
    set((state) => {
      //️ FINGERPRINT MATCHING: Check if an identical notification already exists
      const isGroupable = payload.title || payload.message;
      
      if (isGroupable) {
        const existingIndex = state.notifications.findIndex(n => 
          n.title === payload.title &&
          n.message === payload.message &&
          n.source === payload.source &&
          n.type === payload.type
        );

        if (existingIndex !== -1) {
          const existing = state.notifications[existingIndex];
          
          // GROUPING LOGIC: Update existing notification instead of creating a new one
          const updatedNotif: AppNotification = {
            ...existing,
            ...payload, // Override with any new progress/actions
            id: existing.id, // Keep the original ID
            count: (existing.count || 1) + 1, // Increment the badge count
            isToast: true, // Re-trigger the toast to notify user again
            read: false,
            collapsed: existing.collapsed // Retain user's collapse state
          };

          const newNotifications = [...state.notifications];
          newNotifications.splice(existingIndex, 1); // Remove from old position
          newNotifications.unshift(updatedNotif); // Bring it to the top (most recent)

          return { notifications: newNotifications };
        }
      }

      // Normal Add (If unique)
      const newNotif: AppNotification = {
        ...payload,
        id: payload.id || crypto.randomUUID(),
        count: 1,
        isToast: true,
        collapsed: true,
        read: false
      };

      return { notifications: [newNotif, ...state.notifications] };
    });
  },

  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  dismissToast: (id) => set(state => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, isToast: false } : n
    )
  })),

  toggleCollapse: (id) => set(state => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, collapsed: !n.collapsed } : n
    )
  })),

  toggleCenter: () => set(state => {
    // Mark all as read when opening center
    const updated = state.isCenterOpen 
      ? state.notifications 
      : state.notifications.map(n => ({ ...n, read: true }));
    return { isCenterOpen: !state.isCenterOpen, notifications: updated };
  }),

  clearAll: () => set({ notifications: [] })
}));