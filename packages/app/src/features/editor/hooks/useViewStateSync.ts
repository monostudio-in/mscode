// useAutoSaveAndBackup.ts
import { useEffect, useCallback } from 'react';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';

interface UseViewStateSyncParams {
  editorInstance: any;
  filePath: string;
  editorRef: React.MutableRefObject<any>;
}

export function useViewStateSync({ editorInstance, filePath, editorRef }: UseViewStateSyncParams) {
  const updateViewState = useEditorViewStateStore(s => s.updateViewState);

  const saveEditorStateToMemory = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !filePath) return;
    const pos = editor.getPosition();
    updateViewState(filePath, {
      cursorLine: pos?.lineNumber, cursorColumn: pos?.column, scrollPos: editor.getScrollTop(),
    });
  }, [filePath, updateViewState, editorRef]);

  useEffect(() => {
    if (!editorInstance || !filePath) return;
    let stateSaveTimeout: any;

    const disposables = [
      editorInstance.onDidChangeCursorPosition(() => {
        saveEditorStateToMemory();
        if (stateSaveTimeout) clearTimeout(stateSaveTimeout);
        stateSaveTimeout = setTimeout(() => {
          useEditorViewStateStore.getState().saveToStorage();
        }, 5000); 
      }),
      
      editorInstance.onDidScrollChange((e: any) => {
        if (e.scrollTopChanged) saveEditorStateToMemory();
      })
    ];

    return () => {
      disposables.forEach(d => d.dispose());
      if (stateSaveTimeout) clearTimeout(stateSaveTimeout);
      useEditorViewStateStore.getState().saveToStorage(); 
    };
  }, [editorInstance, filePath, saveEditorStateToMemory]);

  return { saveEditorStateToMemory };
}