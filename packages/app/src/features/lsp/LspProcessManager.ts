// src/features/lsp/LspProcessManager.ts
import { Capacitor, registerPlugin } from '@capacitor/core';
import { useNotificationStore } from '@/store/notificationStore';
import { useStatusBarStore } from '@/features/statusbar/store/statusBarStore';

const NativeTerminal = registerPlugin<any>('NativeTerminal');

const LANGUAGE_CONFIGS: Record<string, { packages: string[]; postInstall?: string[]; checkCmd: string; serverCmd: string }> = {};

// APK exit code 99 = database temporarily locked by another process.
const APK_LOCK_EXIT_CODE = 99;
const APK_MAX_RETRIES    = 3;
const APK_RETRY_DELAY_MS = 3_000;

export class LspProcessManager {

    // ─── Port registry ────────────────────────────────────────────────────────
    // Tracks every language that has a running server: language → port.
    // replaces the old single-slot (activeLanguage + activePort) pair so that
    private activePorts = new Map<string, number>();
    private pendingStarts = new Map<string, Promise<number | null>>();

    // ─── Serial installation queue ────────────────────────────────────────────
    // `apk add` holds a system-wide lock while it runs. Running two installs
    // concurrently causes exit code 99 ("database temporarily unavailable").
    // Every new startServer call chains off this Promise so only one
    // _doStart body executes at a time.
    private installQueue: Promise<void> = Promise.resolve();

    public dynamicConfigs: Record<string, any> = {};

    public registerDynamicConfig(language: string, config: any): void {
        this.dynamicConfigs[language] = config;
    }

    public removeDynamicConfig(language: string): void {
        delete this.dynamicConfigs[language];
    }

    // ─── Low-level streaming ───────────────────────────────
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

    private async executeWithRetry(
        baseSessionId: string,
        command: string,
        onLog: (data: string) => void,
    ): Promise<number> {
        for (let attempt = 1; attempt <= APK_MAX_RETRIES; attempt++) {
            const exitCode = await this.executeStreamCommand(
                `${baseSessionId}_attempt${attempt}`,
                command,
                onLog,
            );

            if (exitCode === 0) return 0;

            if (exitCode === APK_LOCK_EXIT_CODE && attempt < APK_MAX_RETRIES) {
                onLog(`\n> APK database locked (exit 99) — retrying in ${APK_RETRY_DELAY_MS / 1000}s… (${attempt}/${APK_MAX_RETRIES})\n`);
                await new Promise(r => setTimeout(r, APK_RETRY_DELAY_MS));
                continue;
            }

            return exitCode; // non-retryable failure
        }
        return -1;
    }

    // ─── Public entry point ───────────────────────────────────────────────────
    public startServer(language: string): Promise<number | null> {
        if (!Capacitor.isNativePlatform()) return Promise.resolve(null);

        const config = this.dynamicConfigs[language] || LANGUAGE_CONFIGS[language];
        if (!config) return Promise.resolve(null);

        // Fast path 1: server is already up and running.
        const cached = this.activePorts.get(language);
        if (cached) return Promise.resolve(cached);

        // Fast path 2: an install for this exact language is already in progress.
        // Return the same Promise so the caller just awaits the existing work.
        const inflight = this.pendingStarts.get(language);
        if (inflight) return inflight;

        // Slow path: queue behind any running installation so we never run two
        // `apk add` commands at the same time (avoids database-lock exit 99).
        let releaseQueue!: () => void;
        const mySlot = new Promise<void>(r => { releaseQueue = r; });

        // Chain: next caller waits for mySlot, which we release in finally{}.
        const prevQueue    = this.installQueue;
        this.installQueue  = mySlot;

        const promise = prevQueue
            .then(() => this._doStart(language))
            .finally(() => {
                this.pendingStarts.delete(language);
                releaseQueue(); // let the next queued language proceed
            });

        this.pendingStarts.set(language, promise);
        return promise;
    }

    // ─── Core install + spawn logic ───────────────────────────────────────────
    private async _doStart(language: string): Promise<number | null> {
        const config = this.dynamicConfigs[language] || LANGUAGE_CONFIGS[language];

        // Re-check: another queued call may have already finished this language
        // while we were waiting in the queue.
        const cached = this.activePorts.get(language);
        if (cached) return cached;

        const notifId   = `lsp-boot-${language}`;
        let consoleLogs = '';

        useStatusBarStore.getState().updateItem('lsp-status', {
            label: `Starting ${language}…`,
            icon: 'sync',
            spin: true,
        });

        useNotificationStore.getState().addNotification({
            id: notifId,
            type: 'loading',
            title: `Initializing ${language.toUpperCase()} Server`,
            source: 'MS Code LSP',
            message: 'Checking dependencies…',
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
                    message: 'Dependencies verified. Booting up server…',
                    fullMessage: consoleLogs,
                });
            } else {
                const pkgs = config.packages.join(' ');
                if (pkgs) {
                    consoleLogs += `> Executing: apk add --no-cache ${pkgs}\n`;
                    useNotificationStore.getState().updateNotification(notifId, {
                        message: `Installing ${language} toolchain… (expand to view logs)`,
                        fullMessage: consoleLogs,
                    });

                    const exitCode = await this.executeWithRetry(
                        notifId,
                        `apk add --no-cache ${pkgs}`,
                        (data) => {
                            consoleLogs += data;
                            useNotificationStore.getState().updateNotification(notifId, { fullMessage: consoleLogs });
                        }
                    );

                    if (exitCode !== 0) throw new Error(`Package installation failed (Exit Code: ${exitCode})`);
                }

                if (config.postInstall?.length) {
                    for (const cmd of config.postInstall) {
                        consoleLogs += `\n> Executing: ${cmd}\n`;
                        useNotificationStore.getState().updateNotification(notifId, {
                            message: `Running setup: ${cmd}…`,
                            fullMessage: consoleLogs,
                        });

                        const exitCode = await this.executeWithRetry(
                            `${notifId}_post`,
                            cmd,
                            (data) => {
                                consoleLogs += data;
                                useNotificationStore.getState().updateNotification(notifId, { fullMessage: consoleLogs });
                            }
                        );

                        if (exitCode !== 0) throw new Error(`Setup command failed: ${cmd}`);
                    }
                }
            }

            consoleLogs += `\n> Booting language server process…\n`;
            useNotificationStore.getState().updateNotification(notifId, {
                message: 'Booting up server…',
                fullMessage: consoleLogs,
            });

            const result = await NativeTerminal.spawnLsp({ command: config.serverCmd });

            if (result?.port) {
                this.activePorts.set(language, result.port);

                useNotificationStore.getState().updateNotification(notifId, {
                    message: 'Server process spawned. Connecting to editor…',
                });
                return result.port;
            }
            throw new Error('Port not received from Java Backend');

        } catch (err: any) {
            console.error(`[LSP] Failed to start ${language} server:`, err);
            useNotificationStore.getState().updateNotification(notifId, {
                type: 'error',
                message: `Boot failed: ${err.message}`,
                fullMessage: consoleLogs + `\n[ERROR] ${err.message}`,
            });
            useStatusBarStore.getState().updateItem('lsp-status', {
                label: 'LSP Error',
                icon: 'error',
                spin: false,
                color: 'var(--vscode-errorForeground)',
            });
            return null;
        }
    }

    public stopServer(language?: string): void {
        if (language) {
            this.activePorts.delete(language);
        } else {
            this.activePorts.clear();
        }
    }

    public getActiveLanguage(): string | null {
        // Returns the most recently started language (Map preserves insertion order).
        const keys = [...this.activePorts.keys()];
        return keys.at(-1) ?? null;
    }
}

export const lspProcessManager = new LspProcessManager();