// src/ui/components/FilePicker/FilePickerToolbar.tsx
import React from 'react';
import { Icon } from '../Icon/IconRegistry';
import { InputAction } from '../InputBox/InputBox';

interface ToolbarProps {
  currentPath: string;
  allowCreate: boolean;
  onGoUp: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onRefresh: () => void;
}

export const FilePickerToolbar: React.FC<ToolbarProps> = ({ currentPath, allowCreate, onGoUp, onCreateFile, onCreateFolder, onRefresh }) => {
  return (
    <div className="ms-filepicker-toolbar">
      <div 
        onClick={onGoUp} 
        style={{ cursor: currentPath === 'ROOT' ? 'not-allowed' : 'pointer', opacity: currentPath === 'ROOT' ? 0.4 : 1, padding: '4px', borderRadius: '4px' }}
        title="Go Up"
      >
        <Icon name="arrow-up" size={16} />
      </div>
      
      <div className="ms-filepicker-breadcrumb">
        {currentPath === 'ROOT' ? 'Computer / Workspaces' : currentPath}
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        {allowCreate && currentPath !== 'ROOT' && (
          <>
            <InputAction icon={<Icon name="new-file" size={16} />} onClick={onCreateFile} />
            <InputAction icon={<Icon name="new-folder" size={16} />} onClick={onCreateFolder} />
          </>
        )}
        <InputAction icon={<Icon name="refresh" size={16} />} onClick={onRefresh} />
      </div>
    </div>
  );
};