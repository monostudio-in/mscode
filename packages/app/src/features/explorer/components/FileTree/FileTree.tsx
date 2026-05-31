// src/features/explorer/components/FileTree/FileTree.tsx

import React, { useEffect, useState } from 'react';
import { fs } from '@/core/fileSystem';
import type { FileStat } from '@/core/fileSystem/IFileSystem';
import { useTabStore } from '@/store/tabStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
;
import { FileIcon } from '@/ui/components/FileIcon/DefaultIconTheme';
import { Collapsible } from '@/ui/components/Collapsible/Collapsible';

import { TreeNode }            from './components/TreeNode';
import { InlineInput }         from './components/InlineInput';
import { EmptyWorkspace }      from './components/EmptyWorkspace';
import { useExplorerActions }  from '../../hooks/useExplorerActions';

import './FileTree.css';

export const FileTree: React.FC = () => {
  const [rootFiles, setRootFiles] = useState<FileStat[]>([]);

  const { activeTabId } = useTabStore();
  
  const settings = useSettingsStore(s => s.settings);
  const showFolderIcon = settings['workbench.explorer.showFolderIcons'] ?? false;

  const {
    inlineAction, setInlineAction,
    refreshId, setSelectedItem,
    workspacePath, workspaceName,
  } = useExplorerStore();

  const {
    handleFileClick, handleInlineSubmit, handleContextMenu,
  } = useExplorerActions();

  useEffect(() => {
    if (activeTabId) setSelectedItem({ path: activeTabId, isDirectory: false });
  }, [activeTabId, setSelectedItem]);

  useEffect(() => {
    let alive = true;
    if (workspacePath) {
      fs.readDir(workspacePath).then(data => { if (alive) setRootFiles(data); }).catch(console.error);
    } else {
      setRootFiles([]);
    }
    return () => { alive = false; };
  }, [refreshId, workspacePath]);

  return (
    <div
      style={{ 
        padding: 0, 
        position: 'relative', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: workspacePath ? 'max-content' : 'auto', 
        minWidth: '100%'
      }}
      onClick={() => setSelectedItem(null)}
      onContextMenu={e => {
        setSelectedItem(null);
        handleContextMenu(e, undefined, workspacePath || '/');
      }}
    >
      {!workspacePath && !inlineAction && <EmptyWorkspace />}

      {workspacePath && (
        <Collapsible
          defaultExpanded={true}
          showGuideLine={true}
          makeSticky={true}
          stickyTop={0}
          stickyZIndex={40}
          stickyLeft={0} 
          titleStyle={{ fontWeight: 'normal' }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              {showFolderIcon && (
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <FileIcon name={workspaceName || 'PROJECT'} isDir={true} isOpen={true} />
                </div>
              )}
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'normal' }}>
                {workspaceName || 'PROJECT'}
              </span>
            </div>
          }
          onHeaderClick={e => {
            e.stopPropagation();
            setSelectedItem({ path: workspacePath, isDirectory: true });
          }}
          onHeaderContextMenu={e => {
            setSelectedItem({ path: workspacePath, isDirectory: true });
            handleContextMenu(e, { path: workspacePath, isDirectory: true, name: workspaceName || 'PROJECT' } as FileStat, workspacePath);
          }}
        >
          {inlineAction?.parentPath === workspacePath && inlineAction.type !== 'rename' && (
            <InlineInput action={inlineAction} onSubmit={handleInlineSubmit} onCancel={() => setInlineAction(null)} />
          )}

          {rootFiles.map((file, idx) => (
            <TreeNode key={idx} file={file} parentPath={workspacePath} depth={1} onFileClick={handleFileClick} onContextMenu={handleContextMenu} onInlineSubmit={handleInlineSubmit} />
          ))}
        </Collapsible>
      )}
    </div>
  );
  
};