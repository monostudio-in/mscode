// src/features/extensions/detail/sections/HeroSection.tsx
import React from 'react';
import { Button } from '@/ui/components/Button/Button';
import { Icon }   from '@/ui/components/Icon/IconRegistry';
import { useExtensionStore } from '../../store/extensionStore';
import type { Extension }    from '../../types';
import { ExtensionIcon } from '../../components/ExtensionIcon';

interface HeroSectionProps {
  manifest: Extension;
}

// Helper to format downloads (e.g. 125000000 -> 125M)
const formatDownloads = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
};

export const HeroSection: React.FC<HeroSectionProps> = ({ manifest }) => {
  const { records, install, uninstall, enable, disable } = useExtensionStore();
  const record = records[manifest.id];
  const state  = record?.state ?? 'not-installed';

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
      
      {/* ── Icon (Powered by ExtensionIcon) ── */}
      <div style={{ 
        flexShrink: 0, 
        borderRadius: '12px', 
        overflow: 'hidden',
        width: '80px',
        height: '80px'
      }}>
        <ExtensionIcon 
          icon={manifest.icon} 
          storeDir={manifest.storeDir} 
          name={manifest.name} 
          iconColor={manifest.iconColor} 
          iconLetter={manifest.iconLetter}
          size={80}
        />
      </div>

      {/* ── Info ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', color: 'var(--ms-text-bright)' }}>{manifest.name}</h1>
          {manifest.isVerified && <Icon name="check" size={14} color="var(--ms-accent)" title="Verified Publisher" />}
          {manifest.isBuiltIn && <span style={{ fontSize: '10px', background: 'var(--ms-bg-activity)', padding: '2px 6px', borderRadius: '4px' }}>Built-in</span>}
        </div>
        
        <div style={{ fontSize: '12px', color: 'var(--ms-text-faded)', margin: '4px 0 8px 0' }}>{manifest.id}</div>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--ms-text-main)' }}>
          <span>{manifest.publisher}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Icon name="cloud-download" size={12} /> {formatDownloads(manifest.downloads)}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ color: '#e5c07b' }}>{'★'.repeat(Math.round(manifest.rating))} <span style={{ color: 'var(--ms-text-main)' }}>{manifest.rating.toFixed(1)}</span></span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>v{manifest.version}</span>
        </div>

        <p style={{ margin: '12px 0', fontSize: '13px', lineHeight: '1.4' }}>{manifest.description}</p>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          {state === 'not-installed' && (
            <Button variant="type1" onClick={() => install(manifest.id)}>Install</Button>
          )}
          {state === 'installed-enabled' && !manifest.isBuiltIn && (
            <>
              <Button variant="type2" onClick={() => disable(manifest.id)}>Disable</Button>
              <Button variant="type2" onClick={() => uninstall(manifest.id)} customStyle={{ color: '#ff4d4d' }}>Uninstall</Button>
            </>
          )}
          {state === 'installed-enabled' && manifest.isBuiltIn && (
            <span style={{ fontSize: '12px', color: 'var(--ms-text-faded)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="info" size={12} /> Built-in extension cannot be removed
            </span>
          )}
          {state === 'installed-disabled' && (
            <>
              <Button variant="type1" onClick={() => enable(manifest.id)}>Enable</Button>
              {!manifest.isBuiltIn && <Button variant="type2" onClick={() => uninstall(manifest.id)} customStyle={{ color: '#ff4d4d' }}>Uninstall</Button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};