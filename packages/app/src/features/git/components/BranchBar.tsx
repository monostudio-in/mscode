// src/features/git/components/BranchBar.tsx

import React, { useState } from 'react';
import { Icon }    from '@/ui/components/Icon/IconRegistry';
import { Collapsible } from '@/ui/components/Collapsible/Collapsible';
import type { GitBranch } from '../store/gitStore';
import { useGitStore } from '../store/gitStore';
// ─── Props ────────────────────────────────────────────────────────────────────

interface BranchBarProps {
  currentBranch: string;
  branches:      GitBranch[];
  onCheckout:    (name: string) => void;
  onPull:        () => void;
  onPush:        () => void;
  isLoading?:    boolean;
}

// ─── Single branch row ────────────────────────────────────────────────────────

const BranchRow: React.FC<{
  branch:     GitBranch;
  onCheckout: (name: string) => void;
}> = ({ branch, onCheckout }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !branch.isCurrent && onCheckout(branch.name)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '6px',
        padding:         '3px 8px 3px 16px',
        minHeight:       '26px',
        cursor:          branch.isCurrent ? 'default' : 'pointer',
        backgroundColor: hovered && !branch.isCurrent ? 'var(--ms-menu-hover-bg)' : 'transparent',
        userSelect:      'none',
      }}
    >
      <Icon
        name={branch.isCurrent ? 'check' : 'arrow-right'}
        size={12}
        style={{ flexShrink: 0, opacity: branch.isCurrent ? 1 : 0 }}
      />

      <span style={{
        fontSize:     '13px',
        flex:          1,
        overflow:      'hidden',
        textOverflow:  'ellipsis',
        whiteSpace:    'nowrap',
        color:         branch.isCurrent ? 'var(--ms-text-bright)' : 'var(--ms-text-faded)',
        fontWeight:    branch.isCurrent ? 600 : 400,
      }}>
        {branch.name}
      </span>

      {/* Ahead / behind indicators */}
      {(branch.ahead > 0 || branch.behind > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {branch.behind > 0 && (
            <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Icon name="arrow-down" size={10} />
              {branch.behind}
            </span>
          )}
          {branch.ahead > 0 && (
            <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Icon name="arrow-up" size={10} />
              {branch.ahead}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const BranchBar: React.FC<BranchBarProps> = ({
  currentBranch, branches, onCheckout, onPull, onPush, isLoading,
}) => {
  const current = branches.find(b => b.isCurrent);
  const { checkoutViaPalette } = useGitStore();
  
  return (
    <Collapsible
      title={
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', width: '100%' }}
          onClick={(e) => {
            isLoading ? isLoading : isLoading ;
            e.stopPropagation();
            // ক্লিক করলেই VS Code এর মতো প্যালেট খুলবে!
            checkoutViaPalette(); 
          }}
        >
          {/* branch icon (codicon fallback) */}
          <Icon name="git-branch" size={13} style={{ flexShrink: 0, opacity: 0.8 }} />
          <span style={{
            flex:         1,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
            fontWeight:   600,
          }}>
            {currentBranch}
          </span>

          {/* Upstream ahead/behind pill */}
          {current && (current.ahead > 0 || current.behind > 0) && (
            <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)', flexShrink: 0 }}>
              {current.behind > 0 && `↓${current.behind} `}
              {current.ahead  > 0 && `↑${current.ahead}`}
            </span>
          )}
        </div>
      }
      defaultExpanded={false}
      showGuideLine={true}
      rightActions={
        <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
          <span
            title="Pull"
            onClick={onPull}
            style={{ display: 'flex', alignItems: 'center', padding: '2px 3px', cursor: 'pointer', color: 'var(--ms-text-faded)', borderRadius: '2px' }}
          >
            <Icon name="arrow-down" size={14} />
          </span>
          <span
            title="Push"
            onClick={onPush}
            style={{ display: 'flex', alignItems: 'center', padding: '2px 3px', cursor: 'pointer', color: 'var(--ms-text-faded)', borderRadius: '2px' }}
          >
            <Icon name="arrow-up" size={14} />
          </span>
        </div>
      }
    >
      {branches.map(b => (
        <BranchRow key={b.name} branch={b} onCheckout={onCheckout} />
      ))}
    </Collapsible>
  );
};