// src/ui/layouts/MainLayout/components/SideBar/Sidebar.tsx
//
// Panel rendering priority:
//   1. sidebarRegistry has a panel for activePanel  → SidebarEngine
//   2. ActivityBarItem has content          → render it directly
//   3. ActivityBarItem exists but no component       → DefaultPanelFallback
//   4. Nothing matches                               → null

import React, { useEffect, useCallback , useSyncExternalStore } from 'react';
import { motion, useAnimation }   from 'framer-motion';
import { useBackButtonStore }     from '@/store/backButtonStore';
import { useSidebarStore }        from "@/store/sidebarStore";
import { useActivityBarStore }    from '@/store/activityBarStore';
import { sidebarRegistry }        from '@/core/extensionAPI/registry/sidebarRegistry';
import { SidebarEngine }          from '@/ui/components/SidebarEngine/SidebarEngine';
import { ActivityBar }            from '../ActivityBar/ActivityBar';

// ─── Fallback ─────────────────────────────────────────────────────────────────

const DefaultPanelFallback: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    flex:           1,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'column',
    gap:            '12px',
    color:          'var(--ms-text-faded)',
    fontSize:       '13px',
    padding:        '24px',
    textAlign:      'center',
  }}>
    <span style={{ fontSize: '32px', opacity: 0.3 }}>☰</span>
    <span>{label}</span>
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  dragControls?: any;
  isLargeScreen?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({ dragControls, isLargeScreen }) => {
  const { 
    state: sidebarState, 
    setState: setSidebarState, 
    lastActiveState, 
    activePanel, 
    setWidth: setPanelWidth, 
    width: panelWidth 
  } = useSidebarStore();
 
  const { topItems, bottomItems } = useActivityBarStore();

  // Stable references for useSyncExternalStore
  const subscribe = useCallback((cb: () => void) => sidebarRegistry.subscribe(cb), []);
  const getSnapshot = useCallback(() => sidebarRegistry.getPanel(activePanel), [activePanel]);
  
  const registryPanel = useSyncExternalStore(subscribe, getSnapshot);

  const controls    = useAnimation();
  const COLLAPSED_W = 44;
  const SIDEBAR_W   = 44 + (panelWidth || 270);

  // ── Active item from ActivityBar ───────────────────────────────────────────
  const allItems   = [...topItems, ...bottomItems];
  const activeItem = allItems.find(i => i.id === activePanel && i.openSidebarContent);

  // ── Animation ──────────────────────────────────────────────────────────────
  const snapTo = (x: number, width: number) =>
    controls.start({ x, width, transition: { type: 'spring', damping: 25, stiffness: 400, mass: 0.5 } });

  useEffect(() => {
    const w = lastActiveState === 'expanded' ? SIDEBAR_W : COLLAPSED_W;
    if      (sidebarState === 'hidden')    snapTo(-w, w);
    else if (sidebarState === 'collapsed') snapTo(0, COLLAPSED_W);
    else if (sidebarState === 'expanded')  snapTo(0, SIDEBAR_W);
  }, [sidebarState, panelWidth, lastActiveState, SIDEBAR_W]);

  // ── Back-button (mobile) ───────────────────────────────────────────────────
  useEffect(() => {
    if (sidebarState === 'expanded' && !isLargeScreen) {
      const id = 'sidebar-close-handler';
      useBackButtonStore.getState().push(id, () => { setSidebarState('hidden'); return true; });
      return () => useBackButtonStore.getState().remove(id);
    }
  }, [sidebarState, isLargeScreen, setSidebarState]);

  // ── Swipe to close ────────────────────────────────────────────────────────
  const handleDragEnd = (_e: any, info: any) => {
    const w = lastActiveState === 'expanded' ? SIDEBAR_W : COLLAPSED_W;
    if (info.velocity.x < -500 || info.offset.x < -w / 2) {
      setSidebarState('hidden');
      snapTo(-w, w);
    } else {
      setSidebarState(lastActiveState);
      snapTo(0, w);
    }
  };

  // ── Resize handle ─────────────────────────────────────────────────────────
  const handleResizeDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX     = e.clientX;
    const startWidth = panelWidth || 270;
    const onMove = (ev: PointerEvent) =>
      setPanelWidth(Math.max(180, Math.min(600, startWidth + ev.clientX - startX)));
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.cursor = 'default';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    document.body.style.cursor = 'col-resize';
  };

  // ── Panel resolver ────────────────────────────────────────────────────────
  const renderPanel = () => {
    // 1. Registry panel takes priority (SidebarEngine renders it automatically)
    if (registryPanel) {
      return <SidebarEngine panelDef={registryPanel} />;
    }

    // 2. Direct component from ActivityBar item
    if (activeItem?.content) {
      const Component = activeItem.content;
      return <Component />;
    }

    // 3. Item exists but no content
    if (activeItem) {
      return <DefaultPanelFallback label={activeItem.label} />;
    }

    return null;
  };

  return (
    <motion.aside
      animate={controls}
      initial={{ x: 0, width: COLLAPSED_W }}
      drag={!isLargeScreen ? 'x' : false}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ left: -(lastActiveState === 'expanded' ? SIDEBAR_W : COLLAPSED_W), right: 0 }}
      dragElastic={0.05}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{
        position:  'absolute', top: 0, left: 0, bottom: 0, zIndex: 100001,
        display:   'flex', backgroundColor: 'var(--ms-bg-side)',
        touchAction: 'pan-y', overflow: 'hidden',
      }}
    >
      {/* Activity Bar */}
      <div style={{
        width: '44px', minWidth: '44px', flexShrink: 0,
        height: '100%', zIndex: 2, backgroundColor: 'var(--ms-bg-activity)',
      }}>
        <ActivityBar />
      </div>

      {/* Panel */}
      <div className="sidebar-panel" style={{
        width: `${panelWidth || 270}px`, minWidth: `${panelWidth || 270}px`,
        flexShrink: 0, height: '100%', position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Resize handle */}
        {isLargeScreen && sidebarState === 'expanded' && (
          <div
            onPointerDown={handleResizeDown}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--ms-accent)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            style={{
              position: 'absolute', right: -2, top: 0, bottom: 0,
              width: '4px', cursor: 'col-resize', zIndex: 10,
              backgroundColor: 'transparent', transition: 'background-color 0.2s',
            }}
          />
        )}

        {/* Dynamic panel content */}
        <div className="sidebar-content" style={{
          display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden',
        }}>
          {renderPanel()}
        </div>
      </div>
    </motion.aside>
  );
};