// JSON array of default shortcuts
// src/core/keybindings/defaultKeybindings.ts

import type { Keybinding } from './keybindingManager';

export const defaultKeybindings: Keybinding[] = [
  // ════════════════════════════════════════════════════════════════════════
  // WORKBENCH & GLOBAL ACTIONS (From any place)
  // ════════════════════════════════════════════════════════════════════════
  { key: 'ctrl+shift+p', command: 'workbench.action.showCommands' },
  { key: 'ctrl+,',       command: 'workbench.action.openSettings' },
  { key: 'ctrl+b',       command: 'workbench.action.toggleSidebarVisibility' },
  { key: 'ctrl+w',       command: 'workbench.action.closeActiveEditor' },

  // ════════════════════════════════════════════════════════════════════════
  // FILE OPERATIONS 
  // ════════════════════════════════════════════════════════════════════════
  { key: 'ctrl+n', command: 'workbench.action.files.newUntitledFile' },
  { key: 'ctrl+o', command: 'workbench.action.files.openFile' },
  
  { key: 'ctrl+s', command: 'workbench.action.files.save', when: 'editorTextFocus' },
  { key: 'Ctrl+K Ctrl+O', command: 'workbench.action.files.openFolder' },

  // ════════════════════════════════════════════════════════════════════════
  // MONACO NATIVE ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  { key: 'ctrl+f',       command: 'actions.find', when: 'editorTextFocus' },
  { key: 'ctrl+h',       command: 'editor.action.startFindReplaceAction', when: 'editorTextFocus' },
  { key: 'ctrl+g',       command: 'editor.action.gotoLine', when: 'editorTextFocus' },
  
  { key: 'ctrl+z',       command: 'editor.action.undo', when: 'editorTextFocus' },
  { key: 'ctrl+y',       command: 'editor.action.redo', when: 'editorTextFocus' },
  { key: 'ctrl+shift+z', command: 'editor.action.redo', when: 'editorTextFocus' },
  
  { key: 'ctrl+/',       command: 'editor.action.commentLine', when: 'editorTextFocus' },
  { key: 'shift+alt+f',  command: 'editor.action.formatDocument', when: 'editorTextFocus' },
  { key: 'ctrl+d',       command: 'editor.action.addSelectionToNextFindMatch', when: 'editorTextFocus' },
  { key: 'ctrl+space',   command: 'editor.action.triggerSuggest', when: 'editorTextFocus' },

  // ════════════════════════════════════════════════════════════════════════
  // TERMINAL ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  { key: 'ctrl+`',       command: 'workbench.action.terminal.toggleTerminal' },
  { key: 'ctrl+c',       command: 'workbench.action.terminal.copySelection', when: 'terminalFocus' },
  { key: 'ctrl+v',       command: 'workbench.action.terminal.paste', when: 'terminalFocus' },

  // ════════════════════════════════════════════════════════════════════════
  // CHORD KEYBINDINGS (Two-Step Shortcuts)
  // ════════════════════════════════════════════════════════════════════════
  { key: 'ctrl+k ctrl+s', command: 'workbench.action.openGlobalKeybindings' },
  { key: 'ctrl+k ctrl+w', command: 'workbench.action.closeAllEditors' },
  { key: 'ctrl+k v',      command: 'markdown.showPreviewToSide', when: 'editorTextFocus' },
  
  { key: 'ctrl+k ctrl+l', command: 'editor.toggleFold', when: 'editorTextFocus' },
  { key: 'ctrl+k ctrl+0', command: 'editor.foldAll', when: 'editorTextFocus' },
  { key: 'ctrl+k ctrl+j', command: 'editor.unfoldAll', when: 'editorTextFocus' },
  
  { key: 'ctrl+g',         command: 'workbench.action.gotoLine' },
  { key: 'ctrl+shift+o',   command: 'workbench.action.gotoSymbol' },
  { key: 'ctrl+r',         command: 'workbench.action.openRecent' },
  
  // ════════════════════════════════════════════════════════════════════════
  // VIEW & PANEL ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  { key: 'ctrl+`',       command: 'termis.open.terminal' },
  { key: 'ctrl+shift+u', command: 'termis.open.output' },
  { key: 'ctrl+shift+m', command: 'termis.open.problems' },

  { key: 'f2', command: 'workbench.action.renameActiveFile', when: 'editorTextFocus' },
  { key: 'ctrl+k ctrl+t', command: 'workbench.action.selectTheme' },
  
  // .. MONO STUDIO ADDING MORE 
];

