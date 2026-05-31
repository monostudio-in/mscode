// src/core/extensionAPI/modules/window/modalAPI.ts

import { useModalStore, type ModalOptions } from '@/store/modalStore';

/**
 * Factory function to create the Modal API.
 * Provides a way to show standardized modal dialogs to the user.
 */
export const createModalAPI = () => ({
  /**
   * Displays a modal dialog and returns a promise that resolves when the user interacts with it.
   * @param {ModalOptions} options Configuration for the modal (title, message, buttons, etc.).
   * @returns {Promise<string | null>} A promise resolving to the ID of the clicked button or null if dismissed.
   */
  showModalDialog: (options: ModalOptions): Promise<string | null> => {
    return useModalStore.getState().showModal(options);
  }
});
