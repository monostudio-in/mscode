import { useEffect } from 'react';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { useNavigationStore } from '@/store/navigationStore';

interface UseTabAndNavigationSyncParams {
  activeTabId: string | null;
  tabId: string;
  editorInstance: any;
  editorRef: React.MutableRefObject<any>;
  filePath: string;
  isMountedRef: React.MutableRefObject<boolean>;
  updateTeardrops: () => void;
}

export function useTabAndNavigationSync({
  activeTabId,
  tabId,
  editorInstance,
  editorRef,
  filePath,
  isMountedRef,
  updateTeardrops,
}: UseTabAndNavigationSyncParams) {
  const { pendingNavigation, clearNavigation } = useNavigationStore();

  useEffect(() => {
    if (activeTabId === tabId && editorInstance && isMountedRef.current) {
      // console.log(`[CodeEditor] Tab Switched to: ${filePath}. Forcing Active Editor!`);
      commands.setActiveEditor(editorInstance); 

      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          editorInstance.layout();
          updateTeardrops();
        }
      }, 150); 
      return () => clearTimeout(timer);
    }
  }, [activeTabId, tabId, editorInstance, updateTeardrops, filePath, isMountedRef]);

  useEffect(() => {
    if (pendingNavigation && pendingNavigation.path === filePath && editorRef.current) {
      const { line, column } = pendingNavigation;
      const editor = editorRef.current;

      setTimeout(() => {
        if (isMountedRef.current) {
          editor.revealPositionInCenter({ lineNumber: line, column: column });
          editor.setPosition({ lineNumber: line, column: column });
          editor.focus();
          clearNavigation();
        }
      }, 50);
    }
  }, [pendingNavigation, filePath, clearNavigation, editorRef, isMountedRef]);
}