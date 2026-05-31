// src/features/explorer/components/FileTree/components/TreeNode.tsx

import React, { useEffect, useState } from 'react';
import { fs }                          from '@/core/fileSystem';
import type { FileStat }               from '@/core/fileSystem/IFileSystem';
import { useExplorerStore }            from '@/features/explorer/store/exploreStore';
import { useDecorationStore }          from '@/features/explorer/store/decorationStore';
import { FileIcon }                    from '@/ui/components/FileIcon/DefaultIconTheme';
import { Collapsible }                 from '@/ui/components/Collapsible/Collapsible';
import { InlineInput }                 from './InlineInput';
import { ROW_HEIGHT }                  from '../constant/constants';
import { useSettingsStore }            from '@/features/settings/store/settingsStore';
import { useTabStore }                 from '@/store/tabStore';
import { useClipboardStore }           from '@/store/clipboardStore';
import { Filesystem, Directory }       from '@capacitor/filesystem';

// ─── Props ───────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  file:           FileStat;
  parentPath:     string;
  depth?:         number;
  onFileClick:    (file: FileStat) => void;
  onContextMenu:  (e: React.MouseEvent, file: FileStat, parentPath: string) => void;
  onInlineSubmit: (val: string) => void;
}

// ─── Decoration Badge ─────────────────────────────────────────────────────────
// Tiny helper so both file and folder rows can render the same badge pill.

const DecorationBadge: React.FC<{ badge: string; color: string; tooltip?: string }> = ({ badge, color, tooltip }) => (
  <span
    title={tooltip}
    style={{
      fontSize:      '10px',
      fontWeight:    700,
      color,
      marginLeft:    'auto',
      paddingRight:  '8px',
      flexShrink:    0,
      lineHeight:    1,
    }}
  >
    {badge}
  </span>
);

// ─── FolderDot ────────────────────────────────────────────────────────────────
// Tiny dot shown on folders when a child file has propagate:true decoration.

const FolderDot: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      width:         6,
      height:        6,
      borderRadius:  '50%',
      backgroundColor: color,
      flexShrink:    0,
      marginLeft:    'auto',
      marginRight:   '10px',
    }}
  />
);

// ─── Component ───────────────────────────────────────────────────────────────

export const TreeNode: React.FC<TreeNodeProps> = ({
  file,
  parentPath,
  depth = 0,
  onFileClick,
  onContextMenu,
  onInlineSubmit,
}) => {
  const [children, setChildren] = useState<FileStat[]>([]);

  const {
    selectedItem, inlineAction, setInlineAction,
    refreshId, setSelectedItem, expandedFolders, toggleFolder,
  } = useExplorerStore();

  const activeTabId  = useTabStore(s => s.activeTabId);
  const clipboardFile = useClipboardStore(s => s.clipboardFile);

  const settings       = useSettingsStore(s => s.settings);
  const showFileIcon   = settings['workbench.explorer.showFileIcons']   ?? true;
  const showFolderIcon = settings['workbench.explorer.showFolderIcons'] ?? false;

  // GIT ILLUSION STATE
  const [magicDir, setMagicDir] = useState<string | null>(null);

  useEffect(() => {
    if (file.name === '.git' && !file.isDirectory) {
      const checkMagic = async () => {
         try {
           const normalizedParent = parentPath.replace('/storage/emulated/0', '/sdcard');
           const safeName = normalizedParent.replace(/[^a-zA-Z0-9]/g, '_');
           
           const uriRes = await Filesystem.getUri({ directory: Directory.Data, path: '' });
           const dataPath = uriRes.uri.replace('file://', '');
           const targetHostPath = `${dataPath}/.mscode_git_repos/${safeName}`;

           const stat = await Filesystem.stat({ path: targetHostPath });
           if (stat.type === 'directory') {
              setMagicDir(targetHostPath);
           }
         } catch(e) {
           // Silently ignore
         }
      };
      checkMagic();
    }
  }, [file.name, file.isDirectory, parentPath]);

  // Override properties if magic is active
  const isDir = file.isDirectory || magicDir !== null;
  const targetPath = magicDir !== null ? magicDir : file.path;

  // ── Decoration ──────────────────────────────────────────────────────────────
  const decorations   = useDecorationStore(s => s.decorations);
  const ownDecoration = decorations[targetPath] ?? decorations[file.path] ?? null;

  // For folders: check if any direct/nested child path has propagate:true
  const propagatedColor = isDir
    ? Object.entries(decorations).find(
        ([path, dec]) => dec.propagate && path.startsWith(targetPath + '/')
      )?.[1]?.color ?? null
    : null;

  // ── Derived State ───────────────────────────────────────────────────────────
  const isOpen          = expandedFolders.includes(targetPath);
  const isSelected      = selectedItem?.path === targetPath;
  const isActiveTab     = !isDir && activeTabId === targetPath;
  const isClipboardItem = clipboardFile?.path === targetPath;
  const itemOpacity     = isClipboardItem ? (clipboardFile.action === 'cut' ? 0.4 : 0.7) : 1;

  // ── Effects ─────────────────────────────────────────────────────────────────

  // Auto-open folder when an inline action targets it
  useEffect(() => {
    if (inlineAction?.parentPath === targetPath && !isOpen) toggleFolder(targetPath, true);
  }, [inlineAction, targetPath, isOpen, toggleFolder]);

  // Load children when folder is open
  useEffect(() => {
    let alive = true;
    if (isOpen && isDir) {
      fs.readDir(targetPath)
        .then(data => { if (alive) setChildren(data); })
        .catch(console.error);
    }
    return () => { alive = false; };
  }, [isOpen, refreshId, targetPath, isDir]);

  // ── Rename Inline Input ─────────────────────────────────────────────────────
  if (inlineAction?.type === 'rename' && inlineAction.targetPath === targetPath) {
    return (
      <InlineInput
        action={inlineAction}
        onSubmit={onInlineSubmit}
        onCancel={() => setInlineAction(null)}
      />
    );
  }

  // ── Sticky Scroll Settings ──────────────────────────────────────────────────
  const maxStickyFolders = settings['workbench.explorer.stickyScroll.maxItemCount'] ?? 5;
  const shouldStick   = depth <= maxStickyFolders;
  const headerHeight  = 28;
  const currentZIndex = 30 - depth;

  // ── Directory Rendering ─────────────────────────────────────────────────────
  if (isDir) {
    return (
      <Collapsible
        expanded={isOpen}
        onToggle={() => toggleFolder(targetPath, !isOpen)}
        showGuideLine={true}
        makeSticky={shouldStick}
        stickyTop={depth * headerHeight}
        stickyZIndex={currentZIndex}
        style={{ opacity: itemOpacity }}
        titleStyle={{ fontWeight: 'normal' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', width: '100%' }}>
            {showFolderIcon && (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <FileIcon name={file.name} isDir={true} isOpen={isOpen} />
              </div>
            )}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </span>

            {/* Own decoration badge (e.g. folder-level error count '2') */}
            {ownDecoration && (
              <DecorationBadge
                badge={ownDecoration.badge}
                color={ownDecoration.color}
                tooltip={ownDecoration.tooltip}
              />
            )}

            {/* Propagated child dot — only shown when folder is collapsed */}
            {!ownDecoration && propagatedColor && !isOpen && (
              <FolderDot color={propagatedColor} />
            )}
          </div>
        }
        onHeaderClick={e => {
          e.stopPropagation();
          setSelectedItem({ path: targetPath, isDirectory: true });
        }}
        onHeaderContextMenu={e => {
          e.stopPropagation();
          setSelectedItem({ path: targetPath, isDirectory: true });
          onContextMenu(e, { ...file, path: targetPath, isDirectory: true }, parentPath);
        }}
      >
        {/* New file / folder inline input inside this folder */}
        {inlineAction?.parentPath === targetPath && inlineAction.type !== 'rename' && (
          <InlineInput
            action={inlineAction}
            onSubmit={onInlineSubmit}
            onCancel={() => setInlineAction(null)}
          />
        )}

        {children.map((child, idx) => (
          <TreeNode
            key={idx}
            file={child}
            parentPath={targetPath}
            depth={depth + 1}
            onFileClick={onFileClick}
            onContextMenu={onContextMenu}
            onInlineSubmit={onInlineSubmit}
          />
        ))}
      </Collapsible>
    );
  }

  // ── File Rendering ──────────────────────────────────────────────────────────
  return (
    <div
      className="ms-file-item"
      onClick={e => {
        e.stopPropagation();
        setSelectedItem({ path: targetPath, isDirectory: false });
        onFileClick({ ...file, path: targetPath });
      }}
      onContextMenu={e => {
        e.stopPropagation();
        setSelectedItem({ path: targetPath, isDirectory: false });
        onContextMenu(e, { ...file, path: targetPath }, parentPath);
      }}
      style={{
        backgroundColor: isSelected
          ? 'var(--ms-bg-activity)'
          : isActiveTab ? 'var(--ms-menu-hover-bg)' : 'transparent',
        marginLeft:  '0px',
        paddingLeft: '4px',
        height:      `${ROW_HEIGHT}px`,
        display:     'flex',
        alignItems:  'center',
        gap:         '6px',
        cursor:      'pointer',
        opacity:     itemOpacity,
      }}
    >
      {showFileIcon && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <FileIcon name={file.name} isDir={false} />
        </div>
      )}

      <span style={{
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        fontSize:     '13px',
        // Color the filename itself when decorated (e.g. yellow for Modified)
        color: ownDecoration ? ownDecoration.color : undefined,
      }}>
        {file.name}
      </span>

      {/* Badge: 'M', 'U', 'A', 'D' etc. */}
      {ownDecoration && (
        <DecorationBadge
          badge={ownDecoration.badge}
          color={ownDecoration.color}
          tooltip={ownDecoration.tooltip}
        />
      )}
    </div>
  );
};