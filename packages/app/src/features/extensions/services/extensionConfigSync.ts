// src/features/extensions/services/extensionConfigSync.ts
import { configRegistry } from '@/core/extensionAPI/registry/configurationRegistry';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import type { Extension, ExtensionRecord } from '../types';

import { useOutputStore } from '@/features/termis/components/output/store/outputStore';
import { loadExtensionJsonSafely , loadManifestSafely} from './extensionLoader';

import { themeService } from '@/core/theme/service/themeService';
import { iconThemeService } from '@/core/theme/service/iconThemeService';
import { useThemeStore } from '@/core/theme/store/themeStore';
import { snippets as snippetRegistry } from '@/core/extensionAPI/registry/snippetRegistry';

import { useActivityBarStore } from '@/store/activityBarStore';
import { sidebarRegistry } from '@/core/extensionAPI/registry/sidebarRegistry';
import { keybindingManager } from '@/core/keybindings/keybindingManager';
import { useMenuStore , type MenuItem} from '@/store/menuStore'; 
import { commands } from '@/core/extensionAPI/registry/commandRegistry';

/**
 * Utility logger routing sync lifecycles simultaneously to dev console 
 * and the specialized 'Extension Host' Shared Output Channel view.
 */
const logSync = (msg: string, isError = false) => {
  const time = new Date().toLocaleTimeString();
  const formatted = `[${time}] [ConfigSync] ${msg}`;
  if (isError) console.error(formatted);
  else console.log(formatted);
  try {
    const outputStore = useOutputStore.getState();
    outputStore.createChannel('Extension Host');
    outputStore.appendLog('Extension Host', `${formatted}\n`);
  } catch (e) {}
};

async function resolveContributionData(storeDir: string, data: any): Promise<any> {
  if (!data) {
    logSync(`   resolveContributionData: data is null/undefined, returning {}`);
    return {};
  }
  if (typeof data === 'string') {
    const cleanPath = data.replace(/^\.\//, '');
    logSync(`   resolveContributionData: loading from file '${cleanPath}' in '${storeDir}'`);
    try {
      const result = await loadExtensionJsonSafely(storeDir, cleanPath);
      logSync(`   resolveContributionData: loaded OK`);
      return result;
    } catch (err: any) {
      logSync(`   resolveContributionData: FAILED to read '${cleanPath}': ${err.message}`, true);
      return {};
    }
  }
  if (typeof data === 'object') {
    logSync(`   resolveContributionData: inline object/array`);
    return data;
  }
  return {};
}


export const syncExtensionConfigurations = async (
  allExtensions: Extension[],
  records: Record<string, ExtensionRecord>
) => {
  logSync(`═══════════════════════════════════════`);
  logSync(`   syncExtensionConfigurations started`);
  logSync(`   Total extensions: ${allExtensions.length}`);
  logSync(`   Records: ${Object.keys(records).length}`);

  // Tearing down existing settings allocation nodes to guard against duplication or leaked references
  if (typeof (configRegistry as any).removeSettingsByTag === 'function') {
    (configRegistry as any).removeSettingsByTag('extension');
    logSync(`   Cleared old extension settings.`);
  }

  const extensionSettingsProps: Record<string, any> = {};

  for (const ext of allExtensions) {
    const record = records[ext.id];

    logSync(`───────────────────────────────────────`);
    logSync(`Processing: ${ext.id}`);

    if (!record) {
      logSync(`   No record found — skipping.`);
      continue;
    }

    logSync(`   State: ${record.state}`);

    // Standard lifecycle safety gate: bypass disabled or partially corrupted installations
    const isActive = record.state === 'installed-enabled' || record.state === 'installed-dev';
    if (!isActive) {
      logSync(`   Not enabled — skipping.`);
      continue;
    }

    try {
      const actualStoreDir = record.installedFrom || ext.storeDir;
      logSync(`   storeDir resolved: '${actualStoreDir}'`);

      const manifestData = await loadManifestSafely(actualStoreDir);
      logSync(`   manifest.json loaded OK.`);

      const rawContributions = manifestData?.contributes || manifestData?.contributions || {};
      const contribKeys = Object.keys(rawContributions);
      logSync(`   Contributions found: [${contribKeys.join(', ')}]`);

      // ============================================================================
      // ─── 1. SETTINGS PARSING (CONFIGURATION PROPERTIES) ─────────────────────────
      // ============================================================================
      logSync(`   [1/8] Processing settings...`);
      const resolvedConfig = await resolveContributionData(actualStoreDir, rawContributions.configuration);

      const configToAdd: Record<string, any> = {};

      if (Array.isArray(resolvedConfig)) {
        resolvedConfig.forEach(block => {
          if (block && block.properties) {
            Object.assign(configToAdd, block.properties);
          }
        });
      } else if (resolvedConfig && resolvedConfig.properties) {
        Object.assign(configToAdd, resolvedConfig.properties);
      } else if (resolvedConfig && typeof resolvedConfig === 'object') {
        Object.assign(configToAdd, resolvedConfig);
      }

      const configKeys = Object.keys(configToAdd);
      logSync(`   Settings to add: ${configKeys.length}`);

      configKeys.forEach(key => {
        const value = configToAdd[key];
        extensionSettingsProps[key] = {
          ...value,
          category: value.category || 'Extensions',
          subCategory: value.subCategory || ext.name,
          tags: ['extension', ext.id, ...(value.tags || [])]
        };
        logSync(`      + Setting: '${key}'`);
      });

      // ============================================================================
      // ─── 2. TEXT/THEME SCHEMAS CONFIGURATION ────────────────────────────────────
      // ============================================================================
       
      logSync(`   [2/8] Processing themes...`);

      // 1. External Path (JSON file) Support: Utilizing resolveContributionData
      const resolvedThemes = await resolveContributionData(actualStoreDir, rawContributions.themes);
      
      // 2. Flexible Structure Check: Handle both direct arrays and object wrappers
      const themeItems = Array.isArray(resolvedThemes)
        ? resolvedThemes
        : (resolvedThemes?.themes || []);

      if (Array.isArray(themeItems) && themeItems.length > 0) {
        logSync(`   Found ${themeItems.length} theme(s).`);
        for (const themeMeta of themeItems) {
          logSync(`   Loading theme: '${themeMeta.label || 'Unnamed'}'`);
          try {
            let themeDef: any;

            if (themeMeta.path) {
              const cleanPath = themeMeta.path.replace(/^\.\//, '');
              logSync(`      Reading from path: '${cleanPath}'`);
              themeDef = await loadExtensionJsonSafely(actualStoreDir, cleanPath);
            } else {
              themeDef = themeMeta;
            }

            // Fallback generation for ID and Name
            if (!themeDef.id) {
              themeDef.id = `${ext.id}-${themeMeta.label || 'theme'}`.replace(/\s+/g, '-').toLowerCase();
            }
            if (!themeDef.name) {
              themeDef.name = themeMeta.label || 'Unknown Theme';
            }
            
            themeService.registerFromJson(themeDef, ext.id);
            logSync(`      ✅ Theme registered: '${themeDef.name}' (id: ${themeDef.id})`);
          } catch (err: any) {
            logSync(`      ❌ Theme load failed: ${err.message}`, true);
          }
        }

        useThemeStore.getState().sync();

      } else {
        logSync(`   No themes in this extension.`);
      }

      // ============================================================================
      // ─── 3. FILE ICON PACK MAPS REPOSITORY ──────────────────────────────────────
      // ============================================================================
      logSync(`   [3/8] Processing icon themes...`);
      
      // 1. External Path (JSON file) Support: Utilizing resolveContributionData
      const resolvedIconThemes = await resolveContributionData(actualStoreDir, rawContributions.iconThemes);
      
      // 2. Flexible Structure Check: Handle both direct arrays and object wrappers
      const iconThemeItems = Array.isArray(resolvedIconThemes)
        ? resolvedIconThemes
        : (resolvedIconThemes?.iconThemes || []);

      if (Array.isArray(iconThemeItems) && iconThemeItems.length > 0) {
        logSync(`   Found ${iconThemeItems.length} icon theme(s).`);
        for (const iconMeta of iconThemeItems) {
          logSync(`   Loading icon theme: '${iconMeta.label}'`);
          try {
            const cleanPath = iconMeta.path.replace(/^\.\//, '');
            logSync(`      Reading from path: '${cleanPath}'`);
            
            // This loads the actual icon mapping schema (e.g., icons/theme.json)
            const themeData = await loadExtensionJsonSafely(actualStoreDir, cleanPath);

            const lastSlashIndex = cleanPath.lastIndexOf('/');
            const relativeDir = lastSlashIndex !== -1 ? cleanPath.substring(0, lastSlashIndex) : '';
            
            // Dynamic prefix: if local folder then don't add ms-storage
            const prefix = (actualStoreDir.startsWith('/') || actualStoreDir.startsWith('file://')) ? '' : 'ms-storage://';
            
            const basePath = relativeDir
              ? `${prefix}${actualStoreDir}/${relativeDir}`
              : `${prefix}${actualStoreDir}`;

            themeData.basePath = basePath;
            logSync(`      basePath set to: '${basePath}'`);

            iconThemeService.registerIconTheme({
              id: iconMeta.id || `${ext.id}-${iconMeta.label}`,
              name: iconMeta.label || 'Unknown Icon Theme',
              themeMap: themeData
            });
            logSync(`      ✅ Icon theme registered: '${iconMeta.label}'`);
          } catch (e: any) {
            logSync(`      ❌ Icon theme load failed for '${iconMeta.label}': ${e.message}`, true);
          }
        }
      } else {
        logSync(`   No icon themes in this extension.`);
      }

      // ============================================================================
      // ─── 4. SNIPPETS AND AUTOCOMPLETE INJECTIONS ────────────────────────────────
      // ============================================================================
       
      logSync(`   [4/8] Processing snippets...`);
      
      // 1. External Path (JSON file) Support: resolveContributionData
      const resolvedSnippets = await resolveContributionData(actualStoreDir, rawContributions.snippets);
      
      // 2. Flexible Structure Check: array or obj handler
      const snippetEntries = Array.isArray(resolvedSnippets)
        ? resolvedSnippets
        : (resolvedSnippets?.snippets || []);

      if (Array.isArray(snippetEntries) && snippetEntries.length > 0) {
        logSync(`   Found ${snippetEntries.length} snippet entry(ies).`);
        for (const snippetMeta of snippetEntries) {
          const langId = snippetMeta.language;
          const cleanPath = snippetMeta.path?.replace(/^\.\//, '');

          logSync(`   Snippet entry: language='${langId}' path='${cleanPath}'`);

          if (!langId || !cleanPath) {
            logSync(`      ⚠️ Invalid snippet entry in '${ext.id}', missing language or path.`, true);
            continue;
          }

          try {
            logSync(`      Reading snippet file: '${cleanPath}'`);
            const snippetData = await loadExtensionJsonSafely(actualStoreDir, cleanPath);
            const snippetCount = Object.keys(snippetData).length;
            logSync(`      Parsed ${snippetCount} snippet(s) for language '${langId}'.`);

            if (snippetCount === 0) {
              logSync(`      ⚠️ Snippet file empty for '${langId}', skipping registration.`);
              continue;
            }

            // Output trace analytics regarding injected syntax parameters
            Object.entries(snippetData).forEach(([name, snippet]: [string, any]) => {
              const prefixes = Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix];
              logSync(`         → '${name}' | prefix: [${prefixes.join(', ')}]`);
            });

            snippetRegistry.registerSnippets(langId, snippetData, ext.id);
            logSync(`      ✅ Snippets registered for '${langId}' from '${ext.name}'.`);

          } catch (e: any) {
            logSync(`      ❌ Snippet load failed for '${langId}' in '${ext.id}': ${e.message}`, true);
          }
        }
      } else {
        logSync(`   No snippets in this extension.`);
      }
      
      
      // ============================================================================
      // ─── 5. ACTIVITY BAR VISUAL INTERFACE COMPONENT ─────────────────────────────
      // ============================================================================
      
       
      logSync(`   [5/8] Processing Activity Bar...`);
      
      /** * Resolve raw manifest string/object paths into standardized JSON payload object schemas.
       * @type {ActivityBarContribution[] | ActivityBarFileSchema | null}
       */
      const resolvedActivityBar = await resolveContributionData(actualStoreDir, rawContributions.activityBar);
      
      /** * Extract flat items array from direct manifest inputs or external configuration wrappers.
       * @type {ActivityBarContribution[]}
       */
      const activityBarItems = Array.isArray(resolvedActivityBar) 
        ? resolvedActivityBar 
        : (resolvedActivityBar?.activityBar || []); // Safety fallback normalization

      if (Array.isArray(activityBarItems) && activityBarItems.length > 0) {
        logSync(`   Found ${activityBarItems.length} activity bar item(s).`);
        
        for (const abItem of activityBarItems) {
          // Enforce structural integrity constraints on primary fields
          if (!abItem.id || !abItem.title) {
            logSync(`      ⚠️ Invalid activity bar entry, missing id or title.`, true);
            continue;
          }

          logSync(`      Registering Activity Bar Item: '${abItem.id}'`);
          
          // 1. Flush visual element token downstream to populate toolbar slot positions
          useActivityBarStore.getState().registerItem({
            id: abItem.id,
            icon: abItem.icon || 'extension', 
            label: abItem.title,
            position: abItem.position || 'top',
            priority: abItem.priority || 60,
            openSidebarContent: true, 
          });

          // 2. Provision an immutable layout structural boundary framework inside SidebarRegistry
          if (!sidebarRegistry.getPanel(abItem.id)) {
            sidebarRegistry.registerPanel({
              activityBarId: abItem.id,
              header: { title: abItem.title },
              sections: [] // Initial empty view container allocation
            });
          }
          
          logSync(`      ✅ Activity Bar Item registered: '${abItem.title}'`);
        }
      } else {
        logSync(`   No activity bar contributions in this extension.`);
      }


      
      // ============================================================================
      // ─── 6. DYNAMIC MACRO KEYBINDING MAPS INTERACTION ───────────────────────────
      // ============================================================================
       
      logSync(`   [6/8] Processing Keybindings...`);
      
      // 1. External Path (JSON file) Support: Utilizing resolveContributionData
      const resolvedKeybindings = await resolveContributionData(actualStoreDir, rawContributions.keybindings);
      
      // 2. Flexible Structure Check: Handle both direct arrays and object wrappers
      const keybindingItems = Array.isArray(resolvedKeybindings)
        ? resolvedKeybindings
        : (resolvedKeybindings?.keybindings || []);
      
      if (Array.isArray(keybindingItems) && keybindingItems.length > 0) {
        logSync(`   Found ${keybindingItems.length} keybinding(s).`);
        for (const kb of keybindingItems) {
          if (!kb.command || !kb.key) {
            logSync(`      ⚠️ Invalid keybinding entry, missing 'command' or 'key'.`, true);
            continue;
          }

          // Inject configuration context data streams into core input routing modules
          keybindingManager.addDynamicBinding({
            command: kb.command,
            key: kb.key,
            when: kb.when,
            args: kb.args
          });
          
          logSync(`      ✅ Keybinding registered: '${kb.key}' -> '${kb.command}'`);
        }
      } else {
        logSync(`   No keybinding contributions in this extension.`);
      }
      
      
      
      // ============================================================================
      // ─── 7. DECLARATIVE CONTEXT MENUS & UI ACTIONS ──────────────────────────────
      // ============================================================================
      
      
      //  Explicitly declared TS Interface
      interface RawMenuItem {
        command?: string;
        id?: string;
        type?: 'item' | 'separator';
        order?: number;
        label?: string;
        icon?: string;
        when?: string;
        shortcut?: string;
        flat?: boolean | number;
        children?: RawMenuItem[];
      }
      
      
      logSync(`   [7/8] Processing Menus...`);
      
      /** * Resolve raw target manifest schemas into parsed runtime contribution payloads.
       * @type {MenuContributionSchema | null}
       */
      const resolvedMenus = await resolveContributionData(actualStoreDir, rawContributions.menus);
      
      if (resolvedMenus && Object.keys(resolvedMenus).length > 0) {
        const menuPaths = Object.keys(resolvedMenus);
        logSync(`   Found ${menuPaths.length} menu target location(s).`);

        for (const menuPath of menuPaths) {
          const items = resolvedMenus[menuPath];
          if (!Array.isArray(items)) continue;

          logSync(`      Injecting ${items.length} item(s) into '${menuPath}'`);
          
          const processMenuItems = (menuItems: RawMenuItem[]): MenuItem[] => {
            return menuItems.map((item): MenuItem | null => {
              // 1. Separator Structural Handling
              if (item.type === 'separator') {
                return {
                  id: item.id || `sep-${Math.random().toString(36).substring(2, 11)}`,
                  type: 'separator',
                  order: item.order || 0
                } as MenuItem;
              }

              // Integrity Verification: Requires either a command endpoint or nested entries
              if (!item.command && (!item.children || item.children.length === 0)) {
                logSync(`        ⚠️ Invalid menu item: missing 'command' or 'children'.`, true);
                return null;
              }

              // 2. Normalize data fields and attach command trigger closures
              return {
                id: item.command || `menu-group-${Math.random().toString(36).substring(2, 11)}`,
                label: item.label || item.command,
                icon: item.icon,
                when: item.when,
                order: item.order || 0,
                shortcut: item.shortcut,
                flat: item.flat as any,
                // Nested downstream execution mapping
                children: item.children ? processMenuItems(item.children) : undefined,
                onClick: item.command ? () => commands.executeCommand(item.command!) : undefined
              } as MenuItem;
            }).filter((res): res is MenuItem => res !== null); 
          };

          const processedItems = processMenuItems(items);

          if (processedItems.length > 0) {
            // 3. Register the verified schema into the centralized menu state layer
            useMenuStore.getState().registerMenuItems(menuPath, processedItems);
            logSync(`        ✅ Mapped ${processedItems.length} valid item(s) to '${menuPath}'`);
          }
        }
      } else {
        logSync(`   No menu contributions in this extension.`);
      }

  
  // ============================================================================
      // ─── 8. COMMAND PALETTE METADATA INJECTIONS ─────────────────────────────────
      // ============================================================================
      
      logSync(`   [8/8] Processing Commands...`);
      
      /** * Resolve raw target manifest schemas or external JSON paths into parsed contribution payloads.
       * @type {CommandContribution[] | CommandFileSchema | null}
       */
      const resolvedCommands = await resolveContributionData(actualStoreDir, rawContributions.commands);
      
      /** * Normalize the configuration schema to safely handle both direct arrays and object wrappers.
       * @type {CommandContribution[]}
       */
      const commandItems = Array.isArray(resolvedCommands) 
        ? resolvedCommands 
        : (resolvedCommands?.commands || []); // Safety fallback normalization

      if (Array.isArray(commandItems) && commandItems.length > 0) {
        logSync(`   Found ${commandItems.length} command(s).`);
        
        for (const cmd of commandItems) {
          // Structural Integrity Check: Ensure essential identifying properties exist
          if (!cmd.id || !cmd.title) {
            logSync(`      ⚠️ Invalid command entry, missing id or title.`, true);
            continue;
          }

          const existingCmd = commands.getCommand(cmd.id);
          if (existingCmd && existingCmd.handler && !(existingCmd.handler as any).isStub) {
              logSync(`      ⚡ Real handler already active for '${cmd.id}'. Skipping stub.`);
              continue; 
          }

          // THE SMART LAZY-LOAD STUB PROXY
          const stubHandler = async (...args: any[]) => {
            logSync(`⏳ [Lazy Load] Waking up extension for command: '${cmd.id}'...`);
            
            window.dispatchEvent(new CustomEvent('ms-trigger-activation', { 
                detail: `onCommand:${cmd.id}` 
            }));
            
            for (let i = 0; i < 20; i++) { 
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const currentCmd = commands.getCommand(cmd.id);
                
                if (currentCmd && !(currentCmd.handler as any).isStub) {
                    logSync(`✅ Extension woke up! Forwarding execution to real handler for '${cmd.id}'`);
                    return currentCmd.handler(...args); 
                }
            }
            
            logSync(`❌ Timeout: Extension didn't load a real handler for '${cmd.id}'.`, true);
          };
          
          (stubHandler as any).isStub = true; 

          // Placeholder/Stub Registration
          commands.registerCommand(
            cmd.id,
            stubHandler,
            { 
              title: cmd.title, 
              category: cmd.category || (ext as any).name, 
              icon: cmd.icon 
            }
          );
          
          logSync(`      ✅ Command metadata mapped to Palette: '${cmd.id}'`);
        }
        
        
      } else {
        logSync(`   No command contributions in this extension.`);
      }

    } catch (err: any) {
      logSync(`❌ Fatal error processing '${ext.id}': ${err.message}`, true);
    }
  }
    

  // ============================================================================
  // ─── BATCH REGISTER SUB-SYSTEM INTERFACES ───────────────────────────────────
  // ============================================================================
  const settingCount = Object.keys(extensionSettingsProps).length;
  logSync(`───────────────────────────────────────`);
  logSync(` Registering ${settingCount} total extension setting(s)...`);

  // Mass register collected setting configuration properties in one unified layout payload
  if (settingCount > 0) {
    configRegistry.registerConfiguration({
      id: 'extensions_dynamic',
      title: 'Extensions',
      order: 99,
      properties: extensionSettingsProps
    });
  }

  // Verify missing default configuration variables, safe-applying presets into memory tables
  const currentSettings = useSettingsStore.getState().settings;
  Object.entries(extensionSettingsProps).forEach(([key, settingDef]: [string, any]) => {
    if (currentSettings[key] === undefined && settingDef.default !== undefined) {
      useSettingsStore.getState().updateSetting(key, settingDef.default);
      logSync(`   Default applied: '${key}' = ${JSON.stringify(settingDef.default)}`);
    }
  });

  // Re-evaluate current workspace visual theme rules to apply changes gracefully
  useThemeStore.getState().sync();

  logSync(`═══════════════════════════════════════`);
  logSync(`✅ syncExtensionConfigurations complete. Settings: ${settingCount}`);
};