// src/ui/components/QuickKeyboard/QuickKeyboardBar.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { useQuickKeyboardStore } from '@/store/quickKeyboardStore';
import { useTabStore } from '@/store/tabStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import './QuickKeyboardBar.css';

type Modifier = 'ctrl' | 'alt' | 'shift';
interface Mods { ctrl: boolean; alt: boolean; shift: boolean; }

const asStandalone = (e: any) => e as monaco.editor.IStandaloneCodeEditor;
const getActiveEditor = () => {
  const editors = monaco.editor.getEditors();
  const focused = editors.find(e => e.hasTextFocus());
  return (focused ?? editors[0]) ? asStandalone(focused ?? editors[0]) : undefined;
};

const runModifierAction = (char: string, mods: Mods, editor: monaco.editor.IStandaloneCodeEditor) => {
  const lower = char.toLowerCase();

  if (mods.ctrl) {
    switch (lower) {
      case 'a': editor.setSelection(editor.getModel()!.getFullModelRange()); break;
      case 'c': document.execCommand('copy'); break;
      case 'x': document.execCommand('cut'); break;
      case 'v':
        navigator.clipboard?.readText()
          .then(text => editor.trigger('keyboard', 'type', { text }))
          .catch(() => document.execCommand('paste'));
        break;
      case 'z': editor.trigger('keyboard', 'undo', null); break;
      case 'y': editor.trigger('keyboard', 'redo', null); break;
      case 's': editor.getAction('editor.action.save')?.run(); break;
      case 'f': editor.getAction('actions.find')?.run(); break;
      case 'd': editor.getAction('editor.action.addSelectionToNextFindMatch')?.run(); break;
      case '/': editor.getAction('editor.action.commentLine')?.run(); break;
      case 'p':
        // Ctrl+P Global File Search ট্রিগার করার জন্য
        window.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'p', ctrlKey: true, shiftKey: mods.shift, bubbles: true, cancelable: true
        }));
        break;
      default: break;
    }
  } else if (mods.alt) {
    if (lower === 'z') editor.getAction('editor.action.toggleWordWrap')?.run();
  } else if (mods.shift && !mods.alt) {
    const shiftMap: Record<string,string> = { '1':'!','2':'@','3':'#','4':'$','5':'%','6':'^','7':'&','8':'*','9':'(','0':')','-':'_','=':'+','[':'{',']':'}','\\':'|',';':':','\'':'"',',':'<','.':'>','/':'?' };
    editor.trigger('keyboard', 'type', { text: shiftMap[lower] ?? lower.toUpperCase() });
  }
};

function useKeyboardOffset(isVisible: boolean) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!isVisible) { setOffset(0); return; }
    if ('virtualKeyboard' in navigator) {
      const vk = (navigator as any).virtualKeyboard;
      vk.overlaysContent = true;
      const onChange = (e: any) => setOffset(e.target.boundingRect.height);
      vk.addEventListener('geometrychange', onChange);
      return () => vk.removeEventListener('geometrychange', onChange);
    }
  }, [isVisible]);
  return offset;
}

export const QuickKeyboardBar: React.FC = () => {
  const { isVisible, keys, setKeys, modifiers, toggleModifier, resetModifiers } = useQuickKeyboardStore();
  const { activeTabId, tabs } = useTabStore();
  const settings = useSettingsStore(s => s.settings);
  const keyboardOffset = useKeyboardOffset(isVisible);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const configKeys = settings['workbench.editor.quickKeyboard.keys'];
    if (Array.isArray(configKeys)) setKeys(configKeys);
  }, [settings, setKeys]);

  useEffect(() => {
    const unsub = useQuickKeyboardStore.subscribe((state) => {
      const { ctrl, alt, shift } = state.modifiers;
      if (ctrl || alt || shift) {
        hiddenInputRef.current?.focus();
      } else {
        hiddenInputRef.current?.blur();
        getActiveEditor()?.focus();
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const el = hiddenInputRef.current;
    if (!el) return;

    const onInput = () => {
      const char = el.value;
      el.value = ''; 
      if (!char || char.length > 1) return;

      const { ctrl, alt, shift } = useQuickKeyboardStore.getState().modifiers;
      if (!ctrl && !alt && !shift) return;

      const editor = getActiveEditor();
      if (editor) runModifierAction(char, { ctrl, alt, shift }, editor);
      
      resetModifiers();
    };
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  }, [resetModifiers]);

  const handleKeyClick = useCallback((action: string) => {
    const MODIFIER_ACTIONS: readonly string[] = ['ctrl', 'alt', 'shift'];
    if (MODIFIER_ACTIONS.includes(action)) {
      toggleModifier(action as Modifier);
      return;
    }

    const { ctrl, alt, shift } = useQuickKeyboardStore.getState().modifiers;
    const mods: Mods = { ctrl, alt, shift };
    const hasModifier = ctrl || alt || shift;
    
    const rawTab = tabs.find(t => t.id === activeTabId);
    if (rawTab?.type === 'termis') {
      const tc = (rawTab as any).terminalComponent;
      if (action.startsWith('type_') && tc?.terminal) {
        tc.terminal.paste?.(action.split('_')[1]);
      } else if (tc?.terminal?.textarea) {
        const map: any = { esc: [27,'Escape'], tab: [9,'Tab'], enter: [13,'Enter'], backspace: [8,'Backspace'], cursorUp: [38,'ArrowUp'], cursorDown: [40,'ArrowDown'], cursorLeft: [37,'ArrowLeft'], cursorRight: [39,'ArrowRight'] };
        if (map[action]) {
          tc.terminal.textarea.dispatchEvent(new KeyboardEvent('keydown', { key: map[action][1], keyCode: map[action][0], which: map[action][0], ctrlKey: ctrl, altKey: alt, shiftKey: shift, bubbles: true, cancelable: true }));
        }
      }
      if (hasModifier) resetModifiers();
      return;
    }

    const editor = getActiveEditor();
    if (!editor) return;

    if (['cursorUp', 'cursorDown', 'cursorLeft', 'cursorRight', 'tab', 'enter', 'esc', 'backspace', 'delete'].includes(action)) {
       if (action === 'cursorUp') {
         if (mods.alt) editor.getAction('editor.action.moveLinesUpAction')?.run();
         else editor.trigger('keyboard', 'cursorUp', null);
       } else if (action === 'cursorDown') {
         if (mods.alt) editor.getAction('editor.action.moveLinesDownAction')?.run();
         else editor.trigger('keyboard', 'cursorDown', null);
       } else if (action === 'cursorLeft') {
         if (mods.ctrl) editor.trigger('keyboard', 'cursorWordLeft', null);
         else editor.trigger('keyboard', 'cursorLeft', null);
       } else if (action === 'cursorRight') {
         if (mods.ctrl) editor.trigger('keyboard', 'cursorWordRight', null);
         else editor.trigger('keyboard', 'cursorRight', null);
       } else if (action === 'backspace') {
         editor.trigger('keyboard', 'deleteLeft', null);
       } else if (action === 'enter') {
         editor.trigger('keyboard', 'type', { text: '\n' });
       } else if (action === 'esc') {
         editor.trigger('keyboard', 'cancelSelection', null);
       } else if (action === 'tab') {
         editor.trigger('keyboard', 'tab', null);
       }
       if (hasModifier) resetModifiers();
       return;
    }

    if (action.startsWith('type_')) {
      const char = action.split('_')[1];
      if (hasModifier) runModifierAction(char, mods, editor);
      else editor.trigger('keyboard', 'type', { text: char });
      if (hasModifier) resetModifiers();
      return;
    }

    if (commands.hasCommand(action)) {
      commands.executeCommand(action);
      if (hasModifier) resetModifiers();
      return;
    }

    editor.trigger('keyboard', action, null);
    if (hasModifier) resetModifiers();
  }, [toggleModifier, resetModifiers, tabs, activeTabId]);

  const activeTab = tabs.find(t => t.id === activeTabId);
  if (!(isVisible && !!activeTab && activeTab.showQuickBar !== false)) return null;

  const floatingStyle: React.CSSProperties = keyboardOffset > 0 ? {
    position: 'absolute', bottom: `${Math.max(0, keyboardOffset - 24)}px`,
    left: 0, right: 0, zIndex: 99999, boxShadow: '0 -4px 10px rgba(0,0,0,0.4)', borderTop: '1px solid var(--ms-accent)'
  } : {};

  return (
    <div 
      className="ms-quick-keyboard" 
      style={floatingStyle}
      onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <input
        ref={hiddenInputRef}
        type="text"
        autoCapitalize="none"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        style={{
          position: 'fixed', top: '50vh', left: '50vw',
          width: '10px', height: '10px', opacity: 0.01,
          pointerEvents: 'none', zIndex: -1
        }}
      />

      {keys.map((k: any) => {
        const isModActive = (['ctrl', 'alt', 'shift'] as string[]).includes(k.action) && modifiers[k.action as Modifier];
        return (
          <button
            key={k.id}
            className={`ms-qk-btn${isModActive ? ' active-mod' : ''}`}
            style={isModActive ? { backgroundColor: 'var(--ms-accent)', color: 'white' } : undefined}
            onClick={() => handleKeyClick(k.action)}
          >
            {k.icon ? <Icon name={k.icon as any} size={14} /> : k.label}
          </button>
        );
      })}
    </div>
  );
};