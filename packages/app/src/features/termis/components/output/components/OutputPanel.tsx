// src/features/termis/components/output/components/OutputPanel.tsx

import React, { useRef, useState } from 'react';
import { useOutputStore }  from '../store/outputStore';
import { useOutputEditor } from '../hooks/useOutputEditor';
import { Icon }            from '@/ui/components/Icon/IconRegistry';
import { Select }          from '@/ui/components/Select/Select';
import { InputBox }        from '@/ui/components/InputBox/InputBox';
import { useMenuStore }    from '@/store/menuStore';
import './OutputPanel.css';

export const OutputPanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useOutputEditor(containerRef);

  const {
    channels, activeChannel,
    setActiveChannel, clearChannel,
    killHandlers, triggerKill,
    saveLog, openInEditor,
  } = useOutputStore();

  const { openMenu }    = useMenuStore();
  const [filter, setFilter] = useState('');

  const channelOptions = channels.map(ch => ({ value: ch, label: ch }));

  // ── ⋮ menu ────────────────────────────────────────────────────────────────
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    const items: any[] = [
      {
        id:    'open-editor',
        label: 'Open Log in Editor',
        icon:  'file-code',
        onClick: () => openInEditor(activeChannel),
      },
      {
        id:    'save-log',
        label: 'Save Output Logs',
        icon:  'save',
        onClick: () => saveLog(activeChannel),
      },
    ];

    if (killHandlers[activeChannel]) {
      items.push({ id: 'sep-kill', type: 'separator' });
      items.push({
        id:    'kill-process',
        label: 'Kill Process',
        icon:  'circle-slash',
        onClick: () => triggerKill(activeChannel),
      });
    }

    openMenu('output/context', rect.left - 150, rect.bottom + 8, items);
  };

  return (
    <div className="ms-output-panel">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="ms-output-toolbar">

        {/* Channel selector */}
        <div className="ms-output-toolbar-left">
          <Select
            options={channelOptions}
            value={activeChannel}
            onChange={setActiveChannel}
            style={{ width: 'auto' }}
          />
        </div>

        {/* Filter input */}
        <div className="ms-output-toolbar-middle">
          <InputBox
            value={filter}
            onChange={setFilter}
            placeholder="Filter logs..."
            leftInsideIcon={<Icon name="filter" size={13} color="var(--ms-text-faded)" />}
          />
        </div>

        {/* Action buttons */}
        <div className="ms-output-actions">
          <button title="Clear Output" onClick={() => clearChannel(activeChannel)}>
            <Icon name="clear-all" size={14} />
          </button>
          <button title="Save Output Logs" onClick={() => saveLog(activeChannel)}>
            <Icon name="save" size={14} />
          </button>
          <button title="More Actions..." onClick={handleMoreClick}>
            <Icon name="more" size={14} />
          </button>
        </div>
      </div>

      {/* ── Monaco editor ───────────────────────────────────────────────── */}
      <div className="ms-output-editor-container" ref={containerRef} />
    </div>
  );
};