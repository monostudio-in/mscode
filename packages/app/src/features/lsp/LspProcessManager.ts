// src/features/lsp/LspProcessManager.ts

import { Capacitor, registerPlugin } from '@capacitor/core';
import { useNotificationStore } from '@/store/notificationStore';
import { useStatusBarStore } from '@/features/statusbar/store/statusBarStore';

const NativeTerminal = registerPlugin<any>('NativeTerminal');

const LANGUAGE_CONFIGS: Record<string, { packages: string[]; postInstall?: string[]; checkCmd: string; serverCmd: string }> = {};

/**
 * Manages the native execution lifecycle, platform toolchain compilation, dependencies provisioning,
 * and background process management for real-time Language Server Protocol (LSP) engines via Capacitor bridges.
 */
export class LspProcessManager {
    private activeLanguage: string | null = null;
    private activePort: number | null = null;

    /**
     * Map dictionary housing schema definitions and capabilities flags registered dynamically by active extensions.
     */
    public dynamicConfigs: Record<string, any> = {};

    /**
     * Registers a structural language configuration descriptor mapping in memory.
     * 
     * @param language Targeted programming language identifier string.
     * @param config Structural capability configurations descriptor mapping.
     */
    public registerDynamicConfig(language: string, config: any): void {
        this.dynamicConfigs[language] = config;
    }

    /**
     * Discards a dynamically registered language server configuration mapping from the memory index.
     * 
     * @param language Targeted programming language identifier string to drop.
     */
    public removeDynamicConfig(language: string): void {
        delete this.dynamicConfigs[language];
    }

    /**
     * Wraps background terminal streams in async Promises to monitor exit statuses 
     * while continuously dispatching ongoing binary outputs into local buffer streams.
     */
    private async executeStreamCommand(
        sessionId: string, 
        command: string, 
        onLog: (data: string) => void
    ): Promise<number> {
        return new Promise(async (resolve, reject) => {
            let dataListener: any;
            let exitListener: any;

            const cleanup = () => {
                if (dataListener) dataListener.remove();
                if (exitListener) exitListener.remove();
            };

            try {
                dataListener = await NativeTerminal.addListener('onBackgroundData', (event: any) => {
                    if (event.sessionId === sessionId) onLog(event.data);
                });

                exitListener = await NativeTerminal.addListener('onBackgroundExit', (event: any) => {
                    if (event.sessionId === sessionId) {
                        cleanup();
                        resolve(event.exitCode);
                    }
                });

                await NativeTerminal.streamBackgroundExecute({ sessionId, command });
            } catch (err) {
                cleanup();
                reject(err);
            }
        });
    }

    /**
     * Orchestrates dependency checks, remote package manager updates, post-install configurations, 
     * and network port spawning routine configurations to deploy active native runtime server hosts.
     * 
     * @param language Targeted programming language identifier string.
     * @returns Dynamic runtime port allocation number assigned to host instances, or null upon installation aborts.
     */
    public async startServer(language: string): Promise<number | null> {
        if (!Capacitor.isNativePlatform()) return null;

        const config = this.dynamicConfigs[language] || LANGUAGE_CONFIGS[language];
        if (!config) return null;

        if (this.activeLanguage === language && this.activePort) {
            return this.activePort;
        }

        const notifId = `lsp-boot-${language}`;
        let consoleLogs = ''; 

        useStatusBarStore.getState().updateItem('lsp-status', {
            label: `Starting ${language}...`, 
            icon: 'sync', 
            spin: true,
        });

        useNotificationStore.getState().addNotification({
            id: notifId,
            type: 'loading',
            title: `Initializing ${language.toUpperCase()} Server`,
            source: 'MS Code LSP',
            message: 'Checking dependencies...',
        });

        try {
            consoleLogs += `> Checking for existing installation: ${config.checkCmd}\n`;
            
            const checkRes = await NativeTerminal.backgroundExecute({
                sessionId: notifId + '_check',
                command: config.checkCmd
            });

            if (checkRes.exitCode === 0) {
                consoleLogs += `> Server binary found! Skipping installation.\n`;
                useNotificationStore.getState().updateNotification(notifId, {
                    message: 'Dependencies verified. Booting up server...',
                    fullMessage: consoleLogs
                });
            } else {
                const pkgs = config.packages.join(' ');
                if (pkgs) {
                    consoleLogs += `> Executing: apk add --no-cache ${pkgs}\n`;
                    useNotificationStore.getState().updateNotification(notifId, {
                        message: `Installing ${language} toolchain... (Expand to view logs)`,
                        fullMessage: consoleLogs
                    });
                    
                    const exitCode = await this.executeStreamCommand(notifId, `apk add --no-cache ${pkgs}`, (data) => {
                        consoleLogs += data;
                        useNotificationStore.getState().updateNotification(notifId, { fullMessage: consoleLogs });
                    });

                    if (exitCode !== 0) throw new Error(`Package installation failed (Exit Code: ${exitCode})`);
                }

                if (config.postInstall && config.postInstall.length > 0) {
                    for (const cmd of config.postInstall) {
                        consoleLogs += `\n> Executing: ${cmd}\n`;
                        useNotificationStore.getState().updateNotification(notifId, {
                            message: `Running setup: ${cmd}...`, 
                            fullMessage: consoleLogs
                        });
                        
                        const exitCode = await this.executeStreamCommand(notifId, cmd, (data) => {
                            consoleLogs += data;
                            useNotificationStore.getState().updateNotification(notifId, { fullMessage: consoleLogs });
                        });

                        if (exitCode !== 0) throw new Error(`Setup command failed: ${cmd}`);
                    }
                }
            }

            consoleLogs += `\n> Booting language server process...\n`;
            useNotificationStore.getState().updateNotification(notifId, {
                message: 'Booting up server...', 
                fullMessage: consoleLogs
            });

            const result = await NativeTerminal.spawnLsp({ command: config.serverCmd });
            
            if (result && result.port) {
                this.activeLanguage = language;
                this.activePort = result.port;
                
                useNotificationStore.getState().updateNotification(notifId, {
                    message: 'Server process spawned. Connecting to editor...',
                });
                return this.activePort;
            }
            throw new Error('Port not received from Java Backend');

        } catch (err: any) {
            console.error(`[LSP] Failed to start ${language} server:`, err);
            useNotificationStore.getState().updateNotification(notifId, {
                type: 'error', 
                message: `Boot failed: ${err.message}`, 
                fullMessage: consoleLogs + `\n[ERROR] ${err.message}`
            });
            useStatusBarStore.getState().updateItem('lsp-status', {
                label: 'LSP Error', 
                icon: 'error', 
                spin: false, 
                color: 'var(--vscode-errorForeground)'
            });
            return null;
        }
    }

    /**
     * Resets runtime pointers, disconnecting trace targets to clean up structural processes.
     */
    public stopServer(): void {
        this.activeLanguage = null;
        this.activePort = null;
    }

    /**
     * Resolves the active operational language host identifier from current runtime parameters.
     * 
     * @returns Programming language key identifier string, or null if no language engine is running.
     */
    public getActiveLanguage(): string | null {
        return this.activeLanguage;
    }
}

/**
 * Global singleton reference directing processing actions toward the application shell native platform LSP engine wrapper.
 */
export const lspProcessManager = new LspProcessManager();
