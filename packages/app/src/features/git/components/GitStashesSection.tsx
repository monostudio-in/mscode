// src/features/git/components/GitStashesSection.tsx

import React, { useState } from 'react';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { useNotificationStore } from '@/store/notificationStore';
import { useGitStore } from '../store/gitStore';
import { GitBackend } from '../core/GitBackend';
import { getCwd } from '../store/_helpers';

export const GitStashesSection: React.FC = () => {
  const stashes = useGitStore(s => s.stashes) || [];
  const refresh = useGitStore(s => s.refresh);

  // ─── Exact VS Code Operations ──────────────────────────────────────────────
  const handleAction = async (action: 'apply' | 'pop' | 'drop', index: number) => {
    const cwd = getCwd();
    if (!cwd) return;
    
    const notif = useNotificationStore.getState();
    
    // Drop Stash needs a warning confirmation
    if (action === 'drop') {
      let nid = notif.addNotification({
        type: 'confirmation', title: 'Drop Stash', source: 'Git',
        message: `Are you sure you want to drop stash@{${index}}? This cannot be undone.`,
        actions: [
          { 
            label: 'Drop', variant: 'type1', 
            customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' },
            onClick: async () => {
              notif.removeNotification(nid);
              try { 
                await GitBackend.stashDrop(cwd, index); 
                notif.addNotification({ type: 'success', title: 'Git', source: 'Git', message: `stash@{${index}} dropped.` });
                await refresh(); 
              } catch(e: any) {
                notif.addNotification({ type: 'error', title: 'Stash Error', source: 'Git', message: e?.message });
              }
            }
          },
          { label: 'Cancel', onClick: () => notif.removeNotification(nid) }
        ]
      });
      return;
    }

    // Apply or Pop (Direct execution)
    try {
      if (action === 'apply') await GitBackend.stashApply(cwd, index);
      if (action === 'pop') await GitBackend.stashPop(cwd, index);
      await refresh();
    } catch (e: any) {
      notif.addNotification({ type: 'error', title: 'Stash Error', source: 'Git', message: e?.message || 'Failed to execute stash action.' });
    }
  };

  if (stashes.length === 0) {
    return (
      <div style={{ padding: '10px 15px', color: 'var(--ms-text-faded)', fontSize: '11px', textAlign: 'center' }}>
        No stashes found.
      </div>
    );
  }

  return (
    <div className="ms-git-stashes-list" style={{ display: 'flex', flexDirection: 'column' }}>
      {stashes.map(stash => (
         <StashItem key={stash.index} stash={stash} onAction={handleAction} />
      ))}
    </div>
  );
};

// ─── Individual Stash Item (With VS Code Hover UX) ───────────────────────────
const StashItem: React.FC<{ stash: any, onAction: (a: 'apply' | 'pop' | 'drop', i: number) => void }> = ({ stash, onAction }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', padding: '4px 15px',
        cursor: 'pointer', fontSize: '12px', color: 'var(--ms-text-main)',
        backgroundColor: isHovered ? 'var(--ms-bg-hover)' : 'transparent',
        borderBottom: '1px solid transparent'
      }}
      title={stash.description}
    >
      <Icon name="archive" size={14} style={{ marginRight: '6px', color: 'var(--ms-text-faded)' }} />
      
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ color: 'var(--ms-text-faded)', marginRight: '4px' }}>stash@&#123;{stash.index}&#125;:</span>
        {stash.description}
      </span>
      
      {/* Reveal Actions on Hover */}
      {isHovered && (
        <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
          <span onClick={(e) => { e.stopPropagation(); onAction('apply', stash.index); }} title="Apply Stash" style={{ color: 'var(--ms-text-bright)' }}>
            <Icon name="check" size={14} />
          </span>
          <span onClick={(e) => { e.stopPropagation(); onAction('pop', stash.index); }} title="Pop Stash" style={{ color: 'var(--ms-text-bright)' }}>
            <Icon name="arrow-up" size={14} />
          </span>
          <span onClick={(e) => { e.stopPropagation(); onAction('drop', stash.index); }} title="Drop Stash" style={{ color: 'var(--ms-text-bright)' }}>
            <Icon name="trash" size={14} />
          </span>
        </div>
      )}
    </div>
  );
};