// src/ui/layouts/MainLayout/MainLayout.tsx
import React, { useEffect, useState } from 'react';
import { fs } from '@/core/fileSystem';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useTabStore } from '@/store/tabStore';
import { useSidebarStore }        from "@/store/sidebarStore";
import { useMenuStore } from '@/store/menuStore';
import { usePaletteStore } from '@/store/paletteStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore'; 
import { StartPage } from './components/StartPage/StartPage';

import { Sidebar } from './components/SideBar/Sidebar';
import { TopBar } from './components/TopBar/TopBar';

import { Breadcrumbs } from '@/features/editor/components/BreadCrumb/Breadcrumbs';
import { ContextMenu } from '@/ui/components/ContextMenu';
import { CommandPalette } from '@/ui/components/CommandPalette';
import { NotificationUI } from '@/ui/components/Notification/NotificationUI';
import { QuickKeyboardBar } from '@/ui/components/QuickKeyboard/QuickKeyboardBar';
import { StatusBar } from '@/features/statusbar/StatusBar';
import { tabRegistry } from '@/core/extensionAPI/registry/tabRegistry'; 

import './MainLayout.css';

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { tabs, activeTabId, addTab, recentTabIds } = useTabStore();
  const { state: sidebarState, setState: setSidebarState, width: panelWidth } = useSidebarStore();
  
  const { isOpen, position, items, closeMenu } = useMenuStore();
  const { openPalette, openQuickPick } = usePaletteStore();
  const { workspacePath } = useExplorerStore();
  const { settings } = useSettingsStore();

  const currentTheme = settings['workbench.theme'] || 'dracula';
  const maxCachedTabs = settings['workbench.editor.maxCachedTabs'] ?? 10;
  const clickOutsideAction = settings['workbench.sidebar.clickOutsideAction'] || 'collapse';
  const mountedTabIds = new Set(recentTabIds.slice(0, maxCachedTabs));

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024 || window.innerHeight < window.innerWidth);
  
  // Framer Motion drag controllers
  const dragControls = useDragControls();
  const SIDEBAR_WIDTH = 44 + (panelWidth || 260); // Dynamic calculation based on current state variables

  const handleEditorClick = () => {
    if (sidebarState === 'expanded') {
      if (clickOutsideAction === 'hide') setSidebarState('hidden');
      else if (clickOutsideAction === 'collapse') setSidebarState('collapsed');
    }
  };

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 1024 || (window.innerWidth > window.innerHeight));
    window.addEventListener('resize', handleResize);
    document.body.setAttribute('data-theme', currentTheme);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTheme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault(); openPalette('>'); 
      } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        const searchPath = workspacePath || '/';
        const files = await fs.readDir(searchPath);
        const fileItems = files.filter(f => !f.isDirectory).map(file => ({
          id: file.path, label: file.name, description: file.path, leftIcon: 'files' as const,
          onSelect: () => addTab({ id: file.path, type: 'code', title: file.name, filePath: file.path })
        }));
        openQuickPick(`Search files in ${workspacePath ? workspacePath.split('/').pop() : 'Root'}...`, fileItems, (selected: any) => { if (selected.onSelect) selected.onSelect(); });
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [openPalette, openQuickPick, addTab, workspacePath]);

  return (
    <div className="ms-master-container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
      
      {sidebarState === 'hidden' && (
        <div 
          style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '15px', zIndex: 100000, background: 'transparent' }}
          onTouchStart={() => setSidebarState('expanded')} 
        />
      )}

      {/* OVERLAY DRAGGER: Sliding sidebar interactions via pointer events forwarded over the content overlay */}
      <AnimatePresence>
        {sidebarState === 'expanded' && !isLargeScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'transparent', zIndex: 100000, touchAction: 'none' }}
            onPointerDown={(e) => dragControls.start(e)} // Routes event handlers directly to the sidebar instance
            onClick={handleEditorClick} 
          />
        )}
      </AnimatePresence>

      <div className="ms-editor-layout" onClick={closeMenu} style={{ position: 'relative' }}>
        
        {/* Pass drag configurations through to the Sidebar sub-tree component */}
        <Sidebar dragControls={dragControls} isLargeScreen={isLargeScreen} />

        <motion.div
          initial={false}
          animate={{ 
            width: sidebarState === 'hidden' ? 0 : (sidebarState === 'collapsed' ? 44 : (isLargeScreen ? SIDEBAR_WIDTH : 0)) 
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.5 }}
          style={{ flexShrink: 0, height: '100%' }}
        />

        <div className="content-area" style={{ position: 'relative', zIndex: 1 }} onClick={handleEditorClick}>
          <TopBar />
          <Breadcrumbs />
          <article className="editor-view">
            {tabs.length > 0 ? (
              tabs.map(tab => {
                if (!mountedTabIds.has(tab.id)) return null;
                return (
                  <div key={tab.id} style={{ display: activeTabId === tab.id ? 'block' : 'none', height: '100%', width: '100%' }}>
                    
                    
                    {/* Routing logic for tabs */}
                    {(() => {
                      // LAYER 1: Direct Content Injection (Legacy support)
                      if ((tab as any).content) {
                        return (tab as any).content;
                      }

                      // LAYER 2: Extension API & Core Registry (The Standard Way)
                      const RegisteredCustomView = tabRegistry.getTab(tab.type);
                      if (RegisteredCustomView) {
                        // Pass down standard props that any view might need
                        return (
                           <RegisteredCustomView 
                             tabId={tab.id} 
                             filePath={tab.filePath || tab.id} 
                             tab={tab}
                             extensionId={tab.filePath} // Optional fallback for extension view
                             mode={tab.type === 'termis' ? 'fullscreen' : undefined} // Optional parameter mapping
                           />
                        );
                      }

                      // LAYER 3: Ultimate Fallback if view isn't registered
                      return (
                        <div style={{ padding: '20px', color: 'var(--ms-text-faded)' }}>
                          ⚠️ No view registered for tab type: <b>{tab.type}</b>
                        </div>
                      );
                    })()}

                  </div>
                );
              })
            ) : (
              <StartPage />
            )}
            {children}
          </article>
          <QuickKeyboardBar />
        </div>
      </div>
      
      <NotificationUI />

      <StatusBar />
      {isOpen && <ContextMenu items={items} style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 999999 }} />}
      <CommandPalette />
    </div>
  );
};