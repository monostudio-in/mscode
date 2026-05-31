// src/features/extensions/services/extensionHost.ts

import { createMSCodeAPI } from '@/core/extensionAPI/mscode';
import { executeSandboxed } from '@/core/extensionAPI/sandbox/createSandbox';
import { windowAPI } from '@/core/extensionAPI/registry/outputAPI';
import { loadManifestSafely } from './extensionLoader';
import { fs } from '@/core/fileSystem';

interface ActiveExtension {
  subscriptions: Array<{ dispose: () => void }>;
  deactivate: (() => void | Promise<void>) | undefined;
}

const activeMap = new Map<string, ActiveExtension>();

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
    windowAPI.createOutputChannel('Extension Host').appendLine(formatted);
  } catch (e) {
    // Fail silently if output channel layer is uninitialized during boots
  }
};

/**
 * Service orchestrator handling lifecycle initialization, isolated runtime sandboxing, 
 * activation states, and disposal tracking routines for all system extensions.
 */
export const ExtensionHost = {
  activateExtension: async (extId: string, storeDir: string): Promise<void> => {
    if (activeMap.has(extId)) {
      logHost(`[Warning] Already active: ${extId}`);
      return;
    }

    try {
      logHost(`Booting up extension: ${extId}`);
      
      
      // const manifestPath = `ms-storage://${storeDir}/manifest.json`;
      // const manifestStr = await fs.readFile(manifestPath);
      // const manifest = JSON.parse(manifestStr);
      const manifest = await loadManifestSafely(storeDir);

      // Route entry points for structural metadata packages (e.g., Snippets, Dynamic Themes)
      if (!manifest.main) {
        activeMap.set(extId, { subscriptions: [], deactivate: undefined });
        logHost(`Activated (Data-only): ${extId}`);
        return;
      }

      const scriptPath = `ms-storage://${storeDir}/${manifest.main}`;
      const code = await fs.readFile(scriptPath);
      
      const baseUrl = `ms-storage://${storeDir}/`;
      const mscodeAPI = createMSCodeAPI(extId);  
      
      const { activate, deactivate } = executeSandboxed(code, mscodeAPI, baseUrl, storeDir);
      const context: ActiveExtension = { subscriptions: [], deactivate };

      if (activate) {
        await activate(context); 
      }

      activeMap.set(extId, context);
      logHost(`✅ Activated: ${extId}`);

    } catch (err: any) {
      logHost(`❌ Failed: ${extId} - ${err.message || err}`, true);
    }
  },

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

  initAllEnabledExtensions: async (records: Record<string, { state: string, installedFrom: string }>): Promise<void> => {
    const toActivate = Object.entries(records).filter(([, r]) => r.state === 'installed-enabled');

    logHost(`Booting ${toActivate.length} extension(s)…`);
    
    await Promise.all(toActivate.map(([id, record]) => {
      const storeDir = record.installedFrom?.replace('store/', '') || '';
      return ExtensionHost.activateExtension(id, storeDir);
    }));
    
    logHost('Startup complete.');
  },

  isActive: (extId: string): boolean => activeMap.has(extId),
};
