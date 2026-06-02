// src/features/extensions/services/extensionConfigSync.ts

/**
 * ============================================================================
 * MS CODE EXTENSION CONFIGURATION SYNCHRONIZATION PIPELINE
 * ============================================================================
 * * ─── VISUAL ARCHITECTURE FLOW ───────────────────────────────────────────────
 * * [Extensions Sync Pipeline]
 *        │
 *        ▼
 * ┌───────────┐      Purge Old Settings
 * │  Startup    │ ───► (Purges keys with tag: 'extension')
 * └─────┬─────┘
 *        │
 *        ▼ Loop over all Extensions (state === 'installed-enabled')
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 1. [Settings]    ──► Accumulates fields into batch payload            │
 * │ 2. [Themes]      ──► Dynamic themeService registration                │
 * │ 3. [Icon Themes] ──► Configures basePath & registers maps             │
 * │ 4. [Snippets]    ──► Maps Monaco language autocomplete hooks          │
 * │ 5. [ActivityBar] ──► Sets up UI layout & registers skeletons          │
 * │ 6. [Keybindings] ──► Dynamic chord mappings in core manager           │
 * └─────┬───────────────────────────────────────────────────────┘
 *        │
 *        ▼ End of Loop
 * ┌─────────────────────────────────────────────────────────────┐
 * │ • Register Dynamic Configurations in Batch                             │
 * │ • Re-evaluate Default Configuration Gaps                               │
 * │ • Trigger Core System Theme Sync                                       │
 * └─────────────────────────────────────────────────────────────┘
 * * @description
 * This core subsystem coordinates the declarative integration of all enabled
 * extensions into the MS Code runtime environment on startup or catalog mutation.
 * It reads individual 'manifest.json' files, parses contribution registries, 
 * maps autocomplete scopes, wires up UI assets, and dynamically binds keymacros.
 */

import { configRegistry } from '@/core/extensionAPI/registry/configurationRegistry';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import type { Extension, ExtensionRecord } from '../types';

import { windowAPI } from '@/core/extensionAPI/registry/outputAPI';
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
    windowAPI.createOutputChannel('Extension Host').appendLine(formatted);
  } catch (e) {}
};

/**
 * Resolves declarative data contributions from an extension directory layout.
 * Evaluates whether reference is an external relative JSON filepath pointer or raw inline object template.
 * * @param {string} storeDir Physical target workspace folder coordinate within virtual filesystem.
 * @param {string | Record<string, any>} data Raw descriptor from manifest file metadata hooks.
 * @returns {Promise<Record<string, any>>} Clean structured JSON properties map layout.
 */
async function resolveContributionData(storeDir: string, data: any): Promise<Record<string, any>> {
  if (!data) {
    logSync(`   resolveContributionData: data is null/undefined, returning {}`);
    return {};
  }
  if (typeof data === 'string') {
    logSync(`   resolveContributionData: loading from file '${data}' in '${storeDir}'`);
    try {
      const result = await loadExtensionJsonSafely(storeDir, data);
      logSync(`   resolveContributionData: loaded OK, keys: ${Object.keys(result).length}`);
      return result;
    } catch (err: any) {
      logSync(`   resolveContributionData: FAILED to read '${data}': ${err.message}`, true);
      return {};
    }
  }
  if (typeof data === 'object') {
    logSync(`   resolveContributionData: inline object, keys: ${Object.keys(data).length}`);
    return data;
  }
  return {};
}

/**
 * Master orchestration routine scanning all enabled extension packages, parsing their static 
 * manifests, and binding individual feature contributions dynamically to corresponding core registers.
 * * @param {Extension[]} allExtensions Global collection matching available downloaded package items.
 * @param {Record<string, ExtensionRecord>} records Active operational states (enabled vs disabled mapping indexes).
 */
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
      /**
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "configuration": {
       * "myExtension.enableLint": {
       * "type": "boolean",
       * "default": true,
       * "description": "Enables diagnostic code verification checkpoints."
       * }
       * }
       * }
       * 
       * ---
       * 
       * @example :
       * "contributes": {
       * "configuration": "./settings.json",
       * }
       */
      logSync(`   [1/8] Processing settings...`);
      const configToAdd = await resolveContributionData(actualStoreDir, rawContributions.configuration);
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
      /**
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "themes": [
       * { "label": "Neon Cyberpunk", "uiTheme": "vs-dark", "path": "./themes/cyberpunk.json" }
       * ]
       * }
       *
       * ---
       * 
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "themes": "./config/themes.json"
       * }
       */
       
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
      } else {
        logSync(`   No themes in this extension.`);
      }

      // ============================================================================
      // ─── 3. FILE ICON PACK MAPS REPOSITORY ──────────────────────────────────────
      // ============================================================================
      /**
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "iconThemes": [
       * { "id": "minimal-icons", "label": "Minimalist Pack", "path": "./icons/theme.json" }
       * ]
       * }
       *
       * ---
       * 
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "iconThemes": "./config/icon-themes.json"
       * }
       */
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
      /**
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "snippets": [
       * { "language": "typescript", "path": "./snippets/ts-presets.json" },
       * { "language": "javascript", "path": "./snippets/js-presets.json" }
       * ]
       * }
       *
       * ---
       * 
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "snippets": "./config/snippets-config.json"
       * }
       */
       
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
      
      /**
       * @typedef {Object} ActivityBarContribution
       * @property {string} id - Unique identifier for the activity bar item (e.g., 'openai-chat').
       * @property {string} title - Human-readable label displayed as a tooltip or header.
       * @property {string} [icon] - Name of the registered icon component. Defaults to 'extension'.
       * @property {'top' | 'bottom'} [position] - Layout slot positioning inside the container. Defaults to 'top'.
       * @property {number} [priority] - Sorting weight assigned to the item layout stack. Defaults to 60.
       */

      /**
       * @typedef {Object} ActivityBarFileSchema
       * @property {ActivityBarContribution[]} activityBar - List of contributions loaded from an external file.
       */

      /**
       * @example Manifest direct entry array structure:
       * "contributes": {
       * "activityBar": [
       * { "id": "openai-chat", "title": "Chat GPT", "icon": "openai", "priority": 60 }
       * ]
       * }
       * 
       * --- 
       * 
       * * @example Manifest external path reference structure:
       * "contributes": {
       * "activityBar": "./ui/activity.json"
       * }
       * * External File Path Structure (activity.json):
       * {
       * "activityBar": [
       * { "id": "openai-chat", "title": "Chat GPT", "icon": "openai", "priority": 60, "position": "top" },
       * { "id": "todo-manager", "title": "Todo Tasks", "icon": "checklist", "priority": 70, "position": "top" }
       * ]
       * }
       */
       
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
      /**
       * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "keybindings": [
       * { "command": "openai.askChat", "key": "ctrl+shift+a", "when": "editorTextFocus" }
       * ]
       * }
       * 
       * ---
       * 
       * * @example Manifest contribution blueprint structure:
       * "contributes": {
       * "keybindings": "./config/keybindings.json" 
       * }
       */
       
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
      
      /**
       * @typedef {Object} BaseMenuItem
       * @property {string} [id] - Explicit unique identifier for the menu node.
       * @property {'separator'} [type] - Flag indicating if the entry is a visual structural divider.
       * @property {number} [order] - Layout ordering weight applied during sorting. Defaults to 0.
       * @property {string} [label] - Human-readable text displayed in the UI context menu.
       * @property {string} [icon] - Registrable icon key to render alongside the text label.
       * @property {string} [when] - Context-key expression string evaluated for conditional rendering.
       * @property {string} [shortcut] - Optional string representing a keybinding shortcut preview.
       * @property {boolean} [flat] - Behavior flag determining whether to elevate single child configurations.
       */

      /**
       * @typedef {BaseMenuItem} RawMenuItem
       * @property {string} [command] - Decoupled backend command ID triggered upon selection.
       * @property {RawMenuItem[]} [children] - Hierarchical nested sub-menu config arrays.
       */

      /**
       * @typedef {BaseMenuItem} ProcessedMenuItem
       * @property {string} id - Enforced node identifier mapped from commands or fallback hashes.
       * @property {ProcessedMenuItem[]} [children] - Fully sanitized and recursively processed submenus.
       * @property {() => void} [onClick] - Runtime executable dispatch binding wrapped around the core command.
       */

      /**
       * @typedef {Object.<string, RawMenuItem[]>} MenuContributionSchema
       * A dictionary layout maps distinct context targets (keys) to an array of declarative configurations.
       */

      /**
       * @example Manifest Blueprint with 3 Clear Implementation Examples:
       * "contributes": {
       * "menus": {
       * // Example 1: Injected into File Explorer Sidebar Context Menu (Conditional)
       * "sidebar/files/context": [
       * { 
       * "command": "git.stageFile", 
       * "label": "Git: Stage File Changes", 
       * "icon": "add", 
       * "when": "workspacePath != null", 
       * "order": 5 
       * }
       * ],
       * // Example 2: Injected into the Main Code Editor Area Right-Click Menu
       * "editor/context": [
       * { 
       * "command": "openai.explainCode", 
       * "label": "AI: Explain Selection", 
       * "icon": "sparkle", 
       * "when": "editorHasSelection == true", 
       * "order": 2 
       * }
       * ]
       * }
       * }
       */
       
       
      
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
          
          /**
           * Recursively normalizes manifest configurations into runtime-safe UI structures.
           * Handles explicit structural dividers, payload defaults, and execution bindings.
           * * @param {RawMenuItem[]} menuItems - Layered manifest input options array.
           * @returns {ProcessedMenuItem[]} Cleaned array filtered from illegal tokens.
           */
          // const processMenuItems = (menuItems: RawMenuItem[]): ProcessedMenuItem[] => {
          //   return menuItems.map((item): ProcessedMenuItem | null => {
          //     // 1. Separator Structural Handling
          //     if (item.type === 'separator') {
          //       return {
          //         id: item.id || `sep-${Math.random().toString(36).substring(2, 11)}`,
          //         type: 'separator',
          //         order: item.order || 0
          //       } as ProcessedMenuItem;
          //     }

          //     // Integrity Verification: Requires either a command endpoint or nested entries
          //     if (!item.command && (!item.children || item.children.length === 0)) {
          //       logSync(`        ⚠️ Invalid menu item: missing 'command' or 'children'.`, true);
          //       return null;
          //     }

          //     // 2. Normalize data fields and attach command trigger closures
          //     return {
          //       id: item.command || `menu-group-${Math.random().toString(36).substring(2, 11)}`,
          //       label: item.label || item.command,
          //       icon: item.icon,
          //       when: item.when,
          //       order: item.order || 0,
          //       shortcut: item.shortcut,
          //       flat: item.flat,
          //       // Nested downstream execution mapping
          //       children: item.children ? processMenuItems(item.children) : undefined,
          //       onClick: item.command ? () => commands.executeCommand(item.command!) : undefined
          //     } as ProcessedMenuItem;
          //   }).filter((res): res is ProcessedMenuItem => res !== null); // Omit invalid null entities safely
          // };
          
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

    
  //     // ============================================================================
  //     // ─── 8. COMMAND PALETTE METADATA INJECTIONS ─────────────────────────────────
  //     // ============================================================================
      
  //     /**
  //     * @typedef {Object} CommandContribution
  //     * @property {string} id - Unique global identifier for the command (e.g., 'myExt.sayHello').
  //     * @property {string} title - Human-readable name/label displayed in the command palette.
  //     * @property {string} [category] - Context grouping or namespace prefix. Defaults to the extension name.
  //     * @property {string} [icon] - Name of the registered icon associated with this command.
  //     */

  //     /**
  //     * @typedef {Object} CommandFileSchema
  //     * @property {CommandContribution[]} commands - List of command configurations loaded from an external file.
  //     */

  //     /**
  //     * @example Manifest contribution direct array blueprint:
  //     * "contributes": {
  //     * "commands": [
  //     * { "id": "myExt.sayHello", "title": "Say Hello World", "icon": "megaphone" }
  //     * ]
  //     * }
  //     * * @example Manifest contribution external path blueprint:
  //     * "contributes": {
  //     * "commands": "./config/commands.json"
  //     * }
  //     * 
  //     * ---
  //     * 
  //     * * External File Structure (commands.json):
  //     * {
  //     * "commands": [
  //     * { "id": "myExt.sayHello", "title": "Say Hello World", "icon": "megaphone" }
  //     * ]
  //     * }
  //     */
  //     logSync(`   [8/8] Processing Commands...`);
      
  //     /** * Resolve raw target manifest schemas or external JSON paths into parsed contribution payloads.
  //     * @type {CommandContribution[] | CommandFileSchema | null}
  //     */
  //     const resolvedCommands = await resolveContributionData(actualStoreDir, rawContributions.commands);
      
  //     /** * Normalize the configuration schema to safely handle both direct arrays and object wrappers.
  //     * @type {CommandContribution[]}
  //     */
  //     const commandItems = Array.isArray(resolvedCommands) 
  //       ? resolvedCommands 
  //       : (resolvedCommands?.commands || []); // Safety fallback normalization

  //     if (Array.isArray(commandItems) && commandItems.length > 0) {
  //       logSync(`   Found ${commandItems.length} command(s).`);
        
  //       for (const cmd of commandItems) {
  //         // Structural Integrity Check: Ensure essential identifying properties exist
  //         if (!cmd.id || !cmd.title) {
  //           logSync(`      ⚠️ Invalid command entry, missing id or title.`, true);
  //           continue;
  //         }

  //         // Placeholder/Stub Registration into Command Palette Registry
  //         // This registers the metadata so it shows up in the UI before the activation event hooks full handlers
  //         commands.registerCommand(
  //           cmd.id,
  //           () => {
  //             logSync(`⚠️ Command '${cmd.id}' invoked from palette, but the extension hasn't attached a handler yet.`, true);
  //           },
  //           { 
  //             title: cmd.title, 
  //             category: cmd.category || (ext as any).name, // Scopes command to specific extension namespace if category is missing
  //             icon: cmd.icon 
  //           }
  //         );
          
  //         logSync(`      ✅ Command metadata mapped to Palette: '${cmd.id}'`);
  //       }
  //     } else {
  //       logSync(`   No command contributions in this extension.`);
  //     }

      
      
      

  //   } catch (err: any) {
  //     logSync(`❌ Fatal error processing '${ext.id}': ${err.message}`, true);
  //   }
  // }
  
  
  // ============================================================================
      // ─── 8. COMMAND PALETTE METADATA INJECTIONS ─────────────────────────────────
      // ============================================================================
      
      /**
       * @typedef {Object} CommandContribution
       * @property {string} id - Unique global identifier for the command (e.g., 'myExt.sayHello').
       * @property {string} title - Human-readable name/label displayed in the command palette.
       * @property {string} [category] - Context grouping or namespace prefix. Defaults to the extension name.
       * @property {string} [icon] - Name of the registered icon associated with this command.
       */

      /**
       * @typedef {Object} CommandFileSchema
       * @property {CommandContribution[]} commands - List of command configurations loaded from an external file.
       */

      /**
       * @example Manifest contribution direct array blueprint:
       * "contributes": {
       * "commands": [
       * { "id": "myExt.sayHello", "title": "Say Hello World", "icon": "megaphone" }
       * ]
       * }
       * * @example Manifest contribution external path blueprint:
       * "contributes": {
       * "commands": "./config/commands.json"
       * }
       * * ---
       * * * External File Structure (commands.json):
       * {
       * "commands": [
       * { "id": "myExt.sayHello", "title": "Say Hello World", "icon": "megaphone" }
       * ]
       * }
       */
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


/** 
 * 
 *@example
 *{
  "name": "my-cool-extension",
  "contributes": {
    "commands": [
      {
        "id": "myExt.sayHello",
        "title": "Say Hello World"
      }
    ],
    "menus": {
      "editor/title/context": [
        {
          "command": "workbench.action.closeAllEditors",
          "label": "Close All Tabs",
          "icon": "clear-all",
          "shortcut": "Ctrl+K W",
          "order": 1
        },
        {
          "command": "myExt.sayHello",
          "label": "Say Hello",
          "icon": "megaphone",
          "when": "editorTextFocus",
          "order": 2
        }
      ],
      "sidebar/files/actions": [
        {
          "command": "workbench.action.files.newFile",
          "label": "New File",
          "icon": "new-file"
        }
      ]
    }
  }
}
**/