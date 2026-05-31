// src/features/extensions/detail/sections/ContributionsTab.tsx
import React from 'react';
import { Collapsible } from '@/ui/components/Collapsible/Collapsible';
import type { ExtensionContributions } from '../../types';

export const ContributionsTab: React.FC<{ contributions: ExtensionContributions }> = ({ contributions }) => {
  const { languages = [], commands = [], configuration } = contributions;
  
  const parsedLanguages = Array.isArray(languages) ? languages : [];
  const parsedCommands = Array.isArray(commands) ? commands : [];
  
  // Configuration Obj ->  Array
  const configKeys = configuration && typeof configuration === 'object' ? Object.entries(configuration) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* ── 1. Languages ── */}
      {parsedLanguages.length > 0 && (
        <Collapsible title={`Languages (${parsedLanguages.length})`} defaultExpanded showGuideLine>
          {parsedLanguages.map(lang => (
            <div key={lang.id} style={{ display: 'flex', padding: '6px 10px', fontSize: '13px' }}>
              <strong style={{ width: '120px' }}>{lang.id}</strong>
              <span style={{ color: 'var(--ms-text-faded)' }}>
                → {lang.extensions?.join(', ') || ''}
              </span>
            </div>
          ))}
        </Collapsible>
      )}
      
      {/* ── 2. Commands ── */}
      {parsedCommands.length > 0 && (
        <Collapsible title={`Commands (${parsedCommands.length})`} defaultExpanded showGuideLine>
          {parsedCommands.map(cmd => (
            <div key={cmd.id} style={{ padding: '6px 10px', fontSize: '13px' }}>
              <code>{cmd.id}</code> → "{cmd.title}"
            </div>
          ))}
        </Collapsible>
      )}

      {/* ── 3. Configuration (Settings) ── */}
      {configKeys.length > 0 && (
        <Collapsible title={`Settings (${configKeys.length})`} defaultExpanded showGuideLine>
          {configKeys.map(([key, setting]: [string, any]) => (
            <div key={key} style={{ padding: '10px', fontSize: '13px', borderBottom: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', color: '#4DAAFB' }}>{key}</div>
              <div style={{ color: '#ccc', marginTop: '4px' }}>{setting.description}</div>
              <div style={{ color: '#888', marginTop: '6px', fontSize: '11px' }}>
                Type: <code style={{ color: '#ce9178', padding: '2px 4px', background: '#1e1e1e', borderRadius: '3px' }}>{setting.type}</code> 
                &nbsp;|&nbsp; 
                Default: <code>{String(setting.default)}</code>
              </div>
            </div>
          ))}
        </Collapsible>
      )}

    </div>
  );
};