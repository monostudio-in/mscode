// src/features/editor/hooks/useContextMenuSetup.ts
import { useEffect } from 'react';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useEditorMenuStore } from '@/features/editor/components/EditorMenu/store/editorMenuStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry'; 
import { Clipboard } from '@capacitor/clipboard';

/**
 * Interface representing the comprehensive configuration properties required 
 * to wire the contextual floating interaction layers into a Monaco Editor instance.
 */
export interface ContextMenuSetupProps {
  /** The operational native Monaco Editor reference pipeline. */
  editor: any;
  /** Global Monaco Core compiler abstraction module. */
  monaco: any;
  /** Reactive mutable reference tracking pointer handle origins (`'cursor' | 'start' | 'end'`). */
  lastActiveHandleRef: React.MutableRefObject<'cursor' | 'start' | 'end'>;
  /** Action proxy intercepting user tap configurations across mobile selection boundaries. */
  handleHandleClickRef: React.MutableRefObject<(type: 'cursor' | 'start' | 'end') => void>;
  /** Trigger callback payload responsible for evaluating boundaries and drawing the DOM menu block. */
  showMenuRef: React.MutableRefObject<() => void>;
  /** Core dismiss token immediately collapsing all active nested or root menu container windows. */
  closeMenuRef: React.MutableRefObject<() => void>;
  /** Structural flag indicating if a root wrapper viewport scrolling transaction is active. */
  globalScrollRef: React.MutableRefObject<boolean>;
  /** Reactive coordinate sentinel preventing menu popups while a user is actively swiping text. */
  userScrollingRef: React.MutableRefObject<boolean>;
  /** Mouse state flag declaring if a manual anchor translation or selection adjustment is underway. */
  isDraggingRef: React.MutableRefObject<boolean>;
}

/**
 * Custom Orchestration Hook: Coordinates Monaco Editor Selection Lifecycles 
 * and maps actions seamlessly into the `EditorContextMenu` registry.
 * * * Handles automatic context calculations, scroll dismissals, hardware layout changes, 
 * and external extension API action merging configurations.
 * * ### Architecture & Core Lifecycle Subscriptions
 * This hook automatically wires up memory management handlers onto the target editor instance:
 * - `editor.onContextMenu`: Intercepts native browser right-click events to launch the custom list.
 * - `editor.onMouseUp`: Tracks when text selection selection boundaries finish stretching to trigger mobile-friendly action bars.
 * - `editor.onDidScrollChange` & `onDidChangeModelContent`: Dynamically hides the menu layer to prevent detached float layout artifacts.
 * * ### Website Documentation / Usage Example
 * ```typescript
 * import { useRef } from 'react';
 * import { useContextMenuSetup } from '@/features/editor/hooks/useContextMenuSetup';
 * * const MyEditorComponent = () => {
 * const editorRef = useRef(null);
 * const lastActiveHandleRef = useRef<'cursor' | 'start' | 'end'>('cursor');
 * * // Initialize and register all listener sequences automatically
 * useContextMenuSetup({
 * editor: editorRef.current,
 * monaco: window.monaco,
 * lastActiveHandleRef,
 * showMenuRef: useRef(() => {}),
 * closeMenuRef: useRef(() => {}),
 * globalScrollRef: useRef(false),
 * userScrollingRef: useRef(false),
 * isDraggingRef: useRef(false),
 * handleHandleClickRef: useRef(() => {})
 * });
 * * return <div id="monaco-container" />;
 * };
 * ```
 * * @param props Configuration properties containing core refs and active monaco instances.
 * @returns This hook returns `void`. It manages operations silently via listener side-effects.
 * * @category Editor Hooks
 */

export function useContextMenuSetup({
  editor,
  monaco,
  lastActiveHandleRef,
  handleHandleClickRef,
  showMenuRef,
  closeMenuRef,
  globalScrollRef,
  userScrollingRef,
  isDraggingRef
}: ContextMenuSetupProps) {
  
  useEffect(() => {
    if (!editor || !monaco) return;

    const getShortcut = (id: string) => {
      const allCmds = commands.getCommandsForPalette();
      return allCmds.find(c => c.id === id)?.shortcut || '';
    };

    const getMenuItems = () => [
      { 
        id: 'copy', label: 'Copy', icon: 'files', shortcut: 'Ctrl+C',
        onClick: async () => {
          const sel = editor.getSelection();
          if (sel && !sel.isEmpty()) {
            const text = editor.getModel()?.getValueInRange(sel);
            // Native Clipboard Write
            if (text) await Clipboard.write({ string: text });
          }
        } 
      },
      { 
        id: 'paste', label: 'Paste', icon: 'file', shortcut: 'Ctrl+V',
        onClick: async () => {
          try {
            // Native Clipboard Read
            const { value } = await Clipboard.read();
            if (value) {
              editor.executeEdits('clipboard', [{ range: editor.getSelection(), text: value, forceMoveMarkers: true }]);
            }
          } catch (err) { 
            alert('Failed to paste. Clipboard might be empty.'); 
          }
        } 
      },
      { 
        id: 'cut', label: 'Cut', icon: 'close', shortcut: 'Ctrl+X',
        onClick: async () => {
          try {
            const sel = editor.getSelection();
            if (sel && !sel.isEmpty()) {
              const text = editor.getModel()?.getValueInRange(sel);
              if (text) {
                // Native Clipboard Write
                await Clipboard.write({ string: text });
                editor.executeEdits('clipboard', [{ range: sel, text: '', forceMoveMarkers: true }]);
              }
            }
          } catch (err) { 
            alert('Failed to cut text.'); 
          }
        } 
      },
      // { type: 'separator', id: 'sep1' },
      { 
        id: 'selectAll', label: 'Select All', icon: 'clear-all', shortcut: 'Ctrl+A',
        onClick: () => commands.executeCommand('editor.action.selectAll') 
      },
      {
        id: 'format', label: 'Format Document', icon: 'check', 
        onClick: () => commands.executeCommand('editor.action.formatDocument') 
      },
      { type: 'separator', id: 'sep2' },
      { 
        id: 'commandPalette', label: 'Command Palette', icon: 'search', 
        shortcut: getShortcut('workbench.action.showCommands'),
        onClick: () => commands.executeCommand('workbench.action.showCommands') 
      },
    ];
    
    const showCustomMenuAtSelection = () => {
      const menuStyle = useSettingsStore.getState().settings['editor.contextMenuStyle'] || 'android';
      if (menuStyle === 'native') {
        editor.trigger('touch', 'editor.action.showContextMenu', null);
        return;
      }

      const sel = editor.getSelection();
      const pos = editor.getPosition();
      if (!pos) return;

      let targetPos;
      if (sel && !sel.isEmpty()) {
        targetPos = (lastActiveHandleRef.current === 'start') ? sel.getStartPosition() : sel.getEndPosition();
      } else {
        targetPos = pos;
      }

      const p = editor.getScrolledVisiblePosition(targetPos);
      const domNode = editor.getDomNode();
      if (!p || !domNode) return;
      
      const rect = domNode.getBoundingClientRect();
      const centerX = rect.left + p.left;
      const topY = rect.top + p.top;

      // 'editor/context' id
      useEditorMenuStore.getState().openEditorMenu('editor/code/context', centerX, topY, getMenuItems() as any, { 
        styleType: menuStyle, 
        activeHandle: (sel && !sel.isEmpty()) ? lastActiveHandleRef.current : 'cursor' 
      });
    };

    showMenuRef.current = showCustomMenuAtSelection;

    handleHandleClickRef.current = (type) => {
      lastActiveHandleRef.current = type;
      showCustomMenuAtSelection();
    };

    const disposables = [
      editor.onContextMenu((e: any) => {
        const menuStyle = useSettingsStore.getState().settings['editor.contextMenuStyle'] || 'android';
        if (menuStyle === 'native') return;
  
        e.event.preventDefault(); 
        e.event.stopPropagation();
        
        const sel = editor.getSelection();
        if (sel && !sel.isEmpty()) {
          showCustomMenuAtSelection(); 
        } else {
          useEditorMenuStore.getState().openEditorMenu('editor/code/context', e.event.posx, e.event.posy, getMenuItems() as any, { 
            styleType: menuStyle,
            activeHandle: 'cursor'
          });
        }
      }),
      
      editor.onMouseUp((_e: any) => {
        const targetEl = _e.event?.browserEvent?.target as Element | undefined;
        if (targetEl?.closest && targetEl.closest('.find-widget, .monaco-menu-container, .suggest-widget')) {
          return;
        }

        if (
          _e.target && 
          _e.target.type !== monaco.editor.MouseTargetType.CONTENT_TEXT && 
          _e.target.type !== monaco.editor.MouseTargetType.CONTENT_EMPTY
        ) {
          return;
        }

        setTimeout(() => {
          if (globalScrollRef.current || userScrollingRef.current) return;
          const sel = editor.getSelection();
          if (sel && !sel.isEmpty()) {
            lastActiveHandleRef.current = 'end';
            showCustomMenuAtSelection();
          }
        }, 100); 
      }),
      
      editor.onMouseDown(() => closeMenuRef.current()),
      
      editor.onDidScrollChange(() => {
        if (userScrollingRef.current || globalScrollRef.current || isDraggingRef.current) {
          closeMenuRef.current();
        }
      }),
  
      editor.onDidChangeModelContent(() => closeMenuRef.current()),
      
      editor.onDidChangeCursorSelection((e: any) => {
        if (e.source !== 'api') {
          closeMenuRef.current();
        }
      })
    ];

    return () => disposables.forEach(d => d.dispose());
  }, [editor, monaco]); 
}