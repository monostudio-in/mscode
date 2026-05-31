
// src/features/extensions/components/MarketplaceSection.tsx

import React, { useEffect, useRef } from 'react';
import { useExtensionStore } from '../store/extensionStore';
import { getSections } from '../store/selectors';
import { ExtensionCard } from './ExtensionCard';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { useTabStore } from '@/store/tabStore';

export const MarketplaceSection: React.FC = () => {
  const store = useExtensionStore();
  const { addTab } = useTabStore();
  const { marketplace } = getSections(store.allExtensions, store.records, store.filter);
  
  // Ref for Observer
  const loaderRef = useRef<HTMLDivElement>(null);

  // ── 1. Intersection Observer for Bulletproof Infinite Scroll ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (store.hasMore && !store.isLoadingMore && !store.filter.query) { 
            store.fetchMarketplace(store.storePage + 1);
          }
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [store.hasMore, store.isLoadingMore, store.filter.query, store.storePage]);

  // ── 2. Fallback Manual Scroll (Fractional pixel fix) ──
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - Math.ceil(scrollTop) <= clientHeight + 150) {
      if (store.hasMore && !store.isLoadingMore && !store.filter.query) { 
        store.fetchMarketplace(store.storePage + 1);
      }
    }
  };

  const handleOpenDetail = (id: string) => {
    const ext = store.allExtensions.find(e => e.id === id);
    if (ext) addTab({ id: 'ms-ext-detail', type: 'extension' as any, title: ext.name, filePath: id, icon: 'extensions' });
  };

  const cardActions = { 
    onInstall: store.install, onUninstall: store.uninstall, onEnable: store.enable, 
    onDisable: store.disable, onUpdate: store.updateExtension, onOpenDetail: handleOpenDetail 
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: '20px' }} onScroll={handleScroll}>
      {marketplace.length === 0 ? (
        <div className="ms-ext-empty">No extensions found.</div>
      ) : (
        marketplace.map(ext => (
          <ExtensionCard key={ext.id} ext={ext} record={store.records[ext.id]} hasUpdate={!!store.updatesAvailable[ext.id]} {...cardActions} />
        ))
      )}
      
      {/* Invisible Div */}
      <div ref={loaderRef} style={{ height: '20px', width: '100%' }} />

      {/* ── Loading Indicator ── */}
      {store.isLoadingMore && (
        <div style={{ padding: '15px', textAlign: 'center', color: 'var(--ms-text-faded)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
           <Icon name="refresh" size={12} className="ms-ext-spin" /> Fetching more...
        </div>
      )}

      {/* ── Safety Fallback Button ── */}
      {!store.isLoadingMore && store.hasMore && !store.filter.query && marketplace.length >= 10 && (
         <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
            <button 
              onClick={() => store.fetchMarketplace(store.storePage + 1)}
              style={{ background: 'transparent', border: '1px solid var(--ms-border-color)', color: 'var(--ms-text-faded)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Load More Extensions
            </button>
         </div>
      )}
    </div>
  );
};