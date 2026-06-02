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
  count?: number; 
}

interface NotificationState {
  notifications: AppNotification[];
  isCenterOpen: boolean;
  
  /** Adds a new notification and triggers automatic cleanup for transient types. */
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'collapsed' | 'isToast' | 'count'> & { id?: string }) => string;
  updateNotification: (id: string, updates: Partial<AppNotification>) => void;
  dismissToast: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAllRead: () => void;
  toggleCenter: () => void;
  toggleCollapse: (id: string) => void;
}

// Track timeouts globally to prevent premature toast dismissal during grouping
const toastTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Global store handling system-wide notifications, toast lifecycle, 
 * and user interaction feedback.
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isCenterOpen: false,

  addNotification: (n) => {
    let resolvedId = n.id;
    let isGroupedOrNew = false;

    set((state) => {
      //️ 1. FINGERPRINT MATCHING: Check if an identical notification already exists
      const isGroupable = n.title || n.message;
      
      // If no explicit ID was provided, try to match by content fingerprint
      if (isGroupable && !n.id) {
        const existingIndex = state.notifications.findIndex(existing => 
          existing.title === n.title &&
          existing.message === n.message &&
          existing.source === n.source &&
          existing.type === n.type
        );

        if (existingIndex !== -1) {
          const existing = state.notifications[existingIndex];
          resolvedId = existing.id;
          isGroupedOrNew = true;
          
          // Update the existing notification
          const updatedNotif: AppNotification = {
            ...existing,
            ...n, // Override with any new progress/actions
            id: existing.id, 
            count: (existing.count || 1) + 1, // Increment the badge count
            timestamp: Date.now(),
            isToast: true, // Re-trigger the toast
            read: false,
            collapsed: existing.collapsed // Keep user's collapse state
          };

          const newNotifications = [...state.notifications];
          newNotifications.splice(existingIndex, 1); // Remove from old position
          newNotifications.unshift(updatedNotif); // Bring to the top (most recent)

          return { notifications: newNotifications };
        }
      }

      // 2. EXPLICIT ID UPDATE: If ID matches an existing one (e.g. updating progress)
      resolvedId = resolvedId || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const existsIndex = state.notifications.findIndex(x => x.id === resolvedId);

      if (existsIndex !== -1) {
        const newNotifications = [...state.notifications];
        newNotifications[existsIndex] = { ...newNotifications[existsIndex], ...n };
        return { notifications: newNotifications };
      }

      //  3. NEW NOTIFICATION
      isGroupedOrNew = true;
      const newNotif: AppNotification = {
        ...n, 
        id: resolvedId, 
        timestamp: Date.now(), 
        read: false, 
        collapsed: n.type === 'confirmation' ? false : true, 
        isToast: true,
        count: 1 // Default count
      };
      
      return { notifications: [newNotif, ...state.notifications] };
    });

    // TIMEOUT MANAGEMENT: Auto-dismiss transient notifications
    if (isGroupedOrNew) {
      const addedNotif = get().notifications.find(x => x.id === resolvedId);
      
      if (addedNotif && addedNotif.type !== 'loading' && addedNotif.type !== 'confirmation') {
        // Clear previous timeout if this is a grouped notification
        if (toastTimeouts.has(resolvedId!)) {
          clearTimeout(toastTimeouts.get(resolvedId!)!);
        }
        
        // Set new 5-second timeout
        const timeoutId = setTimeout(() => {
          get().dismissToast(resolvedId!);
          toastTimeouts.delete(resolvedId!);
        }, 5000);
        
        toastTimeouts.set(resolvedId!, timeoutId);
      }
    }

    return resolvedId!;
  },

  updateNotification: (id, updates) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, ...updates } : n)
  })),

  dismissToast: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isToast: false } : n)
  })),

  removeNotification: (id) => {
    // Clear timeout if notification is manually closed
    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id)!);
      toastTimeouts.delete(id);
    }
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearAll: () => {
    toastTimeouts.forEach(clearTimeout);
    toastTimeouts.clear();
    set({ notifications: [] });
  },

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