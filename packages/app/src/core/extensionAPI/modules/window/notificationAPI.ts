// src/core/extensionAPI/modules/window/notificationAPI.ts

import { useNotificationStore, type NotificationAction } from '@/store/notificationStore';

export const createNotificationAPI = (extId: string) => {
  const store = useNotificationStore.getState();

  const notificationMethods = {
    showInformationMessage: (message: string, ...items: string[] | NotificationAction[]) => {
      const actions = typeof items[0] === 'string' 
        ? (items as string[]).map(label => ({ label, onClick: () => {} }))
        : (items as NotificationAction[]);
      return store.addNotification({ type: 'info', title: 'Information', message, source: extId, actions });
    },

    showErrorMessage: (message: string, fullMessage?: string) => {
      return store.addNotification({ type: 'error', title: 'Error', message, fullMessage, source: extId });
    },

    withProgress: (title: string, message: string) => {
      const id = store.addNotification({ type: 'loading', title, message, source: extId });
      return {
        id,
        report: (updates: { message?: string; progress?: number }) => 
          useNotificationStore.getState().updateNotification(id, updates),
        done: (finalMessage?: string) => {
          useNotificationStore.getState().updateNotification(id, { type: 'info', message: finalMessage || 'Task completed.' });
          setTimeout(() => useNotificationStore.getState().dismissToast(id), 3000); // Check if dismissToast is correct for notifications
        },
        error: (err: string) => useNotificationStore.getState().updateNotification(id, { type: 'error', message: err })
      };
    },

    showConfirmation: (title: string, message: string, actions: NotificationAction[]) => {
      return store.addNotification({ type: 'confirmation', title, message, source: extId, actions });
    },

    dismissNotification: (id: string) => store.removeNotification(id)
  };

  return {
    // Especially I like this 
    notification: notificationMethods,
    
    // VS Code Style I used 
    showInformationMessage: notificationMethods.showInformationMessage,
    showErrorMessage: notificationMethods.showErrorMessage,
    withProgress: notificationMethods.withProgress,
  };
};