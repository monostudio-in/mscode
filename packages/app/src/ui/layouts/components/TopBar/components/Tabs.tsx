// src/ui/layouts/MainLayout/components/TopBar/Tabs.tsx
import React, { useState, useEffect } from 'react';
import { useTabStore } from '@/store/tabStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useDecorationStore } from '@/features/explorer/store/decorationStore';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { FileIcon } from '@/ui/components/FileIcon/DefaultIconTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from '@capacitor/keyboard';
import { useBackButtonStore } from '@/store/backButtonStore';

// Unified Action Button
const TabActionBtn: React.FC<{ isDirty: boolean; onClose: (e: React.MouseEvent) => void; }> = ({ isDirty, onClose }) => (
  <span className="tab-action-btn" onClick={onClose}>
    {isDirty ? <span className="tab-dirty-indicator" /> : <Icon name="close" size={14} />}
  </span>
);

// Decoration Badge for Git Status (M, U, etc.)
const DecorationBadge: React.FC<{ badge: string; color: string; tooltip?: string }> = ({ badge, color, tooltip }) => (
  <span
    title={tooltip}
    style={{
      fontSize: '10px',
      fontWeight: 700,
      color,
      marginLeft: '6px',
      marginRight: '2px',
      flexShrink: 0,
      lineHeight: 1,
    }}
  >
    {badge}
  </span>
);

export const Tabs: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore();
  const { viewStates } = useEditorViewStateStore();
  const { settings } = useSettingsStore();
  
  // Bring in git decorations
  const decorations = useDecorationStore(s => s.decorations);

  const closeOnClick = settings['workbench.editor.closeOverviewOnClick'] ?? true;
  const reappearMode = settings['workbench.editor.tabPopupReappearMode'] ?? false;
  const showTabsIcon = settings['workbench.editor.showTabsIcon'] ?? true;
  const showTabsIconOnPopup = settings['workbench.editor.showTabsIconOnPopup'] ?? true;

  const [showOverview, setShowOverview] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  // State to store random background styles
  const [dynamicBgStyle, setDynamicBgStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    if (showOverview) {
      const handlerId = 'tab-overview-close-handler';
      
      useBackButtonStore.getState().push(handlerId, () => {
        setShowOverview(false); // Closes the panel
        return true; // Returns true to prevent the app from exiting
      });

      // Cleanup
      return () => {
        useBackButtonStore.getState().remove(handlerId);
      };
    }
  }, [showOverview]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) return;
    let showSub: any;
    let hideSub: any;

    const initKeyboardListeners = async () => {
      try {
        showSub = await Keyboard.addListener('keyboardWillShow', () => setIsKeyboardOpen(true));
        hideSub = await Keyboard.addListener('keyboardWillHide', () => setIsKeyboardOpen(false));
      } catch (e) {
        console.warn("Capacitor Keyboard plugin not found.", e);
      }
    };
    initKeyboardListeners();

    return () => {
      if (showSub) showSub.remove();
      if (hideSub) hideSub.remove();
    };
  }, [isDesktop]);

  // Generates a new random background pattern whenever the overview panel is opened
  useEffect(() => {
    if (showOverview) {
      const generateRandomPattern = (): React.CSSProperties => {
        // Generates 5 to 9 random boxes to increase density on the right side
        const numShapes = Math.floor(Math.random() * 5) + 5; 
        const images: string[] = [];
        const sizes: string[] = [];
        const positions: string[] = [];

        for (let i = 0; i < numShapes; i++) {
          // Color selection distribution: 15% Green, 42.5% Light Blue, 42.5% Deep Blue-Black
          const colorChance = Math.random();
          
          let fill = 'none';
          let stroke = 'none';
          let strokeWidth = '1';

          if (colorChance < 0.15) {
            // Green Box: Highly transparent and filled with no border
            fill = 'rgba(144, 238, 144, 0.08)'; 
            stroke = 'none';
            strokeWidth = '0';
          } else if (colorChance < 0.575) {
            // Light Blue Box: Contains border and a light fill
            fill = 'rgba(173, 216, 230, 0.04)'; 
            stroke = 'rgba(173, 216, 230, 0.15)';
          } else {
            // Deep Blue-Black Box: Contains border and a light fill
            fill = 'rgba(10, 20, 40, 0.02)'; 
            stroke = 'rgba(10, 20, 40, 0.1)';
          }

          // Generate dynamic SVG
          const svgString = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='1' y='1' width='98' height='98' fill='${fill}' stroke='${stroke}' stroke-width='${strokeWidth}'/></svg>`;
          
          images.push(`url("data:image/svg+xml;utf8,${encodeURIComponent(svgString)}")`);
          
          // Random dimension determination: Square or Rectangle
          const isSquare = Math.random() > 0.5; 
          const width = Math.floor(Math.random() * 100) + 30; // Range: 30px to 130px
          const height = isSquare ? width : Math.floor(Math.random() * 100) + 30;
          sizes.push(`${width}px ${height}px`);

          // Restricts positions to the right side of the container
          // posX range is constrained between 65% and 100% (the rightmost 35% section)
          const posX = Math.floor(Math.random() * 35) + 65; 
          // posY ranges vertically anywhere from 0% to 100%
          const posY = Math.floor(Math.random() * 100); 
          
          positions.push(`${posX}% ${posY}%`);
        }

        return {
          backgroundImage: images.join(', '),
          backgroundSize: sizes.join(', '),
          backgroundPosition: positions.join(', '),
          backgroundRepeat: 'no-repeat',
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
        };
      };

      setDynamicBgStyle(generateRandomPattern());
    }
  }, [showOverview]);

  const handleDragEndTopBar = (_e: any, info: any) => {
    if (info.offset.y > 50 && tabs.length > 1) setShowOverview(true);
  };

  const handleDragEndOverlay = (_e: any, info: any) => {
    if (!isDesktop && info.offset.y < -50) setShowOverview(false);
  };

  const handleClose = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tabId);
    if (tabs.length <= 1) setShowOverview(false);
  };

  const isDirty = (id: string) => viewStates[id]?.isDirty ?? false;
  const shouldRenderPanel = showOverview && !(reappearMode && !isDesktop && isKeyboardOpen);

  return (
    <>
      <motion.div 
        className="tab-container"
        drag="y"
        style={{ visibility: showOverview ? 'hidden' : 'visible' }} 
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEndTopBar}
        title="Pull down to see all tabs"
      >
        {tabs.map((tab) => {
          const dirty = isDirty(tab.id);
          const decoration = tab.filePath ? decorations[tab.filePath] : null;
          
          return (
            <div 
              key={tab.id} 
              className={`tab ${activeTabId === tab.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(tab.id)}
              data-dirty={dirty ? "true" : "false"}
            >
              {showTabsIcon && (
                 tab.icon 
                   ? <Icon name={tab.icon as any} size={14} style={{ opacity: 0.8 }} /> 
                   : <FileIcon name={tab.title} isDir={false} />
              )}
              <span 
                className="tab-title" 
                style={{ 
                  fontStyle: dirty ? 'italic' : 'normal',
                  color: decoration ? decoration.color : undefined
                }}
              >
                {tab.title}
              </span>
              
              {decoration && (
                <DecorationBadge badge={decoration.badge} color={decoration.color} tooltip={decoration.tooltip} />
              )}
              
              <TabActionBtn isDirty={dirty} onClose={e => handleClose(tab.id, e)} />
            </div>
          );
        })}
      </motion.div>

      {showOverview && (
        <div className="tab-bar-overview-header" onClick={() => !isDesktop && setShowOverview(false)}>
          <span className="tab-bar-overview-title">OPEN EDITORS</span>
          <span className="tab-bar-overview-count">{tabs.length}</span>
          <span className="tab-bar-overview-close-btn" onClick={(e) => { e.stopPropagation(); setShowOverview(false); }}>
            <Icon name="close" size={16} />
          </span>
        </div>
      )}

      <AnimatePresence>
        {shouldRenderPanel && (
          <motion.div
            className="tab-overview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowOverview(false)}
            drag={isDesktop ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEndOverlay}
          >
            <motion.div 
              className="tab-overview-box"
              onClick={(e) => e.stopPropagation()} 
              initial={{ y: isDesktop ? 0 : -20, x: isDesktop ? 10 : 0, scaleY: isDesktop ? 1 : 0.95 }}
              animate={{ y: 0, x: 0, scaleY: 1 }}
              exit={{ y: isDesktop ? 0 : -20, x: isDesktop ? 10 : 0, scaleY: isDesktop ? 1 : 0.95 }}
              style={{ transformOrigin: isDesktop ? 'top right' : 'top center' }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            >
              {/* Dynamic background layer */}
              <div style={dynamicBgStyle} />

              <div className="tab-overview-list">
                {tabs.length === 0 && <div className="no-tabs">No open tabs</div>}
                
                {tabs.map(tab => {
                  const dirty = isDirty(tab.id);
                  const decoration = tab.filePath ? decorations[tab.filePath] : null;
                  
                  return (
                    <div 
                      key={tab.id} 
                      className={`tab ${activeTabId === tab.id ? 'active' : ''}`} 
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (closeOnClick) setShowOverview(false);
                      }}
                      data-dirty={dirty ? "true" : "false"}
                    >
                      {showTabsIconOnPopup && (
                         tab.icon 
                           ? <Icon name={tab.icon as any} size={14} style={{ opacity: 0.8 }} /> 
                           : <FileIcon name={tab.title} isDir={false} />
                      )}
                      
                      <span 
                        className="tab-title" 
                        style={{ 
                          fontStyle: dirty ? 'italic' : 'normal',
                          color: decoration ? decoration.color : undefined
                        }}
                      >
                        {tab.title}
                      </span>

                      {decoration && (
                        <DecorationBadge badge={decoration.badge} color={decoration.color} tooltip={decoration.tooltip} />
                      )}

                      <TabActionBtn isDirty={dirty} onClose={e => handleClose(tab.id, e)} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};