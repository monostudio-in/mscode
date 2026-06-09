// src/ui/layouts/components/TopBar/TopTitle.tsx
//
// ─── ARCHITECTURE ─────────────────────────────────────────────────────────────
//
//  Single menu ID: 'editor/title'
//  Everything — icon buttons AND overflow items — lives in ONE registry.
//
//  FLOW:
//   registerMenuItem('editor/title', item)   ← extensions / core features
//   workbench.topBar.actions setting         ← user-defined (string | MenuItem)
//         ↓
//   getResolvedMenu('editor/title', dynamicItems)
//         ↓
//   SidebarActions — renders inline icons + ⋮ overflow, same as sidebar
//
//  ORDER CONVENTION (leave gaps so others can insert between):
//    0  – 99   : first-party icon actions (run, format …)
//    100 – 199 : separator(s) before user actions
//    200 – 999 : user-defined actions from workbench.topBar.actions
//    1000+      : fixed / fallback items
//
//  SEPARATOR IN workbench.topBar.actions:
//    { "id": "sep-run", "type": "separator", "order": 150 }
//
//  FULL ITEM IN workbench.topBar.actions:
//    {
//      "id":      "run",
//      "label":   "Run",
//      "icon":    "play",
//      "order":   10,
//      "command": "extension.runFile",        ← resolved to onClick
//      "children": [
//        { "id": "run-term",  "label": "Run in Terminal",  "command": "extension.runInTerminal" },
//        { "id": "run-debug", "label": "Run and Debug",    "command": "extension.debug"         }
//      ]
//    }
//
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState, useEffect } from 'react';
import { useSettingsStore }  from '@/features/settings/store/settingsStore';
import { configRegistry }   from '@/core/extensionAPI/registry/configurationRegistry';
import { commands }         from '@/core/extensionAPI/registry/commandRegistry';
import { useTabStore }      from '@/store/tabStore';
// import { useMenuStore }      from '@/store/menuStore';
import { contextKeyService } from '@/core/keybindings/contextKeyService';
import { SidebarActions }   from '@/ui/components/SidebarEngine/SidebarActions';
import { getResolvedMenu }  from '@/store/menuStore';
import { Modal }            from '@/ui/components/Modal/Modal';
import { SettingItem }      from '@/features/settings/components/SettingItem';
import type { MenuItem }    from '@/store/menuStore';

// ── Constants ─────────────────────────────────────────────────────────────────

const MENU_ID = 'editor/title';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive Monaco language id from a filename. */
const getLanguageId = (filename: string): string => {
  const ext = filename?.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    py: 'python', js: 'javascript', ts: 'typescript',
    tsx: 'typescriptreact', jsx: 'javascriptreact',
    cpp: 'cpp', c: 'c', cs: 'csharp',
    html: 'html', css: 'css', json: 'json', md: 'markdown',
    sh: 'shell', rs: 'rust', go: 'go', java: 'java',
  };
  return map[ext] ?? '';
};

/** Strip the "Category: " prefix VS Code puts in titles, e.g. "Editor: Word Wrap" → "Word Wrap" */
const stripCategoryPrefix = (title: string): string =>
  title.includes(':') ? title.split(':').slice(1).join(':').trim() : title;

// ── maxOverflow auto-calc ─────────────────────────────────────────────────────
//
// Available width in the toptitle area changes with sidebar and window size.
// We use window width as an approximation — good enough for the step-function here.

// ── maxOverflow breakpoints ───────────────────────────────────────────────────
// Adjust icon counts per screen size here — nowhere else needed.
const ICON_BREAKPOINTS = {
  xs: { maxWidth: 480, icons: 1 },  // phone portrait
  sm: { maxWidth: 640, icons: 2 },  // phone landscape
  md: { maxWidth: 900, icons: 3 },  // tablet
  lg: { maxWidth: 1200, icons: 4 }, // small desktop
  xl: { icons: 5 },                 // large desktop
} as const;

const calcMaxOverflow = (windowWidth: number): number => {
  if (windowWidth < ICON_BREAKPOINTS.xs.maxWidth) return ICON_BREAKPOINTS.xs.icons;
  if (windowWidth < ICON_BREAKPOINTS.sm.maxWidth) return ICON_BREAKPOINTS.sm.icons;
  if (windowWidth < ICON_BREAKPOINTS.md.maxWidth) return ICON_BREAKPOINTS.md.icons;
  if (windowWidth < ICON_BREAKPOINTS.lg.maxWidth) return ICON_BREAKPOINTS.lg.icons;
  return ICON_BREAKPOINTS.xl.icons;
};

// ── Entry resolver ────────────────────────────────────────────────────────────
//
// workbench.topBar.actions accepts three kinds of entries:
//   (a) string            → settingId or commandId
//   (b) MenuItem-like obj → passed through (onClick wired from `command` field)
//   (c) separator obj     → { id, type: 'separator', order? }

interface ActionEntry {
  id?:        string;
  label?:     string;
  icon?:      string;
  order?:     number;
  type?:      'item' | 'separator';
  command?:   string;       // command ID to execute on click
  setting?:   string;       // for setting action handle
  shortcut?:  string;
  when?:      string | boolean;
  children?:  ActionEntry[];
}

function resolveEntry(
  entry:            string | ActionEntry,
  idx:              number,
  settings:         Record<string, any>,
  updateSetting:    (id: string, val: any) => void,
  setModalSetting:  (id: string) => void,
): MenuItem | null {

  const baseOrder = 200 + idx * 10;

  // ── (a) String ──────────────────────────────────────────────────────────────
  if (typeof entry === 'string') {
    const def = configRegistry.getSetting(entry);
    if (def) {
      const isBool  = def.type === 'boolean';
      const current = settings[entry] ?? def.defaultValue;
      return {
        id:      entry,
        label:   stripCategoryPrefix(def.title || entry),
        icon:    'settings',
        checked: isBool ? Boolean(current) : undefined,
        order:   baseOrder,
        onClick: () => {
          if (isBool) updateSetting(entry, !current);
          else setModalSetting(entry);
        },
      };
    }

    const cmd = commands.getCommand(entry);
    if (cmd) {
      return {
        id:    entry,
        label: stripCategoryPrefix(cmd.title || entry),
        icon:  (cmd as any).icon || 'zap',
        order: baseOrder,
        onClick: () => commands.executeCommand(entry),
      };
    }

    return null; // unknown ID — silently skip
  }

  // ── (b) Separator ───────────────────────────────────────────────────────────
  if (entry.type === 'separator') {
    return {
      id:    entry.id || `user-sep-${idx}`,
      type:  'separator',
      order: entry.order ?? baseOrder,
    };
  }

  // ── (c) Full MenuItem object ─────────────────────────────────────────────────
  const children: MenuItem[] | undefined = entry.children?.length
    ? (entry.children
        .map((child, ci) => resolveEntry(child, ci, settings, updateSetting, setModalSetting))
        .filter((x): x is MenuItem => x !== null))
    : undefined;

  // Handle command & setting interactions
  let onClick: (() => void) | undefined = undefined;
  let checked: boolean | undefined = undefined;

  if (entry.command) {
    onClick = () => commands.executeCommand(entry.command!);
  } else if (entry.setting) {
    const def = configRegistry.getSetting(entry.setting);
    if (def) {
      const isBool = def.type === 'boolean';
      const current = settings[entry.setting] ?? def.defaultValue;
      
      if (isBool) {
        checked = Boolean(current);
        onClick = () => updateSetting(entry.setting!, !current);
      } else {
        onClick = () => setModalSetting(entry.setting!);
      }
    }
  }

  return {
    id:       entry.id ?? `user-action-${idx}`,
    label:    entry.label,
    icon:     entry.icon,
    shortcut: entry.shortcut,
    when:     entry.when,
    order:    entry.order ?? baseOrder,
    checked:  checked,
    children: children?.length ? children : undefined,
    onClick:  onClick,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const TopTitle: React.FC = () => {
  const { settings, updateSetting } = useSettingsStore();
  const { activeTabId, tabs }       = useTabStore();

  // Non-boolean setting modal
  const [modalSettingId, setModalSettingId] = useState<string | null>(null);

  // Window width for maxOverflow calculation
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Keep CONTEXT KEYS in sync ::::::::::
  const activeTab  = tabs.find(t => t.id === activeTabId);
  const languageId = getLanguageId(activeTab?.title ?? '');
  contextKeyService.setContext('editorLangId', languageId);
  contextKeyService.setContext('activeTabType', activeTab?.type ?? '');
  contextKeyService.setContext('hasFilePath', !!activeTab?.filePath);

  // ── Build dynamic items from workbench.topBar.actions ────────────────────────
  //
  // These are passed as the `actions` baseline to SidebarActions.
  // Items registered via registerMenuItem('editor/title', …) are merged
  // automatically inside getResolvedMenu() which SidebarActions calls.

  const dynamicItems = useMemo((): MenuItem[] => {
    const raw: (string | ActionEntry)[] = settings['workbench.topBar.actions'] ?? [];

    return raw
      .map((entry, idx) =>
        resolveEntry(entry, idx, settings, updateSetting, setModalSettingId)
      )
      .filter((x): x is MenuItem => x !== null);
  }, [settings, updateSetting]);
  
  
  // useEffect(() => {
  //   if (dynamicItems.length > 0) {
  //     useMenuStore.getState().registerMenuItems(MENU_ID, dynamicItems);
  //   }
    
  //   return () => {
  //     const itemIds = dynamicItems.map(item => item.id!);
  //     useMenuStore.getState().unregisterMenuItems(MENU_ID, itemIds);
  //   };
  // }, [dynamicItems]);
  
  

  // ── Merge registry items + dynamic items ─────────────────────────────────
  // getResolvedMenu merges registerMenuItem() contributions with dynamicItems,
  // deduplicates, and sorts by order — this is what was missing.
  const resolvedActions = useMemo(
    () => getResolvedMenu(MENU_ID, dynamicItems),
    [dynamicItems],
  );

  // ── maxOverflow auto-calc ──────────────────────────────────────────────────
  const maxOverflow = calcMaxOverflow(windowWidth);

  // ── Modal setting def ──────────────────────────────────────────────────────
  const modalSettingDef = modalSettingId
    ? configRegistry.getSetting(modalSettingId)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="toptitle-container">
        {/*
          SidebarActions handles EVERYTHING:
            • inline icon buttons   (items with icon, within maxOverflow)
            • inline separators     (type:'separator', rendered as |)
            • ⋮ overflow button     (auto-shown when items > maxOverflow)
            • overflow ContextMenu  (same MenuItem[] structure, submenus work)
            • external registrations via registerMenuItem('editor/title', …)
        */}
        <SidebarActions
          actions={resolvedActions}
          menuId={MENU_ID}
          maxOverflow={maxOverflow}
        />
      </div>

      {/* Non-boolean setting quick-edit modal */}
      {modalSettingDef && (
        <Modal
          isOpen={!!modalSettingId}
          title="Quick Setting"
          iconName="settings"
          onClose={() => setModalSettingId(null)}
        >
          <div style={{ marginTop: '-10px' }}>
            <SettingItem setting={modalSettingDef} />
          </div>
        </Modal>
      )}
    </>
  );
};