// src/features/editor/hooks/useFileLoader.ts
//
// Responsibility: Load file content from disk (or view state cache) on mount.
// Writes back to view state cache on every editor change.
// Returns: { initialContent, isLoading, handleEditorChange }

import { useState, useEffect } from 'react';
import { fs } from '@/core/fileSystem';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { userKeybindingStore } from '@/core/keybindings/userKeybindingStore';

interface UseFileLoaderOptions {
  tabId:    string;
  filePath: string;
}

export function useFileLoader({ tabId, filePath }: UseFileLoaderOptions) {
  const [initialContent, setInitialContent] = useState('');
  const [isLoading,      setIsLoading]      = useState(true);

  const updateViewState = useEditorViewStateStore(state => state.updateViewState);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    (async () => {
      const currentViewState = useEditorViewStateStore.getState().viewStates[tabId];
      let content = currentViewState?.content;

      if (content === undefined) {
        try {
          // Virtual File Interception
          if (filePath === 'mscode://internal/keybindings.json') {
            content = userKeybindingStore.getRawText();
          } else {
            content = await fs.readFile(filePath);
          }
        } catch {
          content = '// File not found.';
        }
        if (mounted) updateViewState(tabId, { content, isDirty: false });
      }

      if (mounted) {
        setInitialContent(content ?? '');
        setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [filePath, tabId, updateViewState]); 

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateViewState(tabId, { content: value, isDirty: true });
    }
  };

  return { initialContent, isLoading, handleEditorChange };
}