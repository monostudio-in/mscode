// src/store/notificationStore.ts
import { create } from 'zustand';

/**
 * Defines the operational categories for notifications.
 * 'confirmation' type is used for user-interactive blocking dialogues.
 */
export type NotificationType = 'info' | 'warning' | 'error' | 'loading' | 'confirmation' | 'success';

/**
 * Action configuration for interactive notifications.
 */
export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'type1' | 'type2';
  customStyle?: React.CSSProperties;
}

/**
 * The core notification data structure tracking system state and lifecycle.
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  fullMessage?: string;
  source: string;
  timestamp: number;
  read: boolean;
  collapsed: boolean;
  progress?: number; 
  actions?: NotificationAction[];
  isToast: boolean; 
  iconUrl?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  isCenterOpen: boolean;
  
  /** Adds a new notification and triggers automatic cleanup for transient types. */
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'collapsed' | 'isToast'> & { id?: string }) => string;
  updateNotification: (id: string, updates: Partial<AppNotification>) => void;
  dismissToast: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAllRead: () => void;
  toggleCenter: () => void;
  toggleCollapse: (id: string) => void;
}

/**
 * Global store handling system-wide notifications, toast lifecycle, 
 * and user interaction feedback.
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isCenterOpen: false,

  addNotification: (n) => {
    const id = n.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotif: AppNotification = {
      ...n, 
      id, 
      timestamp: Date.now(), 
      read: false, 
      // Confirmation notifications default to expanded state for immediate interaction
      collapsed: n.type === 'confirmation' ? false : true, 
      isToast: true
    };
    
    set((state) => {
      const exists = state.notifications.some(x => x.id === id);
      if (exists) {
        return { notifications: state.notifications.map(x => x.id === id ? { ...x, ...n } : x) };
      }
      return { notifications: [newNotif, ...state.notifications] };
    });

    // Auto-dismiss transient notifications (loading/confirmation remain persistent)
    if (newNotif.type !== 'loading' && newNotif.type !== 'confirmation') {
      setTimeout(() => get().dismissToast(id), 5000);
    }
    return id;
  },

  updateNotification: (id, updates) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, ...updates } : n)
  })),

  dismissToast: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isToast: false } : n)
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearAll: () => set({ notifications: [] }),

  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  toggleCenter: () => set((state) => {
    if (!state.isCenterOpen) get().markAllRead(); 
    return { isCenterOpen: !state.isCenterOpen };
  }),

  toggleCollapse: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n)
  })),
}));