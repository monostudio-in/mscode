// src/features/explorer/hooks/useExplorerActions.ts

import { useTabStore } from '@/store/tabStore';
import { useMenuStore } from '@/store/menuStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { fs } from '@/core/fileSystem';
import type { FileStat } from '@/core/fileSystem/IFileSystem';
import { useClipboardStore } from '@/store/clipboardStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { contextKeyService } from '@/core/keybindings/contextKeyService';
import { useNotificationStore } from '@/store/notificationStore';
import { customPreviewerRegistry } from '@/core/extensionAPI/registry/previewerRegistry';

export function useExplorerActions() {
  const { addTab } = useTabStore();
  const { openMenu } = useMenuStore();
  
  const {
    inlineAction, setInlineAction,
    triggerRefresh,
    workspacePath, 
    expandedFolders, toggleFolder
  } = useExplorerStore();

  const { clipboardFile, setClipboardFile, clearClipboard } = useClipboardStore();

  // ─── 1. FILE/WORKSPACE HANDLERS ───

  const handleFileClick = (file: FileStat) => {
    if (!file.isDirectory) {
      addTab({ id: file.path, type: 'code', title: file.name, filePath: file.path });
    }
  };

  // Force open as plain text (Fallback Editor)
  const handleOpenAsText = (file: FileStat) => {
    if (!file.isDirectory) {
      // We pass a special flag or change the type to force the fallback rendering
      addTab({ id: `text-${file.path}`, type: 'fallback_text', title: `(Text) ${file.name}`, filePath: file.path } as any);
    }
  };

  const handleDelete = (path: string) => {
    const fileName = path.split('/').pop() || path;
    const notifId = `delete_${Date.now()}`; 

    useNotificationStore.getState().addNotification({
      id: notifId,
      type: 'confirmation',
      title: 'Delete Permanently?',
      source: 'Explorer',
      message: `Are you sure you want to permanently delete '${fileName}'?`,
      actions: [
        {
          label: 'Delete',
          variant: 'type1',
          customStyle: { backgroundColor: '#d32f2f', color: '#ffffff', borderColor: '#d32f2f' },
          onClick: async () => {
            useNotificationStore.getState().removeNotification(notifId);
            try {
              await fs.delete(path);
              const { tabs, closeTab } = useTabStore.getState();
              tabs.forEach(t => {
                 if (t.id === path || t.id.startsWith(path + '/')) {
                    closeTab(t.id);
                 }
              });
              triggerRefresh();
            } catch (error) {
              useNotificationStore.getState().addNotification({
                type: 'error',
                title: 'Delete Failed',
                source: 'Explorer',
                message: `Failed to delete '${fileName}'.`
              });
            }
          }
        },
        {
          label: 'Cancel',
          variant: 'type2',
          onClick: () => useNotificationStore.getState().removeNotification(notifId)
        }
      ]
    });
  };

  const handleInlineSubmit = async (value: string) => {
    if (!value.trim() || !inlineAction) return setInlineAction(null);
    const targetPath = inlineAction.parentPath === '/' ? `/${value}` : `${inlineAction.parentPath}/${value}`;

    try {
      if (inlineAction.type === 'newFile')  await fs.writeFile(targetPath, '');
      else if (inlineAction.type === 'newFolder') await fs.mkdir(targetPath);
      else if (inlineAction.type === 'rename' && inlineAction.targetPath) {
        await fs.rename(inlineAction.targetPath, targetPath);
        useTabStore.getState().updateTabPaths(inlineAction.targetPath, targetPath);
      }
    } catch (err) {
      console.error(err);
    }
    setInlineAction(null);
    triggerRefresh();
  };
  
  const handleCopyPath = async (path: string) => {
    try { await navigator.clipboard.writeText(path); } catch (e) {}
  };

  const handleCopyRelativePath = async (path: string) => {
    if (!workspacePath) return;
    const relPath = path.startsWith(workspacePath) ? path.substring(workspacePath.length + 1) : path;
    try { await navigator.clipboard.writeText(relPath); } catch (e) {}
  };

  const handlePaste = async (targetParentPath: string) => {
    if (!clipboardFile) return;
    try {
      const fileName = clipboardFile.path.split('/').pop();
      const destPath = targetParentPath === '/' ? `/${fileName}` : `${targetParentPath}/${fileName}`;

      if (clipboardFile.action === 'copy') {
        if ((fs as any).copy) await (fs as any).copy(clipboardFile.path, destPath);
      } else if (clipboardFile.action === 'cut') {
        await fs.rename(clipboardFile.path, destPath);
        clearClipboard(); 
      }
      triggerRefresh();
    } catch (e) { console.error('Paste failed:', e); }
  };

  // ─── 3. THE ADVANCED CONTEXT MENU HANDLER ───

  const handleContextMenu = (e: React.MouseEvent, clickedFile?: FileStat, clickedParentPath: string = workspacePath || '/') => {
    e.preventDefault(); e.stopPropagation();
    if (!workspacePath) return;

    const targetParentPath = clickedFile ? (clickedFile.isDirectory ? clickedFile.path : clickedParentPath) : workspacePath;

    const ensureOpen = () => {
      if (targetParentPath !== workspacePath && !expandedFolders.includes(targetParentPath)) {
        toggleFolder(targetParentPath, true);
      }
    };
    
    const isRoot = clickedFile?.path === workspacePath;

    contextKeyService.setContext('explorerResourceIsFolder', clickedFile ? clickedFile.isDirectory : true);
    contextKeyService.setContext('explorerResourcePath', clickedFile?.path || workspacePath);
    contextKeyService.setContext('explorerResourceExt', clickedFile?.name.split('.').pop() || '');
    contextKeyService.setContext('clickedFile&isRoot', clickedFile && !isRoot);

    let hasCustomPreviewer = false;
    let previewerName = 'Preview';
    if (clickedFile && !clickedFile.isDirectory) {
       const previewer = customPreviewerRegistry.getPreviewerForExtension(clickedFile.name);
       if (previewer) {
         hasCustomPreviewer = true;
         previewerName = previewer.name;
       }
    }

    openMenu('sidebar/files/tree', e.clientX, e.clientY, [
      {
        options: hasCustomPreviewer && clickedFile ? [
          { id: 'open-preview', label: `Open in ${previewerName}`, icon: '', onClick: () => handleFileClick(clickedFile) },
          { id: 'open-text', label: 'Open as Text', icon: '', onClick: () => handleOpenAsText(clickedFile) }
        ] : []
      },
      {
        options: [
          {
            id: 'nf',
            label: 'New Folder',
            icon: 'new-folder',
            showOnlyWhenSubOptionAvailable: true,
            children: [
              { id: 'nf-new', label: 'New Folder...', onClick: () => { isRoot ? commands.executeCommand('explorer.newFolder') : setInlineAction({ type: 'newFolder', parentPath: targetParentPath, initialValue: '' }); ensureOpen(); } }
            ]
          },
          {
            id: 'nfile',
            label: 'New File',
            icon: 'new-file',
            showOnlyWhenSubOptionAvailable: true,
            children: [ 
              { id: 'nfile-new', label: 'New File...', onClick: () => { isRoot ? commands.executeCommand('explorer.newFile') : setInlineAction({ type: 'newFile', parentPath: targetParentPath, initialValue: '' }); ensureOpen(); } }
            ]
          }
        ]
      },
      {
        options: clickedFile && !isRoot ? [
          { id: 'cut',  label: 'Cut',  onClick: () => setClipboardFile(clickedFile.path, 'cut') },
          { id: 'copy', label: 'Copy', onClick: () => setClipboardFile(clickedFile.path, 'copy') },
        ] : []
      },
      {
        options: [
          { id: 'paste', label: 'Paste', disabled: !clipboardFile, onClick: () => { handlePaste(targetParentPath); ensureOpen(); } },
          ...(clipboardFile ? [{
            id: 'cancel-clipboard',
            label: clipboardFile.action === 'cut' ? 'Cancel Cut' : 'Cancel Copy',
            icon: 'close',
            onClick: () => clearClipboard()
          }] : [])
        ]
      },
      {
        options: clickedFile && !isRoot ? [
          { id: 'copypath', label: 'Copy Path', onClick: () => handleCopyPath(clickedFile.path) },
          { id: 'copyrel',  label: 'Copy Relative Path', onClick: () => handleCopyRelativePath(clickedFile.path) },
        ] : []
      },
      {
        options: isRoot ? [
          { id: 'of', label: 'Open Folder',  onClick: () => commands.executeCommand('workbench.action.files.openFolder') },
          { id: 'cf', label: 'Close Folder', onClick: () => commands.executeCommand('workbench.action.closeFolder') },
        ] : (clickedFile ? [
          { id: 'ren', label: 'Rename...',           shortcut: 'F2',  onClick: () => setInlineAction({ type: 'rename', targetPath: clickedFile.path, parentPath: clickedParentPath, initialValue: clickedFile.name }) },
          { id: 'del', label: 'Delete Permanently',  shortcut: 'Del', onClick: () => handleDelete(clickedFile.path) },
        ] : [])
      }
    ]);
  };

  return {
    handleFileClick, 
    handleDelete, 
    handleInlineSubmit, 
    handleContextMenu 
  };
}