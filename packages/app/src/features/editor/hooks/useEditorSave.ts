// src/features/editor/components/CodeEditor/hooks/useEditorSave.ts
import { useCallback, useRef, useEffect } from 'react';

import { deleteFileBackup }             from '@/core/services/storageService';
import { fs }                           from '@/core/fileSystem';
import { userKeybindingStore }          from '@/core/keybindings/userKeybindingStore';
import { userSnippetsService }          from '@/core/services/userSnippetsService';
import { useTabStore }                  from '@/store/tabStore';
import { useEditorViewStateStore }      from '@/features/editor/store/editorViewStateStore';

interface UseEditorSaveParams {
  editorInstance:    any;
  filePath:          string;
  monaco:            any;
  settings:          Record<string, any>;
  isMountedRef:      React.MutableRefObject<boolean>;
  savedVersionIdRef: React.MutableRefObject<number>;
}

export function useEditorSave({
  editorInstance,
  filePath,
  monaco,
  settings,
  isMountedRef,
  savedVersionIdRef,
}: UseEditorSaveParams) {
  const updateViewState = useEditorViewStateStore(s => s.updateViewState);

  const performSave = useCallback(async () => {
    if (!editorInstance || !isMountedRef.current || !filePath || !monaco) return;

    try {
      const model = editorInstance.getModel();

      // Trim trailing whitespace if enabled
      if (settings['files.trimTrailingWhitespace'] && model) {
        const lineCount = model.getLineCount();
        const edits: any[] = [];

        for (let i = 1; i <= lineCount; i++) {
          const lineContent = model.getLineContent(i);
          const match = lineContent.match(/[ \t]+$/);
          if (match) {
            const lineLength = model.getLineMaxColumn(i);
            edits.push({
              range: new monaco.Range(i, lineLength - match[0].length, i, lineLength),
              text: '',
            });
          }
        }

        if (edits.length > 0) editorInstance.executeEdits('trim-whitespace', edits);
      }

      const content = editorInstance.getValue();

      if (filePath === 'mscode://internal/keybindings.json') {
        await userKeybindingStore.saveRawText(content);
      } else {
        await fs.writeFile(filePath, content);

        // Reload snippets when a language snippet file is saved
        const snippetMatch = filePath.match(/storage\/user\/languages\/(.+?)\/snippets\.json$/);
        if (snippetMatch) {
          userSnippetsService.loadSnippetsForLanguage(snippetMatch[1]);
        }
      }

      if (model) {
        savedVersionIdRef.current = model.getAlternativeVersionId();
      }

      updateViewState(filePath, { isDirty: false });
      console.log(`[System] Saved: ${filePath}`);

      // Remove hot-exit backup after a successful real save
      const workspacePath = useTabStore.getState().currentWorkspacePath;
      await deleteFileBackup(workspacePath, filePath);
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  }, [editorInstance, filePath, monaco, settings, updateViewState, isMountedRef, savedVersionIdRef]);

  // Stable ref so callbacks registered inside handleEditorDidMount always
  // call the latest version of performSave without needing to be re-registered.
  const performSaveRef = useRef(performSave);
  useEffect(() => { performSaveRef.current = performSave; }, [performSave]);

  return { performSave, performSaveRef };
}
