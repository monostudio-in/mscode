// src/features/editor/hooks/useLspSync.ts

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import * as monaco from 'monaco-editor';
import { useSettingsStore }      from '@/features/settings/store/settingsStore';
import { useStatusBarStore } from '@/features/statusbar/store/statusBarStore';
import { useNotificationStore }  from '@/store/notificationStore';
import { useTabStore }           from '@/store/tabStore';
import { useOutputStore } from '@/features/termis/components/output/store/outputStore';
import { windowAPI }             from '@/core/extensionAPI/registry/outputAPI';

import type { ILspService }                                              from '@/core/services/ILspService';
import { lspProcessManager as realProcessManager }                  from '@/features/lsp/LspProcessManager';
import { lspMockProcessManager }                                    from '@/features/lsp/LspMockProcessManager';
import { LspService }                 from '@/core/services/lsp/LspService';
import { LspMockService }                                           from '@/core/services/lsp/LspMockService';

export const realLspService = new LspService();
export const mockLspService = new LspMockService();


// ─── Environment ──────────────────────────────────────────────────────────────
const isWeb  = Capacitor.getPlatform() === 'web';

export const activeLspService = (isWeb ? mockLspService : realLspService) as ILspService;
const activeProcessManager = isWeb ? lspMockProcessManager : realProcessManager;


// Built-in languages handled entirely by Monaco workers
const BUILTIN_LANGS = new Set([
  'javascript', 'typescript', 'json', 'html', 'css', 'scss', 'less',
]);

let lastNotifiedLang: string | null = null;

function refractorLangId(langId: string): string {
  const map: Record<string, string> = {
    javascript: 'Js', typescript: 'Ts', python: 'Py',
    markdown: 'Md', cpp: 'C++', c: 'C',
  };
  return map[langId] ?? (langId.charAt(0).toUpperCase() + langId.slice(1));
}

// ─── Real file URI from tab ────────────────────────────────────────────────────

/**
 * Build the real file:// URI for the active tab.
 * tabStore.Tab has filePath (the actual disk path) and id (which may itself
 * be a file:// URI for code tabs). Falls back to the model uri.
 */
function resolveFileUri(
  tab: { id: string; filePath?: string; title?: string } | undefined,
  model: monaco.editor.ITextModel,
): string {
  // 1. Prefer explicit filePath on the tab
  if (tab?.filePath) {
    const p = tab.filePath;
    return p.startsWith('file://') ? p : `file://${p}`;
  }
  // 2. Tab id might already be a file:// URI
  if (tab?.id && tab.id.startsWith('file://')) return tab.id;
  // 3. Model uri (works for real file models, not inmemory)
  const mu = model.uri.toString();
  if (!mu.startsWith('inmemory')) return mu;
  // 4. Give up — use a synthetic path based on title
  return `file:///sdcard/${tab?.title ?? 'untitled'}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLspSync(editorInstance: any, tabId: string) {
  const settings    = useSettingsStore(s => s.settings);
  const activeTabId = useTabStore(s => s.activeTabId);
  const tabs        = useTabStore(s => s.tabs);
  const bootingRef  = useRef(false);  // prevents double-boot during async startup

  // Register status-bar slot once
  useEffect(() => {
    useStatusBarStore.getState().registerItem({
      id: 'lsp-status', alignment: 'right', priority: 55,
      label: 'LSP: Off', icon: 'check',
    });
  }, []);

  useEffect(() => {
    if (tabId !== activeTabId || !editorInstance) return;

    const model = editorInstance.getModel();
    if (!model) return;

    const langId    = model.getLanguageId();
    const notifId   = `lsp-boot-${langId}`;
    const isBuiltIn = BUILTIN_LANGS.has(langId);
    const isEnabled = settings[`lsp.${langId}.enabled`] ?? true;

    // ── Active tab's real file path ────────────────────────────────────────
    const activeTab  = tabs.find(t => t.id === activeTabId);
    const fileUri    = resolveFileUri(activeTab, model);

    // Always register the per-model URI so _getDocUri() works correctly
    // This must happen BEFORE any LSP call (connect, notifyDocumentOpen, etc.)
    if (!isBuiltIn) {
      activeLspService.registerModelUri(model, fileUri);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 1. BUILT-IN LANGUAGES (Monaco Workers)
    // ══════════════════════════════════════════════════════════════════════
    if (isBuiltIn) {
      const monacoLangs = monaco.languages as any;

      if (langId === 'javascript' || langId === 'typescript') {
        const defaults = langId === 'javascript'
          ? monacoLangs.typescript.javascriptDefaults
          : monacoLangs.typescript.typescriptDefaults;

        const isLinting = settings[`lsp.${langId}.linting`] ?? true;
        defaults.setDiagnosticsOptions({
          noSemanticValidation: !isEnabled || !isLinting,
          noSyntaxValidation:   !isEnabled || !isLinting,
          diagnosticCodesToIgnore: settings['lsp.javascript.ignoreCodes'] || [],
        });

        const currentOpts = defaults.getCompilerOptions() || {};
        if (langId === 'javascript') {
          defaults.setCompilerOptions({
            ...currentOpts,
            allowNonTsExtensions: true,
            noImplicitAny:    !!settings['lsp.javascript.implicitAny'],
            strictNullChecks: !!settings['lsp.javascript.strictNullChecks'],
            target: monacoLangs.typescript.ScriptTarget.ESNext,
          });
        } else {
          defaults.setCompilerOptions({
            ...currentOpts,
            allowNonTsExtensions: true,
            strict:             !!settings['lsp.typescript.strictMode'],
            noUnusedLocals:     !!settings['lsp.typescript.unusedLocals'],
            noUnusedParameters: !!settings['lsp.typescript.unusedParameters'],
            target: monacoLangs.typescript.ScriptTarget.ESNext,
          });
        }
        defaults.setEagerModelSync(true);
      }

      else if (langId === 'json') {
        monacoLangs.json.jsonDefaults.setDiagnosticsOptions({
          validate:         isEnabled && settings['lsp.json.schemaValidation'] !== false,
          allowComments:    true,
          schemaValidation: isEnabled ? 'error' : 'ignore',
        });
      }

      else if (langId === 'html') {
        monacoLangs.html.htmlDefaults.setOptions({
          format: {
            enable:       true,
            insertSpaces: settings['editor.insertSpaces'] ?? true,
            tabSize:      settings['editor.tabSize'] ?? 4,
          },
          suggest: { html5: true },
        });
        editorInstance.updateOptions({
          matchBrackets:       settings['lsp.html.tagMatching'] !== false ? 'always' : 'never',
          autoClosingBrackets: settings['lsp.html.autoCloseTag']   !== false ? 'always' : 'never',
        });
      }

      else if (['css', 'scss', 'less'].includes(langId)) {
        const cssOpts = {
          validate: isEnabled && (settings[`lsp.${langId}.linting`] ?? true),
          lint: {
            unknownProperties: settings['lsp.css.lint.unknownProperties'] !== false ? 'warning' : 'ignore',
            emptyRules: 'warning',
          },
        };
        if (langId === 'css')  monacoLangs.css.cssDefaults.setOptions(cssOpts);
        if (langId === 'scss') monacoLangs.css.scssDefaults.setOptions(cssOpts);
        if (langId === 'less') monacoLangs.css.lessDefaults.setOptions(cssOpts);
        editorInstance.updateOptions({
          colorDecorators: settings['lsp.css.colorDecorators'] !== false,
        });
      }

      // Status bar + notification for built-ins
      if (isEnabled) {
        useStatusBarStore.getState().updateItem('lsp-status', {
          label: `{${refractorLangId(langId)}}`,
          icon: 'check', spin: false,
          color: 'var(--vscode-testing-iconPassed, #73c991)',
        });
        if (lastNotifiedLang !== langId) {
          lastNotifiedLang = langId;
          useNotificationStore.getState().addNotification({
            id: notifId, type: 'info',
            title: `${langId.toUpperCase()} Features Active`,
            source: 'Monaco Native',
            message: `Built-in language server for ${langId} is running.`,
          });
          setTimeout(() => useNotificationStore.getState().dismissToast(notifId), 2000);
        }
      } else {
        useStatusBarStore.getState().updateItem('lsp-status', {
          label: 'LSP: Off', icon: 'check', color: 'inherit',
        });
      }

      // Disconnect any external LSP if we switched to a built-in
      if (activeLspService.isConnected) {
        activeLspService.disconnect();
        activeProcessManager.stopServer();
        lastNotifiedLang = null;
      }
      return;
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. EXTERNAL LANGUAGES (Python, C/C++, Rust, …)
    // ══════════════════════════════════════════════════════════════════════

    const dynamicConfig = (activeProcessManager as any).dynamicConfigs?.[langId];
    if (!dynamicConfig || !isEnabled) {
      if (activeLspService.isConnected) {
        activeLspService.disconnect();
        activeProcessManager.stopServer();
      }
      useStatusBarStore.getState().updateItem('lsp-status', {
        label: 'LSP: Off', icon: 'check', color: 'inherit',
      });
      return;
    }
    const currentLang = activeProcessManager.getActiveLanguage?.() ?? null;

  
    // ══════════════════════════════════════════════════════════════════════
    // SAME language, server process running, WebSocket connected
    //    (may still be initializing — race window handled via waitUntilReady)
    //    → DON'T reconnect. Never call connect() while a connection is live.
    //      clangd supports only ONE client; a second connect() destroys the
    //      existing session and causes "LSP initialize timeout".
    // ══════════════════════════════════════════════════════════════════════
    if (
      currentLang === langId &&
      activeLspService.isConnected  // WebSocket is open (even if handshake ongoing)
    ) {
      activeLspService.registerModelUri(model, fileUri);

      if (activeLspService.initialized) {
        // Handshake already done — send didOpen immediately
        activeLspService.notifyDocumentOpen(model);
        console.log(`[LSP] Tab switch within ${langId} — didOpen sent, no reconnect`);
      } else {
        // WebSocket is open but handshake still running (rare race window).
        // Wait for it, THEN send didOpen. Do NOT call connect() again.
        console.log(`[LSP] Tab switch within ${langId} — waiting for handshake…`);
        activeLspService.waitUntilReady()
          .then(() => {
            activeLspService.notifyDocumentOpen(model);
            console.log(`[LSP] Tab switch within ${langId} — didOpen sent after handshake`);
          })
          .catch((e) => {
            console.warn(`[LSP] waitUntilReady rejected during tab switch:`, e);
          });
      }
      return; // sync return to useEffect, no boot()
    }

    // DIFFERENT language OR server not running → full boot
    if (currentLang && currentLang !== langId) {
      activeLspService.disconnect();
      activeProcessManager.stopServer();
    }

    // Output channel for this language server's logs
    const channelName   = `LSP: ${refractorLangId(langId)}`;
    const outputChannel = windowAPI.createOutputChannel(channelName);

    useOutputStore.getState().registerKillHandler(channelName, () => {
      activeLspService.disconnect();
      activeProcessManager.stopServer();
      useStatusBarStore.getState().updateItem('lsp-status', {
        label: 'LSP: Killed', icon: 'close', color: 'var(--ms-error)',
      });
    });

    if (bootingRef.current) return;
    bootingRef.current = true;

    const boot = async () => {
      try {
        outputChannel.appendLine(`[INFO] Starting ${langId} language server…`);

        useStatusBarStore.getState().updateItem('lsp-status', {
          label: `Starting ${refractorLangId(langId)}…`, icon: 'sync', spin: true,
        });
        useNotificationStore.getState().addNotification({
          id: notifId, type: 'loading',
          title: `Initializing ${langId.toUpperCase()} Server`,
          source: 'MS Code LSP',
          message: 'Checking dependencies…',
        });

        const port = await activeProcessManager.startServer(langId);
        if (!port) {
          outputChannel.appendLine(`[ERROR] Failed to start ${langId} server process.`);
          bootingRef.current = false;
          return;
        }

        outputChannel.appendLine(`[INFO] Server process on port ${port}. Connecting…`);

        // Compute rootUri from the file's directory
        const rootUri = (() => {
          const lspFileUri = fileUri.replace('file:///storage/emulated/0', 'file:///sdcard');
          const lastSlash  = lspFileUri.lastIndexOf('/');
          return lastSlash > 0 ? lspFileUri.substring(0, lastSlash) : 'file:///sdcard';
        })();

        let lspOptions: Record<string, any> = {
          hover:      settings[`lsp.${langId}.hover`]      ?? true,
          completion: settings[`lsp.${langId}.completion`] ?? true,
          linting:    settings[`lsp.${langId}.linting`]    ?? true,
          rootUri,
          // fileUri not passed here — per-model URIs are registered via
          //    registerModelUri() above, before boot() is called.
        };

        if (typeof dynamicConfig.resolveOptions === 'function') {
          lspOptions = { ...lspOptions, ...dynamicConfig.resolveOptions(settings) };
        }

        // connect() opens WebSocket + does LSP initialize handshake
        activeLspService.connect(langId, `ws://127.0.0.1:${port}`, lspOptions);

        // Wait for initialized flag (WebSocket onopen + initialize() are async)
        // Poll with a short timeout so we can send didOpen after handshake
        await new Promise<void>((resolve, reject) => {
          const start    = Date.now();
          const interval = setInterval(() => {
            if (activeLspService.initialized) {
              clearInterval(interval);
              resolve();
            }
            if (Date.now() - start > 15_000) {
              clearInterval(interval);
              reject(new Error('LSP initialize timeout'));
            }
          }, 100);
        });

        //send didOpen for the current model immediately after handshake
        activeLspService.registerModelUri(model, fileUri);
        activeLspService.notifyDocumentOpen(model);

        outputChannel.appendLine(`[INFO] ${refractorLangId(langId)} LSP ready.`);
        outputChannel.show();

        useStatusBarStore.getState().updateItem('lsp-status', {
          label: `{${refractorLangId(langId)}}`,
          icon: 'check', spin: false,
          color: 'var(--vscode-testing-iconPassed, #73c991)',
        });
        useNotificationStore.getState().updateNotification(notifId, {
          type: 'info', title: 'LSP Connected',
          message: `${refractorLangId(langId)} Language Server is ready.`,
        });
        setTimeout(() => useNotificationStore.getState().dismissToast(notifId), 3000);
        lastNotifiedLang = langId;

      } catch (err: any) {
        outputChannel.appendLine(`[ERROR] ${err.message ?? err}`);
        console.error(`[LSP-Sync] Boot error for ${langId}:`, err);
        useStatusBarStore.getState().updateItem('lsp-status', {
          label: 'LSP Error', icon: 'error', spin: false,
          color: 'var(--vscode-errorForeground)',
        });
        useNotificationStore.getState().updateNotification(notifId, {
          type: 'error',
          message: `Boot failed: ${err.message}`,
        });
      } finally {
        bootingRef.current = false;
      }
    };

    boot();

    return () => {
      // Cleanup
      activeLspService.unregisterModelUri(model);
      bootingRef.current = false;
    };

  }, [editorInstance, settings, activeTabId, tabId]);
}