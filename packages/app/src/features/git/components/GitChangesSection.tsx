// src/features/git/components/GitChangesSection.tsx
//
// Content-only component — sidebarRegistry owns the "CHANGES" header + actions.
// This file renders: CommitBox → Staged subsection → Unstaged subsection → History

import React from 'react';
import { Collapsible }          from '@/ui/components/Collapsible/Collapsible';
import { Icon }                 from '@/ui/components/Icon/IconRegistry';
import { useNotificationStore } from '@/store/notificationStore';
import { useGitStore }          from '../store/gitStore';
import { CommitBox }            from './CommitBox';
import { ChangedFileItem }      from './ChangedFileItem';
import { GitBackend }           from '../core/GitBackend';
import { getCwd }               from '../store/_helpers';
import { useTabStore }          from '@/store/tabStore';
import type { GitChangedFile }  from '../store/gitStore';

// ─── VS Code–style diff open ──────────────────────────────────────────────────

export const openGitDiff = async (file: GitChangedFile, isStaged: boolean) => {
  const cwd = getCwd();
  if (!cwd) return;

  const originalContent = await GitBackend.getFileContent(
    cwd,
    isStaged ? 'HEAD' : 'INDEX',
    file.path,
  );
  const modifiedContent = isStaged
    ? await GitBackend.getFileContent(cwd, 'INDEX', file.path)
    : null; // null = read from disk (editable)

  useTabStore.getState().addTab({
    id:       `diff-${isStaged ? 'staged' : 'unstaged'}-${file.path}`,
    type:     'diff' as any,
    title:    `${file.name} (${isStaged ? 'Index' : 'Working Tree'})`,
    icon:     'git-compare',
    filePath: file.path,
    diffData: { originalContent, modifiedContent, readOnly: isStaged, filePath: file.path },
  } as any);
};

// ─── Staged subsection ────────────────────────────────────────────────────────

const StagedSection: React.FC = () => {
  const { stagedFiles, unstageFile, unstageAll } = useGitStore();
  if (stagedFiles.length === 0) return null;

  return (
    <Collapsible
      title={
        <span style={{ fontSize: '11px', fontWeight: 600 }}>
          Staged Changes&nbsp;
          <span style={{
            background: 'var(--ms-bg-activity)', borderRadius: '10px',
            padding: '0 5px', fontSize: '10px', color: 'var(--ms-text-faded)',
          }}>
            {stagedFiles.length}
          </span>
        </span>
      }
      defaultExpanded={true}
      showGuideLine={true}
      rightActions={
        <span
          onClick={e => { e.stopPropagation(); unstageAll(); }}
          title="Unstage All"
          style={{ display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', color: 'var(--ms-text-faded)' }}
        >
          <Icon name="remove" size={13} />
        </span>
      }
    >
      {stagedFiles.map(f => (
        <ChangedFileItem
          key={f.path}
          file={f}
          actionIcon="remove"
          actionTitle="Unstage"
          onAction={unstageFile}
          onClick={() => openGitDiff(f, true)}
        />
      ))}
    </Collapsible>
  );
};

// ─── Unstaged subsection ──────────────────────────────────────────────────────

const UnstagedSection: React.FC = () => {
  const { unstagedFiles, stageFile, stageAll, discardFile } = useGitStore();
  if (unstagedFiles.length === 0) return null;

  const handleDiscardAll = () => {
    const notif = useNotificationStore.getState();
    let nid = '';
    nid = notif.addNotification({
      type: 'confirmation', title: 'Discard All Changes', source: 'Git',
      message: 'Discard ALL unstaged changes? This cannot be undone.',
      actions: [
        {
          label: 'Discard All', variant: 'type1',
          customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' },
          onClick: async () => {
            notif.removeNotification(nid);
            unstagedFiles.forEach(f => discardFile(f.path));
          },
        },
        { label: 'Cancel', onClick: () => notif.removeNotification(nid) },
      ],
    });
  };

  return (
    <Collapsible
      title={
        <span style={{ fontSize: '11px', fontWeight: 600 }}>
          Changes&nbsp;
          <span style={{
            background: 'var(--ms-bg-activity)', borderRadius: '10px',
            padding: '0 5px', fontSize: '10px', color: 'var(--ms-text-faded)',
          }}>
            {unstagedFiles.length}
          </span>
        </span>
      }
      defaultExpanded={true}
      showGuideLine={true}
      rightActions={
        <div style={{ display: 'flex', gap: '2px' }}>
          <span
            onClick={e => { e.stopPropagation(); handleDiscardAll(); }}
            title="Discard All"
            style={{ display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', color: 'var(--ms-text-faded)' }}
          >
            <Icon name="discard" size={13} />
          </span>
          <span
            onClick={e => { e.stopPropagation(); stageAll(); }}
            title="Stage All"
            style={{ display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', color: 'var(--ms-text-faded)' }}
          >
            <Icon name="add" size={13} />
          </span>
        </div>
      }
    >
      {unstagedFiles.map(f => (
        <ChangedFileItem
          key={f.path}
          file={f}
          actionIcon="add"
          actionTitle="Stage"
          onAction={stageFile}
          action2Icon="discard"
          action2Title="Discard Changes"
          onAction2={discardFile}
          onClick={() => openGitDiff(f, false)}
        />
      ))}
    </Collapsible>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
// No outer Collapsible — sidebarRegistry wraps this in the "CHANGES" section header.

export const GitChangesSection: React.FC = () => (
  <>
    <CommitBox />
    <StagedSection />
    <UnstagedSection />
  </>
);