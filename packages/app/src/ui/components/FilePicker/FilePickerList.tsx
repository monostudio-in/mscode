// src/ui/components/FilePicker/FilePickerList.tsx
import React, { useRef, useEffect } from 'react';
import { Icon , type IconName } from '@/ui/components/Icon/IconRegistry';
import { FileIcon } from '../FileIcon/DefaultIconTheme';
import type { FileStat } from '@/core/fileSystem/IFileSystem';

export interface InlineEditState {
  isNew: boolean;
  isFolder: boolean;
  initialName: string;
  targetPath: string; // for rename it's old path, for new it's parent path
}

interface FileListProps {
  items: FileStat[];
  currentPath: string;
  mode: 'file' | 'folder' | 'saveAs' | 'multiFile';
  selectedPaths: Set<string>;
  inlineEdit: InlineEditState | null;
  onItemClick: (item: FileStat) => void;
  onItemDoubleClick: (item: FileStat) => void;
  onContextMenu: (e: React.MouseEvent, item?: FileStat) => void;
  onInlineEditSubmit: (newName: string) => void;
  onInlineEditCancel: () => void;
}

export const FilePickerList: React.FC<FileListProps> = ({ 
  items, currentPath, mode, selectedPaths, inlineEdit, 
  onItemClick, onItemDoubleClick, onContextMenu, onInlineEditSubmit, onInlineEditCancel 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inlineEdit && inputRef.current) {
      inputRef.current.focus();
      // Select filename without extension
      const dotIndex = inlineEdit.initialName.lastIndexOf('.');
      if (dotIndex > 0 && !inlineEdit.isFolder) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [inlineEdit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onInlineEditSubmit(e.currentTarget.value);
    if (e.key === 'Escape') onInlineEditCancel();
  };

  const getRootIcon = (name: string): IconName => {
    if (name.includes('Internal')) return 'folder-android';
    if (name.includes('MS Projects')) return 'folder-active';
    if (name.includes('MS System')) return 'settings'; 
    if (name.includes('Termux')) return 'folder-linux';
    return 'folder';
  };

  return (
    <div className="ms-filepicker-list" onContextMenu={(e) => onContextMenu(e)}>
      
      {/* ── New Item Inline Edit Row (Appears at Top) ── */}
      {inlineEdit?.isNew && (
        <div className="ms-filepicker-item">
          <FileIcon name={inlineEdit.isFolder ? 'folder' : 'file.txt'} isDir={inlineEdit.isFolder} />
          <div className="ms-filepicker-inline-edit">
            <input 
              ref={inputRef}
              className="ms-filepicker-inline-input"
              defaultValue={inlineEdit.initialName}
              onKeyDown={handleKeyDown}
              onBlur={(e) => onInlineEditSubmit(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── File List ── */}
      {items.map((item, idx) => {
        const isEditing = inlineEdit && !inlineEdit.isNew && inlineEdit.targetPath === item.path;
        const isSelected = selectedPaths.has(item.path);
        
        // Disabled logic
        let isDisabled = false;
        if (mode === 'folder' && !item.isDirectory) isDisabled = true;
        if (mode === 'saveAs' && item.isDirectory) isDisabled = false; // can enter folders

        return (
          <div 
            key={idx}
            onClick={() => !isDisabled && onItemClick(item)}
            onDoubleClick={() => !isDisabled && onItemDoubleClick(item)}
            onContextMenu={(e) => { e.stopPropagation(); !isDisabled && onContextMenu(e, item); }}
            className={`ms-filepicker-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
          >
            {currentPath === 'ROOT' ? (
              <Icon name={getRootIcon(item.name)} size={18} color={item.isDirectory ? '#dcb67a' : 'var(--ms-text-main)'} />
            ) : (
              <FileIcon name={item.name} isDir={item.isDirectory} isOpen={isSelected && item.isDirectory} />
            )}

            {isEditing ? (
              <div className="ms-filepicker-inline-edit">
                <input 
                  ref={inputRef}
                  className="ms-filepicker-inline-input"
                  defaultValue={item.name}
                  onKeyDown={handleKeyDown}
                  onBlur={(e) => onInlineEditSubmit(e.target.value)}
                />
              </div>
            ) : (
              <span>{item.name}</span>
            )}
          </div>
        );
      })}

      {items.length === 0 && !inlineEdit?.isNew && (
        <div style={{ textAlign: 'center', color: 'var(--ms-text-faded)', marginTop: '40px', fontSize: '12px' }}>
          No files found
        </div>
      )}
    </div>
  );
};