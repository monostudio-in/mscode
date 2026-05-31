import { loadFileBackup } from '@/core/services/storageService';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { monacoKeybindingBridge } from '@/core/keybindings/monacoKeybindingBridge';
import { userSnippetsService } from '@/core/services/userSnippetsService';
import { useTabStore } from '@/store/tabStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { useQuickKeyboardStore } from '@/store/quickKeyboardStore';

interface UseEditorLifecycleParams {
  monaco: any;
  filePath: string;
  settings: Record<string, any>;
  savedVersionIdRef: React.MutableRefObject<number>;
  isMountedRef: React.MutableRefObject<boolean>;
  setEditorInstance: (editor: any) => void;
  originalDidMount: (editor: any) => void;
  performSaveRef: React.MutableRefObject<() => Promise<void>>;
  updateTeardrops: () => void;
  DIRTY_SENTINEL_VERSION: number;
}

export function useEditorLifecycle({
  monaco,
  filePath,
  settings,
  savedVersionIdRef,
  isMountedRef,
  setEditorInstance,
  originalDidMount,
  performSaveRef,
  updateTeardrops,
  DIRTY_SENTINEL_VERSION,
}: UseEditorLifecycleParams) {
  const updateViewState = useEditorViewStateStore(s => s.updateViewState);

  const handleEditorDidMount = (editor: any) => {
    setEditorInstance(editor);
    originalDidMount(editor);
    const model = editor.getModel();
    
    if (!monaco) return;

    editor.addAction({
      id: 'editor.action.save',
      label: 'Save File',
      keybindings: [], 
      run: async () => {
        await performSaveRef.current();
      }
    });
    
    monacoKeybindingBridge.attach(editor);
    commands.setActiveEditor(editor);

    editor.onDidFocusEditorWidget(() => {
      commands.setActiveEditor(editor);
    });
    
    if (model && filePath && monaco) {
      savedVersionIdRef.current = model.getAlternativeVersionId();

      const interceptAndRestoreBackup = async () => {
        const workspacePath = useTabStore.getState().currentWorkspacePath;
        const backupContent = await loadFileBackup(workspacePath, filePath);
        
        if (backupContent !== null && isMountedRef.current) {
          console.log(`[Hot Exit] Restoring unsaved cache draft for: ${filePath}`);
          model.setValue(backupContent);
          
          updateViewState(filePath, { isDirty: true });
          savedVersionIdRef.current = DIRTY_SENTINEL_VERSION;
        }
      };
      interceptAndRestoreBackup();

      const viewState = useEditorViewStateStore.getState().viewStates[filePath];
      
      model.updateOptions({ 
        tabSize: viewState?.tabSize ?? settings['editor.tabSize'] ?? 4, 
        insertSpaces: viewState?.insertSpaces ?? settings['editor.insertSpaces'] ?? true 
      });

      if (filePath === 'mscode://internal/keybindings.json') {
        monaco.editor.setModelLanguage(model, 'json');
      } else if (viewState?.languageId) {
        monaco.editor.setModelLanguage(model, viewState.languageId);
      } else {
        const ext = '.' + filePath.split('.').pop()?.toLowerCase();
        const detectedLang = monaco.languages.getLanguages().find((l: any) => l.extensions?.includes(ext));
        const targetLang = detectedLang ? detectedLang.id : 'plaintext';
        monaco.editor.setModelLanguage(model, targetLang);
        
        userSnippetsService.loadSnippetsForLanguage(targetLang);
      }

      if (viewState && viewState.cursorLine && viewState.cursorColumn) {
        editor.setPosition({ lineNumber: viewState.cursorLine, column: viewState.cursorColumn });
        if (viewState.scrollPos) editor.setScrollTop(viewState.scrollPos);
        else editor.revealPositionInCenter({ lineNumber: viewState.cursorLine, column: viewState.cursorColumn });
      }
      
      editor.updateOptions({
        quickSuggestions: { other: true, comments: false, strings: true },
        parameterHints: { enabled: true, cycle: true },
        suggest: {
            showStrings: true,
            showFunctions: true,
            showMethods: true
        }
      });

      editor.onDidType((text: string) => {
        if (text === '"' || text === "'" || text === '`') {
          setTimeout(() => {
            editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
          }, 10);
        }
      });
      
      
      // ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
      // Native Mobile Modifier Interceptor
      const textarea = editor.getDomNode()?.querySelector('textarea');
      if (textarea) {
        textarea.addEventListener('beforeinput', (e: any) => {
          const { ctrl, alt, shift } = useQuickKeyboardStore.getState().modifiers;
          
          // No modifiers , Then Type
          if (!ctrl && !alt && !shift) return;

          const char = e.data;
          if (char && char.length === 1) {
            e.preventDefault();
            e.stopPropagation();

            // Use modifiers one time and then off
            useQuickKeyboardStore.getState().resetModifiers();

            // Native KeyboardEvent
            const keyCode = char.toUpperCase().charCodeAt(0);
            const evt = new KeyboardEvent('keydown', {
              key: char.toLowerCase(),
              code: `Key${char.toUpperCase()}`,
              keyCode: keyCode,
              which: keyCode,
              ctrlKey: ctrl,
              altKey: alt,
              shiftKey: shift,
              metaKey: false,
              bubbles: true,
              cancelable: true
            });
            
            textarea.dispatchEvent(evt);
          }
        });
      }
      // ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

      setTimeout(() => {
        if (editor && isMountedRef.current) {
          editor.layout(); 
          updateTeardrops(); 
        }
      }, 300);
    }
  };

  return { handleEditorDidMount };
}