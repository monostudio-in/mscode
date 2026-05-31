// src/features/termis/components/tasks/TasksPanel.tsx
//
// ─── Tasks Panel ─────────────────────────────────────────────────────────────
//
// Reads live task records from taskManager and renders them as rows.
// Clicking a row's channel name switches to that Output Channel.
// Kill button terminates still-running tasks.

import React, { useEffect, useState } from 'react';
import { taskManager }    from '@/core/extensionAPI/tasks/taskManager';
import type { TaskRecord } from '@/core/extensionAPI/tasks/taskManager';
import { useOutputStore } from '../output/store/outputStore';
import { useTermisStore } from '../../store/termisStore';
import { Icon }           from '@/ui/components/Icon/IconRegistry';

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_META: Record<TaskRecord['status'], { label: string; color: string; icon: string }> = {
  running: { label: 'running', color: '#4fc1ff', icon: 'loading'       },
  done:    { label: 'done',    color: '#73c991', icon: 'check'          },
  failed:  { label: 'failed',  color: '#f44747', icon: 'error'          },
  killed:  { label: 'killed',  color: '#e2c08d', icon: 'circle-slash'  },
};

const StatusPill: React.FC<{ status: TaskRecord['status'] }> = ({ status }) => {
  const m = STATUS_META[status];
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '3px',
      fontSize:     '10px',
      fontWeight:   600,
      color:        m.color,
      background:   `${m.color}18`,
      border:       `1px solid ${m.color}40`,
      borderRadius: '10px',
      padding:      '1px 6px',
      flexShrink:   0,
    }}>
      <Icon name={m.icon as any} size={10} style={{ animation: status === 'running' ? 'spin 1.2s linear infinite' : 'none' }} />
      {m.label}
    </span>
  );
};

// ─── Single task row ──────────────────────────────────────────────────────────

const TaskRow: React.FC<{ task: TaskRecord }> = ({ task }) => {
  const [hovered, setHovered] = useState(false);
  const { setActiveChannel }  = useOutputStore();
  const { setActiveView }     = useTermisStore();

  const elapsed = ((Date.now() - task.startedAt) / 1000).toFixed(1);
  const canKill = task.status === 'running';

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.channel) return;
    setActiveChannel(task.channel);
    setActiveView('output');
  };

  const handleKill = (e: React.MouseEvent) => {
    e.stopPropagation();
    // taskManager.execute returns a kill fn per-task — we surface it via
    // the outputStore killHandler that GitBackend/tasksModule registers.
    const { killHandlers, triggerKill } = useOutputStore.getState();
    if (task.channel && killHandlers[task.channel]) {
      triggerKill(task.channel);
    }
  };

  // Trim command for display
  const displayCmd = task.command.length > 60
    ? task.command.slice(0, 58) + '…'
    : task.command;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '8px',
        padding:         '6px 12px',
        minHeight:       '34px',
        background:      hovered ? 'var(--ms-menu-hover-bg)' : 'transparent',
        borderBottom:    '1px solid var(--ms-border-dark)',
        userSelect:      'none',
        transition:      'background 0.12s',
      }}
    >
      {/* Status */}
      <StatusPill status={task.status} />

      {/* Command + cwd */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          fontSize:     '12px',
          color:        'var(--ms-text-bright)',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          fontFamily:   'monospace',
        }}>
          {displayCmd}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '1px' }}>
          {task.channel && (
            <span
              onClick={handleChannelClick}
              title={`Open "${task.channel}" in Output panel`}
              style={{
                fontSize:    '10px',
                color:       'var(--ms-accent)',
                cursor:      'pointer',
                textDecoration: hovered ? 'underline' : 'none',
              }}
            >
              {task.channel}
            </span>
          )}
          <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)' }}>
            {task.cwd.split('/').slice(-2).join('/')}
          </span>
          {task.exitCode !== undefined && (
            <span style={{ fontSize: '10px', color: STATUS_META[task.status].color }}>
              exit {task.exitCode}
            </span>
          )}
        </div>
      </div>

      {/* Elapsed time */}
      <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)', flexShrink: 0 }}>
        {elapsed}s
      </span>

      {/* Kill button */}
      {canKill && (
        <span
          onClick={handleKill}
          title="Kill Task"
          style={{
            display:    'flex',
            alignItems: 'center',
            padding:    '2px',
            opacity:    hovered ? 1 : 0,
            transition: 'opacity 0.1s',
            cursor:     'pointer',
            color:      '#f44747',
          }}
        >
          <Icon name="circle-slash" size={14} />
        </span>
      )}
    </div>
  );
};

// ─── Panel ────────────────────────────────────────────────────────────────────

export const TasksPanel: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);

  useEffect(() => {
    // Subscribe to live task updates from taskManager
    const unsub = taskManager.subscribe(setTasks);
    return unsub;
  }, []);

  const runningCount = tasks.filter(t => t.status === 'running').length;

  if (tasks.length === 0) {
    return (
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        color:          'var(--ms-text-faded)',
        fontSize:       '12px',
        gap:            '8px',
        padding:        '32px 16px',
      }}>
        <Icon name="checklist" size={32} style={{ opacity: 0.2 }} />
        <p style={{ margin: 0 }}>No tasks have run in this session.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '6px',
        padding:      '4px 12px',
        borderBottom: '1px solid var(--ms-border-dark)',
        fontSize:     '11px',
        color:        'var(--ms-text-faded)',
        flexShrink:   0,
      }}>
        <Icon name="list-tree" size={12} />
        <span>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          {runningCount > 0 && (
            <span style={{ color: '#4fc1ff', marginLeft: '6px' }}>
              ({runningCount} running)
            </span>
          )}
        </span>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Show most recent first */}
        {[...tasks].reverse().map(task => (
          <TaskRow key={task.sessionId} task={task} />
        ))}
      </div>
    </div>
  );
};