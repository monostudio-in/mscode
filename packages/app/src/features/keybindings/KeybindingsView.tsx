// src/features/keybindings/components/KeybindingsView.tsx

import React, { useState, useEffect } from 'react';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { defaultKeybindings } from '@/core/keybindings/defaultKeybindings';
import { userKeybindingStore } from '@/core/keybindings/userKeybindingStore';
import { InputBox, InputAction } from '@/ui/components/InputBox/InputBox';
import { Modal } from '@/ui/components/Modal/Modal';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import './KeybindingsView.css';

interface KeybindingRow {
  command: string;
  title: string;
  key: string;
  when: string;
  source: 'Default' | 'User';
}

export const KeybindingsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState<KeybindingRow[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<KeybindingRow | null>(null);
  const [capturedKey, setCapturedKey] = useState('');
  
  // Keyboard Recording State
  const [isRecording, setIsRecording] = useState(true); 

  // data load & marge
  useEffect(() => {
    const loadData = () => {
      const allCommands = commands.getAllCommands();
      const userBindings = userKeybindingStore.getUserKeybindings();
      
      const merged: KeybindingRow[] = allCommands.map(cmd => {
        const userOverride = userBindings.find(u => u.command === cmd.id);
        if (userOverride) {
          return { command: cmd.id, title: cmd.title || cmd.id, key: userOverride.key, when: userOverride.when || '—', source: 'User' };
        }
        
        const defaultBinding = defaultKeybindings.find(d => d.command === cmd.id);
        return { 
          command: cmd.id, 
          title: cmd.title || cmd.id, 
          key: defaultBinding?.key || '', 
          when: defaultBinding?.when || '—', 
          source: 'Default' 
        };
      });

      merged.sort((a, b) => a.title.localeCompare(b.title));
      setRows(merged);
    };

    loadData();
    const interval = setInterval(loadData, 2000); 
    return () => clearInterval(interval);
  }, []);

  const filteredRows = rows.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Key Catcher 
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // if recording off then event will start , so that user can type 
    if (!isRecording) return; 

    e.preventDefault();
    e.stopPropagation();

    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.metaKey) parts.push('cmd');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');

    let key = e.key.toLowerCase();
    if (key === ' ') key = 'space';
    else if (key === '+') key = 'plus';
    
    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
      parts.push(key);
    }

    const finalKey = parts.join('+');
    
    if (capturedKey && !capturedKey.includes(' ') && parts.length > 0) {
       setCapturedKey(`${capturedKey} ${finalKey}`);
    } else {
       setCapturedKey(finalKey);
    }
  };

  const handleEditClick = (row: KeybindingRow) => {
    setEditingRow(row);
    setCapturedKey(row.key);
    setIsRecording(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingRow && capturedKey) {
      await userKeybindingStore.updateKeybinding(editingRow.command, capturedKey, editingRow.when !== '—' ? editingRow.when : undefined);
      setIsModalOpen(false);
    }
  };

  const conflicts = rows.filter(r => r.key === capturedKey && r.command !== editingRow?.command && r.key !== '');

  return (
    <div className="ms-keybindings-container">
  
  
      <div className="ms-keybindings-header">
        <InputBox 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search keybindings or commands (e.g. 'ctrl+s' or 'save')" 
          leftInsideIcon={<Icon name="search" size={16} />}
          rightInsideIcons={
            searchQuery ? <InputAction icon={<Icon name="clear-all" size={14} />} onClick={() => setSearchQuery('')} /> : null
          }
        />
      </div>

      <div className="ms-keybindings-table-container">
        <table className="ms-keybindings-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Command Title</th>
              <th>Command ID</th>
              <th>Keybinding</th>
              <th>When</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr 
                key={row.command} 
                className={`ms-keybindings-row ${selectedCommand === row.command ? 'selected' : ''}`}
                onClick={() => setSelectedCommand(row.command)}
                onDoubleClick={() => handleEditClick(row)}
              >
                <td style={{ textAlign: 'center' }}>
                  <Icon name="edit" size={14} className="edit-icon" onClick={(e: any) => { e.stopPropagation(); handleEditClick(row); }} />
                </td>
                <td>{row.title}</td>
                
                <td>
                  <code 
                    title="Click to copy Command ID"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      navigator.clipboard.writeText(row.command); 
                    }}
                    style={{ 
                      fontSize: '11.5px', 
                      color: 'var(--ms-text-muted)', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      padding: '3px 6px', 
                      borderRadius: '4px', 
                      cursor: 'copy',
                      userSelect: 'all',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {row.command}
                  </code>
                </td>

                <td style={{ display: 'flex' }}>
                  {row.key ? row.key.split(' ').map((chord, idx) => <span key={idx} className="ms-kb-badge">{chord}</span>) : '—'}
                </td>
                <td style={{ color: 'var(--ms-text-muted)' }}>{row.when}</td>
                <td className={row.source === 'User' ? 'ms-kb-source-user' : 'ms-kb-source-default'}>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        title="Edit Keybinding" 
        iconName="keyboard"
        onClose={() => setIsModalOpen(false)}
        footerActions={
           <button style={{ padding: '6px 12px', background: 'var(--ms-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={handleSave}>
             Enter (Save)
           </button>
        }
      >
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            {isRecording ? "Press desired key combination:" : "Type desired key combination:"}
          </div>
          

          <div onKeyDown={handleKeyDown} tabIndex={0} style={{ outline: 'none' }}>
            <InputBox 
               value={capturedKey} 
               onChange={(val) => {
                 if (!isRecording) setCapturedKey(val);
               }}
               placeholder={isRecording ? "Listening for keys..." : "Type here (e.g. ctrl+s)"}
               
               rightInsideIcons={
                 <>
                   {capturedKey && (
                     <InputAction 
                       icon={<Icon name="clear-all" size={14} />} 
                       onClick={() => setCapturedKey('')} 
                     />
                   )}
                   <InputAction 
                     icon={<Icon name="keyboard" size={14} />} 
                     active={isRecording}
                     onClick={() => setIsRecording(!isRecording)} 
                   />
                 </>
               }
            />
          </div>
          <div style={{ marginTop: '10px', color: 'var(--ms-text-muted)' }}>For {editingRow?.title}</div>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div 
              className="ms-kb-conflict-link" 
              onClick={() => {
                setIsModalOpen(false);
                setSearchQuery(capturedKey);
              }}
            >
              <Icon name="info" size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>
              {conflicts.length} existing commands have this keybinding
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};