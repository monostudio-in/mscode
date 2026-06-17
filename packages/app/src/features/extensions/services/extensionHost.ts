// src/features/extensions/services/extensionHost.ts

import { createMSCodeAPI } from '@/core/extensionAPI/mscode';
import { executeSandboxed } from '@/core/extensionAPI/sandbox/createSandbox';
import { loadManifestSafely } from './extensionLoader';
import { fs } from '@/core/fileSystem';
import { createOutputAPI } from '@/core/extensionAPI/modules/window/outputAPI';

interface ActiveExtension {
  subscriptions: Array<{ dispose: () => void }>;
  extensionId: string;
  extensionPath: string;
  manifest?: any;
  deactivate: (() => void | Promise<void>) | undefined;
}

const activeMap = new Map<string, ActiveExtension>();

// Lazy Loading Output Channel
// To prevent Zustand from crashing during app initialization, the channel is created only when the first log is emitted.
let hostOutputChannel: ReturnType<ReturnType<typeof createOutputAPI>['createOutputChannel']> | null = null;

const getHostChannel = () => {
  if (!hostOutputChannel) {
    hostOutputChannel = createOutputAPI().createOutputChannel('Extension Host');
  }
  return hostOutputChannel;
};

/**
 * Pipes execution metrics and tracking states directly into the development console 
 * and the application's native dedicated shared output panel channel workspace.
 */
const logHost = (msg: string, isError = false) => {
  const time = new Date().toLocaleTimeString();
  const formatted = `[${time}] ${msg}`;
  
  if (isError) {
    console.error(formatted);
  } else {
    console.log(formatted);
  }
  
  try {
    getHostChannel().appendLine(formatted);
  } catch (e) {
    // Fail silently if output channel layer is uninitialized during boots
  }
};

/**
 * Service orchestrator handling lifecycle initialization, isolated runtime sandboxing, 
 * activation states, and disposal tracking routines for all system extensions.
 */
export const ExtensionHost = {
  
  /**
   * Activates an extension by loading its manifest, executing its main script inside a sandbox, 
   * and registering its lifecycle hooks.
   * @param extId The unique identifier of the extension.
   * @param storeDir The directory path where the extension is stored.
   */
  activateExtension: async (extId: string, storeDir: string): Promise<void> => {
    if (activeMap.has(extId)) {
      logHost(`[Warning] Already active: ${extId}`);
      return;
    }

    try {
      logHost(`Booting up extension: ${extId}`);
      
      const manifest = await loadManifestSafely(storeDir);
      const extensionPath = `ms-storage://${storeDir}`;

      // Data-only extensions (like themes or snippets) don't have a main script
      if (!manifest.main) {
        activeMap.set(extId, { 
          subscriptions: [], 
          extensionId: extId, 
          extensionPath: extensionPath, 
          deactivate: undefined 
        });
        logHost(`Activated (Data-only): ${extId}`);
        return;
      }

      const scriptPath = `${extensionPath}/${manifest.main}`;
      const code = await fs.readFile(scriptPath);
      
      const baseUrl = `${extensionPath}/`;
      const mscodeAPI = createMSCodeAPI(extId);  
      
      const { activate, deactivate } = executeSandboxed(code, mscodeAPI, baseUrl, storeDir, extId);
      
      const context = { 
        subscriptions: [], 
        extensionId: extId,
        extensionPath: extensionPath,
        extension: {
            id: extId,
            extensionPath: extensionPath,
            isActive: true,
            manifestJSON: manifest
        }
      };

      if (activate) {
        await activate(context);
      }

      activeMap.set(extId, { ...context, manifest, deactivate });
      logHost(`✅ Activated: ${extId}`);

    } catch (err: any) {
      logHost(`❌ Failed: ${extId} - ${err.message || err}`, true);
    }
  },

  /**
   * Deactivates a running extension, triggering its deactivate hook and disposing of all active subscriptions.
   * @param extId The unique identifier of the extension to deactivate.
   */
  deactivateExtension: async (extId: string): Promise<void> => {
    const ext = activeMap.get(extId);
    if (!ext) return;

    try {
      if (ext.deactivate) {
        await ext.deactivate();
      }
      
      ext.subscriptions.forEach(s => { 
        try { 
          s.dispose(); 
        } catch {
          // Guard against broken inner disposers throwing loops out of alignment
        } 
      });
      
      activeMap.delete(extId);
      logHost(`🛑 Deactivated: ${extId}`);
    } catch (err: any) {
      logHost(`❌ Deactivation error: ${extId} - ${err.message || err}`, true);
    }
  },

  /**
   * Initializes and boots up all extensions marked as 'installed-enabled' in the system records.
   * @param records A dictionary of extension states and installation paths.
   */
  initAllEnabledExtensions: async (records: Record<string, { state: string, installedFrom: string }>): Promise<void> => {
    const toActivate = Object.entries(records).filter(([, r]) => r.state === 'installed-enabled');

    logHost(`Booting ${toActivate.length} extension(s)…`);
    
    await Promise.all(toActivate.map(([id, record]) => {
      const storeDir = record.installedFrom?.replace('store/', '') || '';
      return ExtensionHost.activateExtension(id, storeDir);
    }));
    
    logHost('Startup complete.');
  },

  /**
   * Checks whether a specific extension is currently active in the runtime map.
   * @param extId The unique identifier of the extension.
   * @returns true if the extension is running, false otherwise.
   */
  isActive: (extId: string): boolean => activeMap.has(extId),
  getExtensionManifest: (extId: string): any => activeMap.get(extId)?.manifest,
};