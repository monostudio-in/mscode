// src/features/git/components/CommitBox.tsx

import React, { useRef, useEffect, useState } from 'react';
import { Icon }             from '@/ui/components/Icon/IconRegistry';
import { Button }           from '@/ui/components/Button/Button';
import { useGitStore }      from '../store/gitStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

export const CommitBox: React.FC = () => {
  const {
    commitMessage, setCommitMessage,
    stagedFiles, unstagedFiles, isLoading, hasUpstream,
    commit, commitAmend, commitAndPush, commitAndSync,
    publishBranch, isGitRepo, branches, pull, push
  } = useGitStore();

  const settings = useSettingsStore(s => s.settings);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isClean = stagedFiles.length === 0 && unstagedFiles.length === 0;
  
  // Get current branch sync status
  const currentBranch = branches.find(b => b.isCurrent);
  const ahead  = currentBranch?.ahead || 0;
  const behind = currentBranch?.behind || 0;

  // ── Settings: Input Validation ──
  const validationType = settings['git.inputValidation'] ?? 'warn'; // 'always' | 'warn' | 'off'
  const maxLength = settings['git.inputValidationLength'] ?? 72;
  const currentLength = commitMessage.length;
  const isOverLimit = currentLength > maxLength;
  const showValidation = validationType === 'always' || (validationType === 'warn' && isOverLimit);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '32px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [commitMessage]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) commit();
    }
  };

  const handleSync = async () => {
    if (behind > 0) await pull();
    if (ahead > 0)  await push();
  };

  if (!isGitRepo) return null;

  return (
    <div style={{ padding: '8px 10px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      
      {/* Textarea with Validation Counter */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <textarea
          ref={textareaRef}
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message (Ctrl+Enter to commit)"
          rows={1}
          style={{
            ...textareaStyle,
            borderColor: isOverLimit && validationType !== 'off' ? 'var(--ms-error)' : 'var(--ms-border-dark)'
          }}
          onFocus={e  => { e.target.style.borderColor = isOverLimit && validationType !== 'off' ? 'var(--ms-error)' : 'var(--ms-accent)'; }}
          onBlur={e   => { e.target.style.borderColor = isOverLimit && validationType !== 'off' ? 'var(--ms-error)' : 'var(--ms-border-dark)'; }}
        />
        
        {showValidation && (
          <span style={{
            position: 'absolute', bottom: '6px', right: '10px',
            fontSize: '10px', fontWeight: 600,
            color: isOverLimit ? 'var(--ms-error)' : 'var(--ms-text-faded)',
            pointerEvents: 'none', opacity: 0.8
          }}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      {isClean ? (
        // ── Clean State: Publish or Sync ──
        !hasUpstream ? (
          <Button fullWidth variant="type2" icon={<Icon name="cloud-upload" size={13}/>} onClick={publishBranch} disabled={isLoading}>
            Publish Branch
          </Button>
        ) : (ahead > 0 || behind > 0) ? (
          <Button fullWidth variant="type2" icon={<Icon name="sync" size={13}/>} onClick={handleSync} disabled={isLoading}>
            Sync Changes {behind > 0 ? `↓ ${behind}` : ''} {ahead > 0 ? `↑ ${ahead}` : ''}
          </Button>
        ) : null // Fully Synced: Show nothing! (VS Code behavior)
      ) : (
        // ── Dirty State: Commit Split Button ──
        <div style={{ position: 'relative' }}>
          <Button
            fullWidth
            variant="type2"
            disabled={isLoading}
            splits={[
              { 
                label: `Commit ${stagedFiles.length > 0 ? `(${stagedFiles.length})` : ''}`, 
                // Wrapped in arrow function to block MouseEvent
                onClick: () => commit() 
              },
              { 
                icon: <Icon name="chevron-down" size={12}/>, 
                onClick: (e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); },
                style: { padding: '6px 4px' }
              }
            ]}
            splitRatios={[6, 1]} 
          />

          {/* Dropdown Menu Overlay */}
          {dropdownOpen && (
            <div style={dropdownOverlayStyle}>
              {[
                // Wrapped all in arrow functions to block MouseEvent from mapping
                { label: 'Commit',           onClick: () => commit() },
                { label: 'Commit (Amend)',   onClick: () => commitAmend() },
                { label: 'Commit & Push',    onClick: () => commitAndPush() },
                { label: 'Commit & Sync',    onClick: () => commitAndSync() },
              ].map((opt, i) => (
                <button
                  key={i}
                  style={dropdownItemStyle}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ms-menu-hover-bg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  onClick={() => { setDropdownOpen(false); opt.onClick(); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const textareaStyle: React.CSSProperties = {
  width: '100%', resize: 'none', height: '32px', minHeight: '32px', maxHeight: '160px',
  overflowY: 'auto', background: 'var(--ms-bg-main)', border: '1px solid var(--ms-border-dark)',
  color: 'var(--ms-text-bright)', fontSize: '12px', fontFamily: 'inherit',
  padding: '6px 28px 6px 8px', outline: 'none', borderRadius: '2px', lineHeight: 1.5,
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};

const dropdownOverlayStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', right: 0, marginTop: '4px',
  background: 'var(--ms-bg-main)', border: '1px solid var(--ms-border-dark)',
  borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  zIndex: 100, minWidth: '150px', display: 'flex', flexDirection: 'column', padding: '4px'
};

const dropdownItemStyle: React.CSSProperties = {
  background: 'transparent', color: 'var(--ms-text-main)', border: 'none', outline: 'none',
  padding: '6px 10px', fontSize: '12px', textAlign: 'left', cursor: 'pointer', borderRadius: '2px',
  transition: 'background 0.1s'
};