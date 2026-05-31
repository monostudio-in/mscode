// src/core/extensionAPI/modules/window/notificationAPI.ts

import { useNotificationStore, type NotificationAction } from '@/store/notificationStore';

/**
 * Factory function to create the Notification API.
 * @param {string} extId - The unique identifier of the extension creating the notifications.
 */
export const createNotificationAPI = (extId: string) => {
  const store = useNotificationStore.getState();

  return {
    /**
     * Shows an information message toast.
     * @param {string} message - The primary message text.
     * @param {...(string[] | NotificationAction[])} items - Optional buttons or actions.
     * @returns {string} The unique ID of the notification.
     */
    showInformationMessage: (message: string, ...items: string[] | NotificationAction[]) => {
      const actions = typeof items[0] === 'string' 
        ? (items as string[]).map(label => ({ label, onClick: () => {} }))
        : (items as NotificationAction[]);

      return store.addNotification({ type: 'info', title: 'Information', message, source: extId, actions });
    },

    /**
     * Shows an error message toast.
     * @param {string} message - The brief error summary.
     * @param {string} [fullMessage] - Optional detailed error log or stack trace.
     * @returns {string} The unique ID of the notification.
     */
    showErrorMessage: (message: string, fullMessage?: string) => {
      return store.addNotification({ type: 'error', title: 'Error', message, fullMessage, source: extId });
    },

    /**
     * Shows a progress notification that can be updated or completed.
     * @param {string} title - The title of the progress task.
     * @param {string} message - Initial status message.
     * @returns {Object} An object to report progress, finish, or error out the task.
     */
    withProgress: (title: string, message: string) => {
      const id = store.addNotification({ type: 'loading', title, message, source: extId });
      return {
        id,
        /** Updates the progress message or percentage. */
        report: (updates: { message?: string; progress?: number }) => 
          useNotificationStore.getState().updateNotification(id, updates),
        /** Marks the task as completed and dismisses it after a delay. */
        done: (finalMessage?: string) => {
          useNotificationStore.getState().updateNotification(id, { type: 'info', message: finalMessage || 'Task completed.' });
          setTimeout(() => useNotificationStore.getState().dismissToast(id), 3000);
        },
        /** Converts the progress notification into an error state. */
        error: (err: string) => useNotificationStore.getState().updateNotification(id, { type: 'error', message: err })
      };
    },

    /**
     * Shows a notification with custom buttons (actions).
     * @param {string} title - Notification title.
     * @param {string} message - The description of the request.
     * @param {NotificationAction[]} actions - Array of actions with labels and callbacks.
     */
    showConfirmation: (title: string, message: string, actions: NotificationAction[]) => {
      return store.addNotification({ type: 'confirmation', title, message, source: extId, actions });
    },

    /** Dismisses a specific notification by its ID. */
    dismissNotification: (id: string) => store.removeNotification(id)
  };
};
