// src/ui/components/SidebarEngine/SidebarEngine.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { SidebarHeader }  from '@/ui/components/SidebarHeader/SidebarHeader';
import { Collapsible }    from '@/ui/components/Collapsible/Collapsible';
import { Resizer }        from '@/ui/components/Resizer/Resizer';
import { SidebarActions } from './SidebarActions';
import { sidebarMenuId, sidebarRegistry } from '@/core/extensionAPI/registry/sidebarRegistry';
import type { MenuItem } from '@/store/menuStore';
import type {
  SidebarPanelDef,
  SidebarSectionDef,
  SidebarSectionContent,
  SidebarSectionContext,
} from '@/core/extensionAPI/registry/sidebarRegistry';

function resolveContent(content: SidebarSectionContent, ctx: SidebarSectionContext): React.ReactNode {
  if (typeof content === 'function') {
    const Component = content as React.FC<SidebarSectionContext>;
    return <Component {...ctx} />;
  }
  return content as React.ReactNode;
}

export const SidebarEngine: React.FC<{ panelDef: SidebarPanelDef }> = ({ panelDef }) => {
  const headerMenuId = sidebarMenuId?.header 
    ? sidebarMenuId.header(panelDef.activityBarId) 
    : `sidebar/${panelDef.activityBarId}/header/actions`;

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [heightMap, setHeightMap] = useState<Record<string, number | 'auto'>>({});

  const isExpanded = useCallback((s: SidebarSectionDef) => {
    const isBlock = !s.title || s.title === '';
    if (isBlock) return true;
    return expandedMap[s.id] ?? s.defaultExpanded ?? true;
  }, [expandedMap]);

  const getHeight = useCallback((s: SidebarSectionDef) => {
    return heightMap[s.id] ?? s.defaultHeight ?? 150;
  }, [heightMap]);

  const handleToggle = useCallback((id: string, state: boolean) => {
    setExpandedMap(prev => ({ ...prev, [id]: state }));
  }, []);

  const visibleSections = useMemo(() => panelDef.sections.filter(s => !s.hidden), [panelDef.sections]);
  const expandedSections = useMemo(() => visibleSections.filter(s => isExpanded(s)), [visibleSections, isExpanded]);
  const lastExpandedId = expandedSections[expandedSections.length - 1]?.id;

  const handleResize = useCallback((resizerOwnerId: string, delta: number) => {
    const ownerIndex = expandedSections.findIndex(s => s.id === resizerOwnerId);
    if (ownerIndex > 0) {
      const targetSection = expandedSections[ownerIndex - 1]; 
      setHeightMap(prev => {
        const currentVal = prev[targetSection.id] ?? targetSection.defaultHeight ?? 150;
        const oldHeight = typeof currentVal === 'number' ? currentVal : 150;
        const newHeight = Math.max(targetSection.minHeight ?? 50, oldHeight + delta);
        return { ...prev, [targetSection.id]: newHeight };
      });
    }
  }, [expandedSections]);

  const enhanceActionsWithViews = useCallback((actions?: MenuItem[]): MenuItem[] => {
    if (!actions) return [];
    
    return actions.flatMap(action => {
      const newAction = { ...action };

      if (newAction.children) {
        newAction.children = enhanceActionsWithViews(newAction.children);
      }

      if (newAction.views) {
        const allGenerated: MenuItem[] = [];

        newAction.views.forEach((viewConfig: any) => {
          const overrides = viewConfig.children || [];
          const generatedItems: MenuItem[] = [];

          panelDef.sections.forEach(sec => {
            const isBlock = !sec.title || sec.title === '';
            if (isBlock) return; 
            
            const override = overrides.find((o: any) => o.id === sec.id) || {};
            if (override.keep === false) return; 

            generatedItems.push({
              id: `toggle-${sec.id}`,
              label: override.label || sec.title,
              checked: !sec.hidden,
              disabled: override.disabled || false,
              order: override.order ?? 1, 
              onClick: (e) => {
                if (override.onClick) override.onClick(e);
                sidebarRegistry.setSectionVisibility(panelDef.activityBarId, sec.id, !!sec.hidden);
              }
            });
          });

          overrides.forEach((override: any) => {
            if (!panelDef.sections.some(sec => sec.id === override.id)) {
              generatedItems.push(override);
            }
          });

          if (viewConfig.packIn) {
            allGenerated.push({
              id: `pack-${viewConfig.id || 'auto'}`,
              label: viewConfig.packIn,
              children: generatedItems,
              order: viewConfig.order ?? 0
            });
          } else {
            allGenerated.push(...generatedItems);
          }
        });

        if (!newAction.label && !newAction.icon) {
          return [...allGenerated, ...(newAction.children || [])];
        } else {
          newAction.children = [...(newAction.children || []), ...allGenerated];
        }
      }
      
      const isAutoFlat = newAction.children && newAction.children.length === 1 && newAction.flat !== false;
      if (newAction.flat || isAutoFlat) {
        return newAction.children || [];
      }
      
      return newAction;
    });
  }, [panelDef.sections, panelDef.activityBarId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {panelDef.header && (
        <SidebarHeader
          title={panelDef.header.title}
          rightActions={
            panelDef.header.actions?.length ? (
              <SidebarActions
                actions={enhanceActionsWithViews(panelDef.header.actions)}
                menuId={headerMenuId}
                maxOverflow={panelDef.header.maxOverflow}
              />
            ) : undefined
          }
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {visibleSections.map((section) => {
          const expanded = isExpanded(section);
          const isLastExpanded = section.id === lastExpandedId;
          const isBlock = !section.title || section.title === '';
          const height = getHeight(section);

          const ownerIndex = expandedSections.findIndex(s => s.id === section.id);
          const showResizer = expanded && ownerIndex > 0 && !isBlock;

          const ctx: SidebarSectionContext = { height, expanded };

          // Check if user explicitly set fillHeight to false
          const shouldFill = expanded && isLastExpanded && !isBlock && section.fillHeight !== false;

          const contentArea = (
            <div style={{
              height:    shouldFill ? '100%' : (height === 'auto' || (isBlock && !section.defaultHeight) ? 'auto' : `${height}px`),
              maxHeight: !shouldFill && height === 'auto' && section.maxHeight ? `${section.maxHeight}px` : undefined,
              overflowY: (isBlock && !shouldFill && height === 'auto') ? 'visible' : 'auto',
              overflowX: section.scrollX ? 'auto' : 'hidden',
              touchAction: 'pan-x pan-y',
            }}>
              <div style={{
                ...(section.scrollX ? { minWidth: '100%' } : {}),
                flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%'
              }}>
                {resolveContent(section.content, ctx)}
              </div>
            </div>
          );

          const sectionMenuId = sidebarMenuId?.section 
            ? sidebarMenuId.section(panelDef.activityBarId, section.id) 
            : `sidebar/${panelDef.activityBarId}/${section.id}/actions`;

          return (
            <React.Fragment key={section.id}>
              {showResizer && <Resizer onResize={(delta) => handleResize(section.id, delta)} />}
              <div style={{
                display: 'flex', flexDirection: 'column',
                flex: shouldFill ? 1 : 'none', minHeight: 0,
                overflow: isBlock ? 'visible' : 'hidden',
                flexShrink: isBlock && !shouldFill ? 0 : 1,
              }}>
                {isBlock ? (
                  contentArea
                ) : (
                  <Collapsible
                    expanded={expanded}
                    onToggle={(state) => handleToggle(section.id, state)}
                    fillHeight={shouldFill}
                    showGuideLine={true}
                    makeSticky={section.sticky}
                    stickyTop={section.stickyTop ?? 0}
                    stickyZIndex={section.stickyZIndex ?? 10}
                    title={
                      typeof section.title === 'string'
                        ? <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{section.title}</span>
                        : section.title
                    }
                    actions={section.actions?.length ? enhanceActionsWithViews(section.actions) : undefined}
                    actionMenuId={sectionMenuId}
                    maxOverflow={section.maxOverflow}
                  >
                    {contentArea}
                  </Collapsible>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};