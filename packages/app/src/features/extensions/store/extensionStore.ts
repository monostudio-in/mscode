// src/features/extensions/store/extensionStore.ts
import { create }   from 'zustand';
import { persist }  from 'zustand/middleware';

import type { Extension, ExtensionFilter, ExtensionRecord , ExtensionManifest} from '../types';
import { fetchExtensionRegistry }                           from '../api/extensionApi';
import { syncExtensionConfigurations }                      from '../services/extensionConfigSync';
import { ExtensionHost }                                    from '../services/extensionHost';
import { installExtensionFromLocal,
         installExtensionFromCloud }                        from '../services/extensionInstaller';
import { loadManifestSafely } from '../services/extensionLoader';
import { fs }                                               from '@/core/fileSystem';
import { supabase }                                         from '@/core/server/supabaseClient';
import { useNotificationStore }                             from '@/store/notificationStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';


// §1  Types & helpers
/**
 * Returns `true` when `newVer` is strictly greater than `oldVer`.
 * Uses locale-aware numeric comparison so "1.10.0" > "1.9.0".
 */
const isNewerVersion = (oldVer: string, newVer: string): boolean =>
  oldVer.localeCompare(newVer, undefined, { numeric: true, sensitivity: 'base' }) < 0;


// §2  Store state interface
interface ExtensionStoreState {
  // ── Data ──────────────────────────────────────────────────────────────────
  /** Merged list of all known extensions (local + remote registry). */
  allExtensions: Extension[];
  /** Persisted map of installed extension records keyed by extension ID. */
  records: Record<string, ExtensionRecord>;
  /** Map of extension ID → newest available version string for pending updates. */
  updatesAvailable: Record<string, string>;

  // ── UI state ──────────────────────────────────────────────────────────────
  isLoading: boolean;
  error: string | null;
  /** `true` while the background update check / page-0 refresh is running. */
  isCheckingUpdates: boolean;
  /** `true` while an infinite-scroll page load is in progress. */
  isLoadingMore: boolean;
  /** Current marketplace page index (0-based, used for infinite scroll). */
  storePage: number;
  /** `false` when the last fetch returned fewer items than the page size. */
  hasMore: boolean;
  /** Active filter state for the marketplace search UI. */
  filter: ExtensionFilter;

  // ── Actions ───────────────────────────────────────────────────────────────
  initExtensions:       ()                          => Promise<void>;
  fetchMarketplace:     (page?: number, forceRefresh?: boolean) => Promise<void>;
  loadExtensions:       ()                          => Promise<void>;
  install:              (id: string)                => Promise<void>;
  uninstall:            (id: string)                => Promise<void>;
  enable:               (id: string)                => Promise<void>;
  disable:              (id: string)                => Promise<void>;
  updateExtension:      (id: string)                => Promise<void>;
  installLocalExtension:(filePath: string)          => Promise<void>;
  linkLocalExtension: (folderPath: string)          => Promise<void>;
  setFilter:            (partial: Partial<ExtensionFilter>) => void;
  wakeUpByEvent:        (activationEvent: string)   => Promise<void>;
}


// §3  Store implementation
export const useExtensionStore = create<ExtensionStoreState>()(
  persist(
    (set, get) => ({

      // ── Initial state ────────
      allExtensions:    [],
      records:          {},
      updatesAvailable: {},
      filter:           { query: '', category: 'All' },
      isLoading:        false,
      error:            null,
      isCheckingUpdates:false,
      isLoadingMore:    false,
      storePage:        0,
      hasMore:          true,


      // ── §3a  initExtensions ────────
      initExtensions: async () => {
        if (get().allExtensions.length > 0) return;

        set({ isLoading: true, error: null });

        const persistedRecords  = get().records;
        const localExtensions: Extension[] = [];

        // Phase 1 — restore installed extensions from the local filesystem
        for (const [id, record] of Object.entries(persistedRecords)) {
          try {
            const manifest = await loadManifestSafely(record.installedFrom) as ExtensionManifest;
            localExtensions.push({
              ...manifest,
              id: id,
              storeDir:   record.installedFrom,
              downloads:  0,
              rating:     0,
              isBuiltIn:  false,
              isVerified: false,
              zipSize:    'Local',
            });
          } catch (err) {
            console.error(`[ExtensionStore] Failed to restore ${id}:`, err);
          }
        }

        await syncExtensionConfigurations(localExtensions, persistedRecords);
        await ExtensionHost.initAllEnabledExtensions(persistedRecords);
        set({ allExtensions: localExtensions, isLoading: false });

        // Phase 2 — background: merge registry data + check for updates
        get().fetchMarketplace(0, true);
      },


      // ── §3b  fetchMarketplace ──────────────────────────────────────────────
      fetchMarketplace: async (page = 0, forceRefresh = false) => {
        if (page === 0 && forceRefresh) set({ isCheckingUpdates: true, error: null });
        else                            set({ isLoadingMore: true,    error: null });

        try {
          const data             = await fetchExtensionRegistry(page, 10);
          const currentExts      = get().allExtensions;
          const mergedExts       = [...currentExts];
          const updates          = { ...get().updatesAvailable };
          const persistedRecords = get().records;

          for (const remoteExt of data) {
            const idx = mergedExts.findIndex(e => e.id === remoteExt.id);

            if (idx >= 0) {
              // Keep local storeDir; update everything else from the registry
              mergedExts[idx] = {
                ...mergedExts[idx],
                ...remoteExt,
                storeDir: mergedExts[idx].storeDir || remoteExt.id,
              };

              // Check for newer version if this is a forced refresh
              const record = persistedRecords[remoteExt.id];
              if (forceRefresh && record && isNewerVersion(record.version, remoteExt.version)) {
                updates[remoteExt.id] = remoteExt.version;
                useNotificationStore.getState().addNotification({
                  type:    'info',
                  title:   'Update Available',
                  message: `${remoteExt.name} has a new version.`,
                  source:  'Marketplace',
                  iconUrl: remoteExt.icon,
                  actions: [{
                    label:   'Update',
                    variant: 'type1',
                    onClick: () => get().updateExtension(remoteExt.id),
                  }],
                });
              }
            } else {
              mergedExts.push(remoteExt);
            }
          }

          // Auto-register built-in extensions that have no persisted record
          const builtInRecords: Record<string, ExtensionRecord> = {};
          for (const ext of mergedExts) {
            if (ext.isBuiltIn && !persistedRecords[ext.id]) {
              builtInRecords[ext.id] = {
                state:         'installed-enabled',
                installedAt:   Date.now(),
                version:       ext.version,
                installedFrom: `store/${ext.storeDir}`,
              };
            }
          }
          if (Object.keys(builtInRecords).length > 0) {
            set({ records: { ...builtInRecords, ...persistedRecords } });
          }

          set({
            allExtensions:    mergedExts,
            storePage:        page,
            hasMore:          data.length === 10,
            updatesAvailable: updates,
            isCheckingUpdates:false,
            isLoadingMore:    false,
          });
        } catch (e: any) {
          set({ error: e.message, isCheckingUpdates: false, isLoadingMore: false });
        }
      },


      // ── §3c  loadExtensions ────────────────────────────────────────────────
      loadExtensions: async () => {
        set({ isLoading: true, error: null });
        try {
          const data             = await fetchExtensionRegistry();
          const mergedExts       = [...data];
          const persistedRecords = get().records;
          const builtInRecords:  Record<string, ExtensionRecord> = {};
          const updates:         Record<string, string>          = {};

          // Restore local-only extensions (not present in the remote registry)
          for (const [id, record] of Object.entries(persistedRecords)) {
            const remoteExt = data.find(e => e.id === id);

            if (!remoteExt) {
              // Extension was installed locally — read its manifest from disk
              try {
                const manifest = await loadManifestSafely(record.installedFrom) as ExtensionManifest;
                
                mergedExts.push({
                  ...manifest,
                  id: id,
                  storeDir:   record.installedFrom,
                  downloads:  0,
                  rating:     0,
                  isBuiltIn:  false,
                  isVerified: false,
                  zipSize:    'Local',
                });
              } catch (err) {
                console.error(`[ExtensionStore] Failed to restore ${id}:`, err);
              }
            } else if (isNewerVersion(record.version, remoteExt.version)) {
              // Remote version is newer — queue an update notification
              updates[id] = remoteExt.version;
              useNotificationStore.getState().addNotification({
                type:    'info',
                title:   'Update Available',
                message: `${remoteExt.name} has a new version (v${remoteExt.version}).`,
                source:  'Marketplace',
                iconUrl: remoteExt.icon,
                actions: [{
                  label:   'Update Now',
                  variant: 'type1',
                  onClick: () => get().updateExtension(id),
                }],
              });
            }
          }

          // Auto-register built-ins with no existing record
          for (const ext of mergedExts) {
            if (ext.isBuiltIn && !persistedRecords[ext.id]) {
              builtInRecords[ext.id] = {
                state:         'installed-enabled',
                installedAt:   Date.now(),
                version:       ext.version,
                installedFrom: `store/${ext.storeDir}`,
              };
            }
          }

          const finalRecords = { ...builtInRecords, ...persistedRecords };
          await syncExtensionConfigurations(mergedExts, finalRecords);
          set({
            allExtensions:    mergedExts,
            isLoading:        false,
            records:          finalRecords,
            updatesAvailable: updates,
          });
          await ExtensionHost.initAllEnabledExtensions(finalRecords);

        } catch {
          set({ isLoading: false, error: 'Failed to load extensions.' });
        }
      },

      // ── §3d  install ───────────────────────────────────────────────────────
      
      install: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const ext = get().allExtensions.find(e => e.id === id);
          if (!ext) throw new Error('Extension not found.');

          const storeDir   = await installExtensionFromCloud(ext);
          const updatedExt = { ...ext, storeDir };

          const nextExts = get().allExtensions.map(e => e.id === id ? updatedExt : e);
          const nextRecords = {
            ...get().records,
            [id]: {
              state:         'installed-enabled',
              installedAt:   Date.now(),
              version:       ext.version,
              installedFrom: storeDir,
            } as any,
          };

          await syncExtensionConfigurations(nextExts, nextRecords);
          set({ allExtensions: nextExts, records: nextRecords, isLoading: false });
          await ExtensionHost.activateExtension(id, storeDir);

          (async () => {
            try {
              const { data: session } = await supabase.auth.getSession();
              if (!session.session) {
                await supabase.auth.signInAnonymously();
              }
              await supabase.rpc('increment_extension_download', { ext_id: id });
            } catch (rpcErr) {
              console.warn('[ExtensionStore] Download count increment failed (non-fatal):', rpcErr);
            }
          })();

        } catch (err: any) {
          set({ isLoading: false, error: err.message });
        }
      },


      // ── §3e  uninstall ─────────────────────────────────────────────────────
      uninstall: async (id) => {
        const ext = get().allExtensions.find(e => e.id === id);
        if (!ext || ext.isBuiltIn) return;

        await ExtensionHost.deactivateExtension(id);

        try {
          await fs.delete(`ms-storage://${ext.storeDir}`);
        } catch (err) {
          console.error(`[ExtensionStore] Delete failed for ${id}:`, err);
        }

        const nextRecords    = { ...get().records };
        delete nextRecords[id];
        const nextExtensions = get().allExtensions.filter(e => e.id !== id);

        await syncExtensionConfigurations(nextExtensions, nextRecords);
        set({ records: nextRecords, allExtensions: nextExtensions });
      },


      // ── §3f  updateExtension ───────────────────────────────────────────────
      updateExtension: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const ext       = get().allExtensions.find(e => e.id === id);
          const oldRecord = get().records[id];
          if (!ext || !oldRecord) throw new Error('Update data missing.');

          // 1 — download new files
          const newStoreDir = await installExtensionFromCloud(ext);

          // 2 — delete old directory (non-fatal)
          try {
            await fs.delete(`ms-storage://${oldRecord.installedFrom}`);
          } catch {
            console.warn(`[ExtensionStore] Old directory cleanup failed for ${id}`);
          }

          // 3 — update state
          const updatedExt  = { ...ext, storeDir: newStoreDir };
          const nextExts    = get().allExtensions.map(e => e.id === id ? updatedExt : e);
          const nextRecords = {
            ...get().records,
            [id]: { ...oldRecord, version: ext.version, installedFrom: newStoreDir } as any,
          };
          const nextUpdates = { ...get().updatesAvailable };
          delete nextUpdates[id];

          await syncExtensionConfigurations(nextExts, nextRecords);
          set({
            allExtensions:    nextExts,
            records:          nextRecords,
            updatesAvailable: nextUpdates,
            isLoading:        false,
          });

          // 4 — restart
          await ExtensionHost.deactivateExtension(id);
          await ExtensionHost.activateExtension(id, newStoreDir);

          // 5 — success notification
          useNotificationStore.getState().addNotification({
            type:    'info',
            title:   'Update Successful',
            message: `${ext.name} updated to v${ext.version}.`,
            source:  'System',
          });

        } catch (err: any) {
          set({ isLoading: false, error: err.message });
        }
      },


      // ── §3g  enable / disable ──────────────────────────────────────────────
      enable: async (id) => {
        const ext = get().allExtensions.find(e => e.id === id);
        if (!ext) return;

        const nextRecords = {
          ...get().records,
          [id]: { ...get().records[id], state: 'installed-enabled' } as any,
        };
        await syncExtensionConfigurations(get().allExtensions, nextRecords);
        set({ records: nextRecords });
        await ExtensionHost.activateExtension(id, ext.storeDir);
      },
      
      disable: async (id) => {
        const ext = get().allExtensions.find(e => e.id === id);
        if (!ext) return;

        await ExtensionHost.deactivateExtension(id);
        const nextRecords = {
          ...get().records,
          [id]: { ...get().records[id], state: 'installed-disabled' } as any,
        };
        await syncExtensionConfigurations(get().allExtensions, nextRecords);
        set({ records: nextRecords });
      },


      // ── §3h  installLocalExtension ─────────────────────────────────────────
      installLocalExtension: async (filePath) => {
        set({ isLoading: true, error: null });
        try {
          const { manifest, storeDir } = await installExtensionFromLocal(filePath);
          const completeManifest       = { ...manifest, storeDir };

          // Replace any existing entry with the same ID
          const nextExts = [
            ...get().allExtensions.filter(e => e.id !== completeManifest.id),
            completeManifest,
          ];
          const nextRecords = {
            ...get().records,
            [completeManifest.id]: {
              state:         'installed-enabled',
              installedAt:   Date.now(),
              version:       completeManifest.version,
              installedFrom: storeDir,
            } as any,
          };

          await syncExtensionConfigurations(nextExts, nextRecords);
          set({ allExtensions: nextExts, records: nextRecords, isLoading: false });
          await ExtensionHost.activateExtension(completeManifest.id, storeDir);

        } catch (error: any) {
          set({ isLoading: false, error: `Installation failed: ${error.message}` });
        }
      },
      
      
      // ── §3h(2) linkLocalExtension (Development Mode) ────────────────────────
      linkLocalExtension: async (folderPath: string) => {
        try {
          set({ isLoading: true, error: null });

          // 1. Manifest read
          const rawManifest = await loadManifestSafely(folderPath) as ExtensionManifest;
          if (!rawManifest || !rawManifest.id) {
            throw new Error('Invalid extension directory: manifest.json is missing or malformed.');
          }

          // hydrated Extension object
          const completeManifest: Extension = { 
            ...rawManifest, 
            storeDir: folderPath,
            downloads: 0,       
            rating: 0,          
            isBuiltIn: false,
            isVerified: false,  
            zipSize: 'Local'
          };

          // 2. Update in store (as state we can keep 'installed-dev' to tecognize)
          const nextExts = [
            ...get().allExtensions.filter(e => e.id !== completeManifest.id),
            completeManifest,
          ];
          
          const nextRecords = {
            ...get().records,
            [completeManifest.id]: {
              state:         'installed-enabled', // OR 'installed-dev'
              installedAt:   Date.now(),
              version:       completeManifest.version,
              installedFrom: folderPath, // directly physical path
            } as any,
          };

          // 3. Sync & Start Engine 
          await syncExtensionConfigurations(nextExts, nextRecords);
          set({ allExtensions: nextExts, records: nextRecords, isLoading: false });
          
          await ExtensionHost.activateExtension(completeManifest.id, folderPath);
          console.log(` Successfully linked dev extension: ${completeManifest.name}`);

        } catch (error: any) {
          set({ isLoading: false, error: `Linking failed: ${error.message}` });
        }
      },


      // ── §3i  setFilter ─────────────────────────────────────────────────────
      setFilter: (partial) =>
        set(prev => ({ filter: { ...prev.filter, ...partial } })),
        
      
      // ── §3j  wakeUpByEvent (Lazy Loading Magic) ────────────────────────────
      /**
       * Getting signal from Smart proxy (ex: 'onCommand:...') 
       * load sleeping extensions in memory
       */
      wakeUpByEvent: async (activationEvent) => {
        // find commands on which extension
        const ext = get().allExtensions.find(e => e.activates?.includes(activationEvent));
        
        if (ext) {
          const record = get().records[ext.id];
          
          // if enable then wake it up
          if (record && record.state === 'installed-enabled') {
            console.log(`[ExtensionStore] ⏰ Waking up lazy extension: ${ext.name} (Event: ${activationEvent})`);
            await ExtensionHost.activateExtension(ext.id, record.installedFrom);
          }
        } else {
          console.warn(`[ExtensionStore] ⚠️ No extension found listening for: ${activationEvent}`);
        }
      },

    }),

    {
      // Only persist the `records` map — everything else is derived at runtime
      name:       'mscode-extensions-v2',
      partialize: (s) => ({ records: s.records }),
    },
  ),
);


useExtensionStore.subscribe((state, prevState) => {
  // Trigger if the installed records or overall extensions list changes
  if (
    state.records !== prevState.records || 
    state.allExtensions !== prevState.allExtensions
  ) {
    msEvents.emit('onDidChangeExtensions');
  }
});