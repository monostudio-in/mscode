// src/hooks/useTerminalBoot.ts

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNotificationStore } from '@/store/notificationStore';
import { NativeTerminal } from '../core/TerminalProcess';

/**
 * Custom hook managing the terminal environment lifecycle during application boot.
 * Automates the validation and extraction of required binary runtime root files
 * if the host environment is not yet initialized.
 */
export function useTerminalBoot(): void {
    useEffect(() => {
        // Initialization routines are exclusively required for native device platform hosts
        if (!Capacitor.isNativePlatform()) return;

        const bootSetup = async (): Promise<void> => {
            try {
                // 1. Verify if the system root environment is already staged
                const { isReady } = await NativeTerminal.checkSetup();
                
                if (isReady) {
                    // console.log("✅ [Terminal] Rootfs is already setup.");
                    return; 
                }

                // 2. Notify the user of the ongoing environment extraction process
                const notifId = 'term-setup-boot';
                useNotificationStore.getState().addNotification({
                    id: notifId,
                    type: 'loading',
                    title: 'Setting up Terminal Environment',
                    source: 'System',
                    message: 'Extracting Alpine Linux... Please wait.',
                });

                // 3. Perform asynchronous file system setup and binary installation
                await NativeTerminal.initSetup();

                // 4. Signal successful installation to the user interface
                useNotificationStore.getState().updateNotification(notifId, {
                    type: 'info',
                    title: 'Terminal Ready',
                    message: 'Terminal environment is installed and ready to use.',
                });
                
                // Clear the notification after a brief success delay
                setTimeout(() => {
                    useNotificationStore.getState().dismissToast(notifId);
                }, 3000);

            } catch (error: any) {
                // 5. Catch and log terminal startup failures to the diagnostic notification stack
                console.error("❌ [Terminal] Boot setup failed:", error);
                useNotificationStore.getState().addNotification({
                    type: 'error',
                    title: 'Terminal Setup Failed',
                    source: 'System',
                    message: error.message || 'An unknown error occurred during setup.',
                });
            }
        };

        bootSetup();
    }, []);
}
