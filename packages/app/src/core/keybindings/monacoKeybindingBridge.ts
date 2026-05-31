// src/core/keybindings/monacoKeybindingBridge.ts

import * as monaco from 'monaco-editor';
import { commands } from '../extensionAPI/registry/commandRegistry';
import { contextKeyService } from './contextKeyService';
import { keybindingManager } from './keybindingManager';

/**
 * MonacoKeybindingBridge Subsystem Engine
 * Acts as an orchestration adapter between Monaco Editor instance life cycles 
 * and our central keybinding, command registry, and context valuation systems.
 */
class MonacoKeybindingBridge {
  /** Prevents duplicate event listeners from stacking if an editor instance re-renders */
  private boundEditors = new WeakSet<monaco.editor.IStandaloneCodeEditor>();

  /** Bound system state keys tracking real-time contextual conditions within active text scopes */
  private hasSelectionCtx = contextKeyService.createKey('editorHasSelection', false);
  private hasTextFocusCtx = contextKeyService.createKey('editorTextFocus', false);

  /**
   * Binds an active Monaco structural instance to core application message systems.
   * Extracts built-in commands and synchronizes environmental focus layers.
   * 
   * @param editor Targeted workspace code editor container interface.
   */
  public attach(editor: monaco.editor.IStandaloneCodeEditor): void {
    if (this.boundEditors.has(editor)) return;
    this.boundEditors.add(editor);

    this.syncCommands(editor);
    this.syncContextKeys(editor);
    
    console.log('[KeybindingBridge] Successfully attached to Monaco instance.');
  }

  /**
   * Extracts standard Monaco platform command definitions and synchronizes actions 
   * with the application's central command registry and keybinding hooks.
   */
  private syncCommands(editor: monaco.editor.IStandaloneCodeEditor): void {
    const actions = editor.getSupportedActions();

    /** Action identities excluded from automated shortcut extraction to avoid layout collision states */
    const ignoredActionsForBindings = [
      'actions.find',
      'editor.actions.findWithSelection',
      'editor.action.nextMatchFindAction',
      'editor.action.previousMatchFindAction',
      'editor.action.startFindReplaceAction'
    ];

    actions.forEach(action => {
      // ── TIER 1: CORE APPLICATION COMMAND INJECTION ──
      // Intercepts global process execution calls and securely redirects them to active workspace editors
      commands.registerCommand(action.id, () => {
        if (!editor.hasTextFocus()) editor.focus();
        action.run();
      });

      // Structural Guard: Skip automated shortcut overrides for blacklisted layouts
      if (ignoredActionsForBindings.includes(action.id)) {
        return; 
      }

      // ── TIER 2: MONACO KEY CODE EXTRACTION CRITERIA ──
      // Scrapes internal Monaco properties to dynamically load native keyboard shortcodes into our registry
      // @ts-ignore
      const keybindings = action._keybindings || []; 
      
      keybindings.forEach((kbCode: number) => {
        const chordStr = this.convertMonacoKeyCodeToString(kbCode);
        
        // Structural Guard: Restrict baseline navigational layout assignments from shifting to application macros
        if (chordStr && chordStr !== 'enter' && chordStr !== 'space' && chordStr !== 'tab') {
           keybindingManager.addDynamicBinding({
             key: chordStr,
             command: action.id,
             when: 'editorTextFocus' 
           });
        }
      });
    });

    // Mount explicit undo/redo historical action bindings omitted by standard action lists
    commands.registerCommand('editor.action.undo', () => editor.trigger('keyboard', 'undo', null));
    commands.registerCommand('editor.action.redo', () => editor.trigger('keyboard', 'redo', null));
  }
  
  /**
   * Captures internal text focus, selection states, and boundary shifts inside 
   * localized view components, transferring active truth flags back into when-clause states.
   */
  private syncContextKeys(editor: monaco.editor.IStandaloneCodeEditor): void {
    // Monitor real-time user line range and text sequence selections
    editor.onDidChangeCursorSelection((e) => {
      const hasSelection = !e.selection.isEmpty();
      this.hasSelectionCtx.set(hasSelection);
    });

    // Monitor interface activation updates
    editor.onDidFocusEditorText(() => {
      this.hasTextFocusCtx.set(true);
    });

    // Monitor operational focal dismissals
    editor.onDidBlurEditorText(() => {
      this.hasTextFocusCtx.set(false);
    });
  }

  /**
   * Decodes numeric bitwise compound enum representations used inside Monaco core files 
   * into standardized, legible layout configuration strings.
   */
  private convertMonacoKeyCodeToString(keyCode: number): string | null {
    const ctrlCmd = (keyCode & monaco.KeyMod.CtrlCmd) !== 0;
    const shift   = (keyCode & monaco.KeyMod.Shift) !== 0;
    const alt     = (keyCode & monaco.KeyMod.Alt) !== 0;
    const winCtrl = (keyCode & monaco.KeyMod.WinCtrl) !== 0;
    
    // Extract lower 8 bits containing actual code values
    const key = keyCode & 0x000000FF; 

    let keyStr = '';
    if (key >= monaco.KeyCode.KeyA && key <= monaco.KeyCode.KeyZ) {
      keyStr = String.fromCharCode(key - monaco.KeyCode.KeyA + 97); // 'a' - 'z'
    } else if (key >= monaco.KeyCode.Digit0 && key <= monaco.KeyCode.Digit9) {
      keyStr = String.fromCharCode(key - monaco.KeyCode.Digit0 + 48); // '0' - '9'
    } else if (key === monaco.KeyCode.F1) {
      keyStr = 'f1';
    } else if (key === monaco.KeyCode.Slash) {
      keyStr = '/';
    }

    if (!keyStr) return null; 

    const parts = [];
    if (ctrlCmd) parts.push('ctrl'); // Will map natively across Mac (Cmd) or Windows (Ctrl) targets
    if (winCtrl) parts.push('meta');
    if (alt)     parts.push('alt');
    if (shift)   parts.push('shift');
    parts.push(keyStr);

    return parts.join('+');
  }
}

/**
 * Shared central singleton engine mapping internal Monaco Editor capabilities 
 * directly to the cross-platform application execution frameworks.
 */
export const monacoKeybindingBridge = new MonacoKeybindingBridge();
