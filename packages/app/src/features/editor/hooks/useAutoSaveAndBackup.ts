
import { useEffect } from 'react';
import { useTabStore } from '@/store/tabStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { getBackupFilesList, getFileSafeName, saveFileBackup, deleteFileBackup } from '@/core/services/storageService';

interface UseAutoSaveAndBackupParams {
  editorInstance: any;
  filePath: string;
  settings: Record<string, any>;
  savedVersionIdRef: React.MutableRefObject<number>;
  isMountedRef: React.MutableRefObject<boolean>;
  performSave: () => Promise<void>;
}

export function useAutoSaveAndBackup({
  editorInstance,
  filePath,
  settings,
  savedVersionIdRef,
  isMountedRef,
  performSave,
}: UseAutoSaveAndBackupParams) {
  const updateViewState = useEditorViewStateStore(s => s.updateViewState);

  useEffect(() => {
    if (!editorInstance || !filePath) return;

    const autoSaveMode = settings['files.autoSave'] || 'off';
    const autoSaveDelay = settings['files.autoSaveDelay'] ?? 1000;
    const maxBackupLimit = settings['files.maxDirtyBackupLimit'] ?? 20; 
    
    let delayTimeout: any;
    let backupTimeout: any;

    const disposables: any[] = [];

    disposables.push(
      editorInstance.onDidChangeModelContent(() => {
        const model = editorInstance.getModel();
        if (!model) return;

        const currentVersionId = model.getAlternativeVersionId();
        const isNowDirty = currentVersionId !== savedVersionIdRef.current;
        
        const storedDirty = useEditorViewStateStore.getState().viewStates[filePath]?.isDirty;

        if (storedDirty !== isNowDirty) {
          updateViewState(filePath, { isDirty: isNowDirty });
        }

        if (backupTimeout) clearTimeout(backupTimeout);
        
        const workspacePath = useTabStore.getState().currentWorkspacePath;
        
        if (isNowDirty) {
          backupTimeout = setTimeout(async () => {
            if (!isMountedRef.current) return;

            const activeBackups = await getBackupFilesList(workspacePath);
            const fName = await getFileSafeName(filePath);
            const currentSafeName = fName + '.bak';

            if (activeBackups.length >= maxBackupLimit && !activeBackups.includes(currentSafeName)) {
              console.warn(`⚠️ [Hot Exit] Max dirty backup limit (${maxBackupLimit}) reached!`);
              return;
            }

            const activeContent = model.getValue();
            await saveFileBackup(workspacePath, filePath, activeContent);
          }, 800);
        } else {
          deleteFileBackup(workspacePath, filePath);
        }

        if (isNowDirty && autoSaveMode === 'afterDelay') {
          if (delayTimeout) clearTimeout(delayTimeout);
          delayTimeout = setTimeout(() => { performSave(); }, autoSaveDelay);
        }
      })
    );

    disposables.push(
      editorInstance.onDidBlurEditorText(() => {
        if (autoSaveMode === 'onFocusChange') {
          const model = editorInstance.getModel();
          const isNowDirty = model && model.getAlternativeVersionId() !== savedVersionIdRef.current;
          if (isNowDirty) performSave();
        }
      })
    );

    const handleWindowBlur = () => {
      if (autoSaveMode === 'onWindowChange') {
        const model = editorInstance.getModel();
        const isNowDirty = model && model.getAlternativeVersionId() !== savedVersionIdRef.current;
        if (isNowDirty) performSave();
      }
    };
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      disposables.forEach(d => d.dispose());
      window.removeEventListener('blur', handleWindowBlur);
      if (delayTimeout) clearTimeout(delayTimeout);
      if (backupTimeout) clearTimeout(backupTimeout);
    };
  }, [editorInstance, filePath, settings, performSave, updateViewState, savedVersionIdRef, isMountedRef]);
}