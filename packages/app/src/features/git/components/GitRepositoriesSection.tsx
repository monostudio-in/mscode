// src/features/git/components/GitRepositoriesSection.tsx
//
// Content-only — sidebarRegistry owns the "REPOSITORIES" header + sort action.

import React, { useState, useEffect } from 'react';
import { Icon }        from '@/ui/components/Icon/IconRegistry';
import { sidebarRegistry } from '@/core/extensionAPI/registry/sidebarRegistry';
import { useGitStore } from '../store/gitStore';
import type { GitRepository } from '../store/gitStore';

// ─── Single repo row ──────────────────────────────────────────────────────────

const RepoItem: React.FC<{ repo: GitRepository }> = ({ repo }) => {
  const [hovered, setHovered] = useState(false);
  const { refresh, isLoading, openBranchPalette } = useGitStore();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={openBranchPalette}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '6px',
        padding:         '4px 8px 4px 16px',
        minHeight:       '28px',
        cursor:          'pointer',
        userSelect:      'none',
        backgroundColor: hovered ? 'var(--ms-menu-hover-bg)' : 'transparent',
      }}
    >
      <Icon name="repo" size={14} style={{ flexShrink: 0, opacity: 0.7 }} />

      <span style={{
        flex:         1,
        fontSize:     '13px',
        fontWeight:   500,
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        whiteSpace:   'nowrap',
        color:        'var(--ms-text-bright)',
      }}>
        {repo.name}
      </span>

      {/* Branch + ahead/behind */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '3px',
        flexShrink: 0,
        fontSize:   '11px',
        color:      'var(--ms-text-faded)',
      }}>
        <Icon name="git-branch" size={11} style={{ opacity: 0.7 }} />
        <span style={{ fontWeight: 500 }}>
          {repo.branch}
          {!repo.branch.includes('/') && '*'}
        </span>
        {repo.behind > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
            <Icon name="arrow-down" size={10} />{repo.behind}
          </span>
        )}
        {repo.ahead > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
            <Icon name="arrow-up" size={10} />{repo.ahead}
          </span>
        )}
      </div>

      {/* Refresh — visible on hover */}
      <span
        title="Refresh"
        onClick={e => { e.stopPropagation(); refresh(); }}
        style={{
          display:    'flex',
          alignItems: 'center',
          padding:    '2px',
          opacity:    hovered ? 1 : 0,
          transition: 'opacity 0.1s',
          color:      'var(--ms-text-faded)',
          animation:  isLoading ? 'spin 1s linear infinite' : 'none',
        }}
      >
        <Icon name="refresh" size={13} />
      </span>
    </div>
  );
};

// ─── Section content ──────────────────────────────────────────────────────────

export const GitRepositoriesSection: React.FC = () => {
  const { repositories, sortMode, setSortMode } = useGitStore();

  //  Sync sort actions with the menu so ticks update instantly inside SidebarEngine
  useEffect(() => {
    sidebarRegistry.updateSection('git', 'repositories', {
      actions: [
        {
          id: 'discovery',
          label: 'Sort by Discovery Time',
          checked: sortMode === 'discovery',
          onClick: () => setSortMode('discovery'),
        },
        {
          id: 'name',
          label: 'Sort by Name',
          checked: sortMode === 'name',
          onClick: () => setSortMode('name'),
        },
        {
          id: 'path',
          label: 'Sort by Path',
          checked: sortMode === 'path',
          onClick: () => setSortMode('path'),
        },
      ]
    });
  }, [sortMode, setSortMode]);

  const sorted = [...repositories].sort((a, b) => {
    if (sortMode === 'name') return a.name.localeCompare(b.name);
    if (sortMode === 'path') return a.path.localeCompare(b.path);
    return 0; // discovery
  });

  if (sorted.length === 0) {
    return (
      <div style={{ padding: '6px 16px', fontSize: '12px', color: 'var(--ms-text-faded)' }}>
        No repositories detected.
      </div>
    );
  }

  return (
    <>
      {sorted.map(repo => <RepoItem key={repo.id} repo={repo} />)}
    </>
  );
};
