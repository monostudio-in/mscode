// src/features/explorer/components/FileTree/EmptyWorkspace.tsx

import React from 'react';
import { Button } from '@/ui/components/Button/Button';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';

export const EmptyWorkspace: React.FC = () => (
  <div style={{ padding: '20px', color: 'var(--ms-text-main)' }}>
    <p style={{ marginBottom: '15px', fontSize: '12px', color: 'var(--ms-text-faded)' }}>
      You have not yet opened a folder.
    </p>

    <Button 
      variant="type2" 
      fullWidth 
      onClick={() => commands.executeCommand('workbench.action.files.openFolder')} 
      style={{ marginBottom: '8px' }}
    >
      Open Folder
    </Button>

    <Button 
      variant="type1" 
      fullWidth 
      narrow 
      onClick={() => commands.executeCommand('workbench.action.openRecent')} 
      style={{ marginBottom: '20px' }}
    >
      Open Recent
    </Button>

    <div style={{
      padding: '10px 0',
      borderTop: '1px solid var(--ms-border-light)',
      marginTop: '10px',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--ms-text-faded)', marginBottom: '10px', lineHeight: '1.4' }}>
        Want to code from anywhere? Sync your workspace with the cloud.
      </p>
      
      <Button
        variant="type1" 
        fullWidth 
        radius="4px"
        onClick={() => commands.executeCommand('workbench.action.connectRemote')}
      >
        Connect to Cloud
      </Button>
    </div>
  </div>
);