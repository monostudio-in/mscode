// src/features/git/components/GitEmptyState.tsx

import React from 'react';
import { Icon }   from '@/ui/components/Icon/IconRegistry';
import { Button } from '@/ui/components/Button/Button';
import { useGitStore } from '../store/gitStore';

export const GitEmptyState: React.FC = () => {
  const { initRepo, cloneRepo } = useGitStore();

  return (
    <div style={{ 
      padding: '24px', 
      textAlign: 'center', 
      color: 'var(--ms-text-faded)', 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Icon name="git-branch" size={56} style={{ opacity: 0.15, marginBottom: '20px' }} />
      <p style={{ fontSize: '13px', marginBottom: '24px', lineHeight: 1.5, color: 'var(--ms-text-bright)' }}>
        The current active workspace is not tracked by Git source control management.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '200px' }}>
        <Button variant="type1" fullWidth onClick={initRepo}>
          Initialize Repository
        </Button>
        <Button variant="type2" fullWidth onClick={cloneRepo}>
          Clone Repository
        </Button>
      </div>
    </div>
  );
};