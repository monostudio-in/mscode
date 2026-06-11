//  src/core/extensionAPI/modules/appModules.ts

import { useBackButtonStore } from '@/store/backButtonStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';

export const createAppModule = (extId: string) => ({
    /**
     * Registers a callback for the hardware back button.
     * Returns `true` inside the callback to stop the event from bubbling down to exit the app.
     * * @example
     * const backSub = mscode.app.onBackButton(() => {
     * if (myCustomPopupIsOpen) {
     * closePopup();
     * return true; // Don't exit app.
     * }
     * return false; // Let it pass to the next handler/exit.
     * });
     */
    onBackButton: (callback: () => boolean | Promise<boolean>) => {
      const id = `${extId}-back-${Date.now()}-${Math.random()}`;
      useBackButtonStore.getState().push(id, callback);
      
      return {
        dispose: () => useBackButtonStore.getState().remove(id)
      };
    },

    /** Trigger the app exit confirmation directly */
    exitApp: () => commands.executeCommand('workbench.action.quit')
});