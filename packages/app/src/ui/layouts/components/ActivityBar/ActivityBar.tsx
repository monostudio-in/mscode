// src/ui/layouts/MainLayout/components/ActivityBar/ActivityBar.tsx

import React, { useEffect } from 'react';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { useSidebarStore }   from "@/store/sidebarStore";

import { useActivityBarStore } from '@/store/activityBarStore';
import { useExtensionStore } from '@/features/extensions/store/extensionStore';
import type { ActivityBarItem } from '@/core/extensionAPI/registry/activityBarRegistry';
import { contextKeyService } from '@/core/keybindings/contextKeyService';
// import { useTabStore } from '@/store/tabStore';

// ─── Single Icon Button ───────────────────────────────────────────────────────

const ActivityIcon: React.FC<{
  item: ActivityBarItem;
  isActive: boolean;
  onPress: (
    item: ActivityBarItem,
    e: React.MouseEvent<HTMLDivElement>
  ) => void;
}> = ({ item, isActive, onPress }) => (
  <div
    className={`action-icon ${isActive ? 'active' : ''}`}
    title={item.label}
    onClick={(e) => {
      e.stopPropagation();
      onPress(item, e);
    }}
  >
    <Icon name={item.icon as any} />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ActivityBar: React.FC = () => {
  const {
    state: sidebarState,
    activePanel,
    toggleMenu,
    clickActivityIcon,
  } = useSidebarStore();
  
  const {
    topItems,
    bottomItems,
    refreshItems,
  } = useActivityBarStore();

  // const activeTabId = useTabStore(s => s.activeTabId);

  useEffect(() => {
    refreshItems();

    // One time extension bootstrap
    useExtensionStore.getState().initExtensions();
  }, [refreshItems]);

  const handlePress = (
    item: ActivityBarItem,
    _e: React.MouseEvent<HTMLDivElement>
  ) => {
    // Fire item's own action
    item.onClick?.();

    // Toggle sidebar panel if supported
    if (item.openSidebarContent) {
      clickActivityIcon(item.id);
    }
  };

  const isActive = (item: ActivityBarItem) =>
    item.openSidebarContent === true &&
    activePanel === item.id &&
    sidebarState === 'expanded';

  const visibleTopItems = topItems.filter(item => contextKeyService.evaluate(item.when));
  const visibleBottomItems = bottomItems.filter(item => contextKeyService.evaluate(item.when));

  return (
    <div
      className="activity-bar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
      }}
    >
      {/* Hamburger */}
      <div
        className="hamburger-menu"
        onClick={toggleMenu}
        style={{ flexShrink: 0 }}
      >
        <Icon name="menu" size={20} />
      </div>

      {/* TOP items */}
      <div
        className="activity-bar-middle"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        {visibleTopItems.map((item) => (
          <ActivityIcon
            key={item.id}
            item={item}
            isActive={isActive(item)}
            onPress={handlePress}
          />
        ))}
      </div>

      {/* BOTTOM items */}
      <div
        className="activity-bar-bottom"
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {visibleBottomItems.map((item) => (
          <ActivityIcon
            key={item.id}
            item={item}
            isActive={isActive(item)}
            onPress={handlePress}
          />
        ))}
      </div>
    </div>
  );
};