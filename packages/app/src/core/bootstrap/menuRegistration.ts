// src/core/bootstrap/menuRegistration.ts

import { useMenuStore } from '@/store/menuStore';
import { commands }     from '@/core/extensionAPI/registry/commandRegistry';
// import { contextKeyService } from '@/core/keybindings/contextKeyService';


// Guard flags to prevent double registration
let coreMenusRegistered = false;
let editorMenuRegistered = false;

// ─────────────────────────────────────────────────────────────────────────────
// Core menus – registered once during app bootstrap
// ─────────────────────────────────────────────────────────────────────────────
export const registerCoreMenus = (): void => {
  // console.log('1)))) coreMenusRegistered ::::::::::::::::::::::::::::');
  // Guard: If already registered, skip execution
  if (coreMenusRegistered) return;
  coreMenusRegistered = true;
  
  // console.log('coreMenusRegistered ::::::::::::::::::::::::::::');

  const { registerMenuItem , registerMenuItems } = useMenuStore.getState();
  
    // registerMenuItems example : takes array - group of menu's items 
  // registerMenuItems('editor/title', [
  // {
  //   id:    'run',
  //   label: 'Run Code',
  //   icon:  'play',
  //   order: -10,
  //   showOnlyWhenSubOptionAvailable: true,
  //   // push via extension like : code-runner
  //   children: [
  //     { 
  //       id: 'run-terminal',  label: 'Run in Terminal',  icon: 'terminal',  order: -10, onClick: () => commands.executeCommand('extension.runInTerminal')  
  //     },
  //     // pushing via new registeration ✅ working 
  //     // {
  //     //   id: 'run-runner',    label: 'Run via Runner',   icon: 'zap',       order: 1, onClick: () => commands.executeCommand('extension.runCodeRunner')   
  //     // },
  // //   { 
  // //   id: 'run-debug',     label: 'Run and Debug',    icon: 'debug',     order: 2, onClick: () => commands.executeCommand('extension.debug'), shortcut: 'F5' 
    
  // // },
  //   ],
  // },
  // { id:    'sep-overflow', type:  'separator', order: 99, }
  // ]);
  
  
  // example
  // registerMenuItems('sidebar/files/tree', [
  // {
  //   id:    'new',
  //   label: 'New Code',
  //   icon:  'play',
  //   order: 10,
  //   showOnlyWhenSubOptionAvailable: true,
  //   when: "clickedFile&isRoot == true",
  //   // push via extension like : code-runner
  //   children: [
  //     { 
  //       id: 'new-code',  label: 'New Code',  icon: 'play',  order: -10, onClick: () => console.log('HELLO !')  
  //     },
  //   ],
  // },
  // { id:    'sep-overflow', type:  'separator', order: 99, }
  // ]);
  
  
  
  // ── §1  Editor Title Bar ────────────────────────────────────────────────────
  
  registerMenuItem('editor/title',{
    id:      'refresh-window',
    label:   'Refresh Window',
    icon:    'refresh',
    order:   11,
    children: [
      {
        id: 'reload-window',  order:   11,   label: 'Reload window',   icon: 'refresh', onClick: () => window.location.reload()
      }
  ]
  })
  

  // ── Overflow-only items (no icon needed) ───
  registerMenuItem('editor/title', {
    id:       'close-all',
    label:    'Close All Tabs',
    shortcut: 'Ctrl+K W',
    icon:     'clear-all',
    order:    1000,
    onClick:  () => commands.executeCommand('workbench.action.closeAllEditors'),
  });
   
  registerMenuItem('editor/title', {
    id:      'exit',
    label:   'Exit',
    icon:    'close',
    order:   1010,
    when: '',
    onClick: () => commands.executeCommand('workbench.action.quit'),
  });
  
  
  registerMenuItems('activitybar/settings', [
    { id: 's0', label: 'Command Palette',    icon: 'terminal', shortcut: 'Ctrl+Shift+P', onClick: () => commands.executeCommand('workbench.action.showCommands'), order: 10 },
    { id: 'sep1', type: 'separator', order: 20 },
    { id: 's1', label: 'Settings',           icon: 'settings', shortcut: 'Ctrl+,',       onClick: () => commands.executeCommand('workbench.action.openSettings'), order: 30 },
    { id: 's2', label: 'Keyboard Shortcuts', icon: 'keyboard', shortcut: 'Ctrl+K Ctrl+S',onClick: () => commands.executeCommand('workbench.action.openGlobalKeybindings'), order: 40 },
    { id: 's3', label: 'User Snippets',      icon: 'json',                               onClick: () => commands.executeCommand('workbench.action.openSnippets'), order: 50 },
    { id: 's-inspector', label: 'Menu Inspector', icon: 'list-tree',                     onClick: () => commands.executeCommand('workbench.action.openMenuInspector'), order: 60 },
    { id: 'sep2', type: 'separator', order: 70 },
    {
      id: 's4', label: 'Themes', icon: 'symbol-color', order: 80,
      children: [
        { id: 's4-1', label: 'Color Theme',     shortcut: 'Ctrl+K Ctrl+T', onClick: () => commands.executeCommand('workbench.action.selectTheme'), order: 1 },
        { id: 's4-2', label: 'File Icon Theme',                            onClick: () => commands.executeCommand('workbench.action.selectIconTheme'), order: 2 },
      ],
    },
  ]);
  
  
  
  
  
}

export const registerEditorMenu = (): void => {
  if (editorMenuRegistered) return;
  editorMenuRegistered = true;
  // Add extension context-menu items here.
};