import React from 'react';
import type { ChangelogEntry } from '../../types';

export const ChangelogTab: React.FC<{ changelog: ChangelogEntry[] }> = ({ changelog }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    {changelog.map(entry => (
      <div key={entry.version}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, color: 'var(--ms-text-bright)' }}>v{entry.version}</h3>
          <span style={{ fontSize: '12px', color: 'var(--ms-text-faded)' }}>{entry.date}</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          {entry.changes.map((change, i) => <li key={i}>{change}</li>)}
        </ul>
      </div>
    ))}
  </div>
);