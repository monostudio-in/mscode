// src/features/git/components/GitHistorySection.tsx

import React from 'react';
import { Icon }        from '@/ui/components/Icon/IconRegistry';
import { useGitStore } from '../store/gitStore';

export const GitHistorySection: React.FC = () => {
  const { recentCommits } = useGitStore();
  if (recentCommits.length === 0) return null;

  return (
      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
        {recentCommits.map(commit => (
          <div
            key={commit.hash}
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--ms-border-dark, #242424)',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ms-menu-hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title={`Full Hash: ${commit.hash}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="git-commit" size={12} style={{ flexShrink: 0, opacity: 0.5, color: 'var(--ms-accent)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12.5px', color: 'var(--ms-text-bright)' }}>
                {commit.message}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingLeft: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', color: 'var(--ms-accent)', fontFamily: 'monospace', fontWeight: 600 }}>{commit.shortHash}</span>
              <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)' }}>{commit.author}</span>
              <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)', opacity: 0.7 }}>{commit.date}</span>
            </div>
          </div>
        ))}
      </div>
  );
};