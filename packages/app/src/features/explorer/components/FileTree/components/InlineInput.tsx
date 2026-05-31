
import React, { useEffect, useRef, useState } from 'react';
import { ROW_HEIGHT } from '../constant/constants';
import { FileIcon } from '@/ui/components/FileIcon/DefaultIconTheme';
import type { InlineAction } from '@/features/explorer/store/exploreStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

interface InlineInputProps {
  action:   InlineAction;
  onSubmit: (val: string) => void;
  onCancel: () => void;
}

export const InlineInput: React.FC<InlineInputProps> = ({ action, onSubmit, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(action.initialValue || '');
  
  const settings = useSettingsStore(s => s.settings);
  const showFileIcon = settings['workbench.explorer.showFileIcons'] ?? true;
  const showFolderIcon = settings['workbench.explorer.showFolderIcons'] ?? false;
  
  const isFolder = action.type === 'newFolder';
  const shouldShowIcon = isFolder ? showFolderIcon : showFileIcon;

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.focus();
    if (action.type === 'rename') {
      const dot = action.initialValue.lastIndexOf('.');
      if (dot > 0) inputRef.current.setSelectionRange(0, dot);
      else         inputRef.current.select();
    }
  }, [action]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  onSubmit(value);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div style={{ height: `${ROW_HEIGHT}px`, paddingLeft: '4px', paddingRight: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      
      {/* Conditional Icon */}
      {shouldShowIcon && (
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <FileIcon name={value} isDir={isFolder} />
        </div>
      )}
      
      <input
        ref={inputRef} value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown} onBlur={() => onSubmit(value)}
        style={{ flex: 1, minWidth: 0, background: 'var(--ms-bg-main)', color: 'var(--ms-text-main)', border: '1px solid var(--ms-accent)', outline: 'none', padding: '2px 4px', fontSize: '13px', userSelect: 'text' }}
      />
    </div>
  );
};