// src/features/termis/components/TermisPanel.tsx

import React, { useState } from 'react';
import { useTermisStore } from './store/termisStore';
import { useTerminalStore } from './components/terminal/store/terminalStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { OutputPanel } from './components/output/components/OutputPanel';
import { ProblemsPanel } from './components/problems/ProblemsPanel';
import { TerminalInstance } from './components/terminal/components/TerminalInstance';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import './TermisPanel.css';

// Status indicator color map
const STATUS_COLOR: Record<string, string> = {
  initializing: '#888',
  ready:        '#4ec9b0',
  busy:         '#dcdcaa',
  exited:       '#888',
  error:        '#f44747',
};

export const TermisPanel: React.FC<{ mode?: 'panel' | 'fullscreen' }> = ({ mode = 'panel' }) => {
  // Main Panel store
  const { isOpen, panelHeight, activeView, setActiveView, closePanel } = useTermisStore();
  
  // Terminal Specific Store
  const { instances, activeId, createInstance, setActive, removeInstance, updateInstance } = useTerminalStore();
  
  const workspacePath = useExplorerStore(s => s.workspacePath);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!isOpen && mode === 'panel') return null;

  const handleNewTerminal = () => {
    createInstance({ workingDir: workspacePath || '/root' });
  };

  const handleClear = () => {
    if (activeId) updateInstance(activeId, { _clearToken: Date.now() } as any);
  };

  return (
    <div className={`ms-termis-panel ${mode}`} style={mode === 'panel' ? { height: panelHeight } : { height: '100%' }}>
      {/* ── 1. Resizer ── */}
      {mode === 'panel' && <div className="ms-panel-resizer" />}

      {/* ── 2. Header (Subtabs) ── */}
      <div className="ms-panel-header">
        <div className="ms-panel-tabs">
          <div 
            className={`ms-panel-tab ${activeView === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveView('problems')}
          >
            PROBLEMS
          </div>
          <div 
            className={`ms-panel-tab ${activeView === 'output' ? 'active' : ''}`}
            onClick={() => setActiveView('output')}
          >
            OUTPUT
          </div>
          <div 
            className={`ms-panel-tab ${activeView === 'terminal' ? 'active' : ''}`}
            onClick={() => {
              if (instances.length === 0) handleNewTerminal();
              setActiveView('terminal');
            }}
          >
            TERMINAL
          </div>
        </div>

        {/* Header Actions */}
        <div className="ms-panel-actions">
          {activeView === 'terminal' && (
            <>
              <button title="New Terminal" onClick={handleNewTerminal}>
                <Icon name="add" size={14} />
              </button>
              <button title="Clear Terminal" onClick={handleClear}>
                <Icon name="clear-all" size={14} />
              </button>
              <button title="Toggle Terminal Sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Icon name="menu" size={14} />
              </button>
            </>
          )}
          {mode === 'panel' && (
            <button title="Close Panel" onClick={closePanel} style={{ marginLeft: '8px' }}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Body (View Renderer) ── */}
      <div className="ms-panel-body">
        
        {/* Terminal Area */}
        <div style={{ display: activeView === 'terminal' ? 'flex' : 'none', width: '100%', height: '100%' }}>
          
          {/* Main Terminal Xterm Area */}
          <div className="ms-terminal-instances-container" style={{ flexGrow: 1, position: 'relative' }}>
            {instances.length === 0 && <EmptyTerminalState onNew={handleNewTerminal} />}
            {instances.map(inst => (
              <TerminalInstance key={inst.id} terminalId={inst.id} isActive={inst.id === activeId} />
            ))}
          </div>

          {/* Inner Right Sidebar for multiple terminal tabs */}
          {isSidebarOpen && instances.length > 0 && (
            <div className="ms-terminal-inner-sidebar">
              {instances.map(inst => (
                <div 
                  key={inst.id} 
                  className={`ms-terminal-sidebar-item ${inst.id === activeId ? 'active' : ''}`}
                  onClick={() => setActive(inst.id)}
                >
                  <div className="ms-terminal-sidebar-item-left">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: STATUS_COLOR[inst.status] ?? '#888' }} />
                    <Icon name="terminal" size={14} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                      {inst.title}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeInstance(inst.id); }}>
                    <Icon name="close" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Output Area */}
        {activeView === 'output' && <OutputPanel />}

        {/* Problems Area */}
         {activeView === 'problems' && <ProblemsPanel />}
         
      </div>
    </div>
  );
};

const EmptyTerminalState: React.FC<{ onNew: () => void }> = ({ onNew }) => (
  <div className="ms-empty-terminal">
    <Icon name="terminal" size={32} color="var(--ms-text-faded)" />
    <span>No terminal sessions</span>
    <button onClick={onNew}>New Terminal</button>
  </div>
);