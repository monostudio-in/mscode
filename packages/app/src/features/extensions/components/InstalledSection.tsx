// src/features/extensions/components/InstalledSection.tsx

import React from 'react';
import { useExtensionStore } from '../store/extensionStore';
import { getSections } from '../store/selectors';
import { ExtensionCard } from './ExtensionCard';
import { useTabStore } from '@/store/tabStore';
import { Icon } from '@/ui/components/Icon/IconRegistry';

export const InstalledSection: React.FC = () => {
  const store = useExtensionStore();
  const { addTab } = useTabStore();
  const { installed } = getSections(store.allExtensions, store.records, store.filter);

  const handleOpenDetail = (id: string) => {
    const ext = store.allExtensions.find(e => e.id === id);
    if (ext) addTab({ id: 'ms-ext-detail', type: 'extension' as any, title: ext.name, filePath: id, icon: 'extensions' });
  };

  const cardActions = { 
    onInstall: store.install, onUninstall: store.uninstall, onEnable: store.enable, 
    onDisable: store.disable, onUpdate: store.updateExtension, onOpenDetail: handleOpenDetail 
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
       {store.isLoading && installed.length === 0 && (
        <div style={{ padding: 10, color: 'var(--ms-text-faded)', fontSize: 12 }}>Loading local extensions...</div>
       )}
       {store.error && (
         <div className="ms-ext-status ms-ext-status--error">
          <Icon name="warning" size={14} /><span>{store.error}</span>
          <span className="ms-ext-retry" onClick={() => store.fetchMarketplace(0, true)}>Retry</span>
        </div>
      )}
      {installed.length === 0 && !store.isLoading ? (
        <div className="ms-ext-empty">No installed extensions.</div>
      ) : (
        installed.map(ext => (
          <ExtensionCard key={ext.id} ext={ext} record={store.records[ext.id]} hasUpdate={!!store.updatesAvailable[ext.id]} {...cardActions} />
        ))
      )}
    </div>
  );
};
