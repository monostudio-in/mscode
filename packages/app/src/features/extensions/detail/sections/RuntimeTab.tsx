// src/features/extensions/detail/sections/RuntimeTab.tsx
import React from 'react';
import { useExtensionStore } from '../../store/extensionStore';
import type { Extension } from '../../types';

export const RuntimeTab: React.FC<{ manifest: Extension }> = ({ manifest }) => {
  const { records } = useExtensionStore();
  const record = records[manifest.id];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '13px' }}>
      <strong style={{ color: 'var(--ms-text-faded)' }}>Status</strong>
      <span style={{ color: record?.state === 'installed-enabled' ? '#8bc34a' : 'inherit' }}>
        {record?.state === 'installed-enabled' ? '● Active' : record?.state === 'installed-disabled' ? '○ Disabled' : '— Not Installed'}
      </span>
      
      <strong style={{ color: 'var(--ms-text-faded)' }}>Activates On</strong>
      <span>{manifest.activates?.join(', ') || '—'}</span>
      
      <strong style={{ color: 'var(--ms-text-faded)' }}>Installed At</strong>
      <span>{record ? new Date(record.installedAt).toLocaleString() : '—'}</span>
      
      <strong style={{ color: 'var(--ms-text-faded)' }}>Path</strong>
      <code>{record ? `/local/extensions/installed/${manifest.id}/` : '—'}</code>
    </div>
  );
};