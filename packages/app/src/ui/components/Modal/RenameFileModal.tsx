// src/features/ui/components/Modal/RenameFileModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/components/Modal/Modal';
import { InputBox, InputAction } from '@/ui/components/InputBox/InputBox';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { FileIcon } from '@/ui/components/FileIcon/DefaultIconTheme';
import { useTabStore } from '@/store/tabStore';
import { fs } from '@/core/fileSystem';

export const RenameFileModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const { activeTabId, tabs, updateTabPaths } = useTabStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  const oldName = activeTab?.title || '';

  useEffect(() => {
    const handleOpen = () => {
      if (activeTab) {
        setNewName(activeTab.title);
        setIsOpen(true);
      }
    };
    window.addEventListener('ms-open-rename-modal', handleOpen);
    return () => window.removeEventListener('ms-open-rename-modal', handleOpen);
  }, [activeTab]);

  const handleRename = async () => {
    if (!activeTab?.filePath || !newName || newName === oldName) {
      setIsOpen(false);
      return;
    }

    const parentPath = activeTab.filePath.substring(0, activeTab.filePath.lastIndexOf('/'));
    const newPath = `${parentPath}/${newName}`;

    try {
      await fs.rename(activeTab.filePath, newPath);
      // Updating tab after renaming file
      updateTabPaths(activeTab.filePath, newPath);
      setIsOpen(false);
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      title="Rename File" 
      iconName="edit" 
      onClose={() => setIsOpen(false)}
    >
      <div style={{ padding: '15px' }}>
        <InputBox 
          value={newName}
          onChange={setNewName}
          placeholder="Enter new name..."
          
          // Outside Left: Live File Icon
          leftOutsideIcon={<FileIcon name={newName} isDir={false} />}
          
          // Inside Right: Clear All
          rightInsideIcons={
            newName && <InputAction icon={<Icon name="clear-all" size={14} />} onClick={() => setNewName('')} />
          }
          
          // Outside Right: Save Icon
          rightOutsideIcons={
            <InputAction 
               icon={<Icon name="save" size={16} color="var(--ms-primary)" />} 
               onClick={handleRename} 
            />
          }
        />

        {/* Rename Preview with Info Icon */}
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontSize: '12px', 
          color: 'var(--ms-text-faded)' 
        }}>
          <Icon name="info" size={14} />
          <span>
            {oldName} <span style={{ opacity: 0.6 }}>rename into</span> <b style={{ color: 'var(--ms-text-main)' }}>{newName}</b>
          </span>
        </div>

        {/* Enter Key Listener */}
        <input 
          type="hidden" 
          onKeyDown={(e) => e.key === 'Enter' && handleRename()} 
          autoFocus 
        />
      </div>
    </Modal>
  );
};