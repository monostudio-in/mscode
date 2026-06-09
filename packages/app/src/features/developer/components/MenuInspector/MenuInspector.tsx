// src/features/developer/components/MenuInspector/MenuInspector.tsx

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useMenuStore, getResolvedMenu, type MenuItem } from '@/store/menuStore';
import { sidebarRegistry }    from '@/core/extensionAPI/registry/sidebarRegistry';
import { activityBarRegistry } from '@/core/extensionAPI/registry/activityBarRegistry';
import { Icon }        from '@/ui/components/Icon/IconRegistry';
import { Collapsible } from '@/ui/components/Collapsible/Collapsible';
import './MenuInspector.css';

// ─── Types ─────────────────────────────────────────────────────────────────
type ViewMode = 'tree' | 'graph';

type TreeNode = {
  id: string;
  name: string;
  isLeaf: boolean;
  children: TreeNode[];
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const trunc = (s = '', max: number) => s.length > max ? s.slice(0, max) + '…' : s;

// ══════════════════════════════════════════════════════════════════════════════
//  TREE VIEW
// ══════════════════════════════════════════════════════════════════════════════

const MenuNode: React.FC<{ item: MenuItem; depth: number }> = ({ item, depth }) => {
  const isSep = item.type === 'separator';

  if (isSep) {
    return (
      <div className="ms-menu-node separator" style={{ paddingLeft: `${depth * 20}px` }}>
        <div className="ms-menu-line" />
        <span className="ms-menu-badge order-badge">order: {item.order ?? 0}</span>
      </div>
    );
  }

  return (
    <div className="ms-menu-node-wrapper">
      <div className="ms-menu-node" style={{ paddingLeft: `${depth * 20}px` }}>
        <div className="ms-menu-node-content">
          <span className="ms-menu-node-icon">
            {item.icon
              ? <Icon name={item.icon as any} size={14} />
              : <div className="ms-menu-icon-placeholder" />}
          </span>
          <span className="ms-menu-node-label">{item.label || 'Unnamed Item'}</span>
          
          {/* ✨ Full ID Show hobe (Noobs ra real ID dekhte pabe) ✨ */}
          <span className="ms-menu-node-id">({item.id})</span>
          
          <div className="ms-menu-badges">
            <span className="ms-menu-badge order-badge">order: {item.order ?? 0}</span>
            {item.onClick   && <span className="ms-menu-badge action-badge"    title="Has onClick handler">ƒ onClick</span>}
            {item.when      && <span className="ms-menu-badge condition-badge">when: {String(item.when)}</span>}
            {item.shortcut  && <span className="ms-menu-badge info-badge">key: {item.shortcut}</span>}
            {item.disabled  && <span className="ms-menu-badge warn-badge">disabled</span>}
            {item.checked   && <span className="ms-menu-badge success-badge">checked</span>}
            {item.flat !== undefined && <span className="ms-menu-badge info-badge">flat: {String(item.flat)}</span>}
          </div>
        </div>
      </div>
      {item.children && item.children.length > 0 && (
        <div className="ms-menu-children">
          {item.children.map((child, idx) => (
            <MenuNode key={`${child.id}-${idx}`} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  GRAPH VIEW  — pure SVG, zero packages
// ══════════════════════════════════════════════════════════════════════════════

// ─── Layout constants ────────────────────────────────────────────────────────
const GNW = 192;  
const GNH = 54;   
const GHG = 88;   
const GVG = 14;   

interface GNode { id: string; item: MenuItem; x: number; y: number }

const countLeaves = (item: MenuItem): number =>
  item.children?.length
    ? item.children.reduce((s, c) => s + countLeaves(c), 0)
    : 1;

function buildLayout(items: MenuItem[]): { nodes: GNode[]; edges: [string, string][] } {
  const nodes: GNode[]              = [];
  const edges: [string, string][]   = [];

  function place(list: MenuItem[], depth: number, yBase: number) {
    let y = yBase;
    for (const item of list) {
      const span = countLeaves(item) * (GNH + GVG) - GVG;
      nodes.push({ id: item.id, item, x: depth * (GNW + GHG), y: y + span / 2 - GNH / 2 });
      if (item.children?.length) {
        item.children.forEach(c => edges.push([item.id, c.id]));
        place(item.children, depth + 1, y);
      }
      y += span + GVG;
    }
  }

  place(items, 0, 0);
  return { nodes, edges };
}

const NODE_COLOR = {
  container: { stroke: '#2a6496', fill: '#2a6496', dot: '#4ec9b0' },
  action:    { stroke: '#8a5a00', fill: '#8a5a00', dot: '#d7ba7d' },
  plain:     { stroke: '#3c3c3c', fill: '#3c3c3c', dot: '#888'    },
};

const GraphView: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  const [pan, setPan] = useState({ x: 28, y: 28 });
  const dragging  = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const [isGrab, setIsGrab] = useState(false);

  const { nodes, edges } = useMemo(() => buildLayout(items), [items]);
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  if (!nodes.length) {
    return <div className="ms-mi-empty">No items to visualize.</div>;
  }

  const svgW = Math.max(...nodes.map(n => n.x + GNW)) + 60;
  const svgH = Math.max(...nodes.map(n => n.y + GNH)) + 60;

  const onDown = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.gn')) return;
    dragging.current  = true;
    lastPos.current   = { x: e.clientX, y: e.clientY };
    setIsGrab(true);
  };
  const onMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPan(p => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { dragging.current = false; setIsGrab(false); };

  return (
    <div
      className="ms-mi-graph-wrap"
      style={{ cursor: isGrab ? 'grabbing' : 'grab' }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
    >
      <svg className="ms-graph-svg" width={svgW + pan.x} height={svgH + pan.y}>
        <defs>
          <pattern id="mi-dot-grid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.055)" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#mi-dot-grid)" />

        <g transform={`translate(${pan.x},${pan.y})`}>
          {edges.map(([aId, bId], i) => {
            const f = nodeMap.get(aId);
            const t = nodeMap.get(bId);
            if (!f || !t) return null;
            const x1 = f.x + GNW,  y1 = f.y + GNH / 2;
            const x2 = t.x,         y2 = t.y + GNH / 2;
            const mx = (x1 + x2) / 2;
            return <path key={i} d={`M${x1},${y1}C${mx},${y1} ${mx},${y2} ${x2},${y2}`} className="ms-graph-edge" />;
          })}

          {nodes.map(n => {
            const hasKids  = !!n.item.children?.length;
            const hasClick = !!n.item.onClick;
            const hasWhen  = n.item.when !== undefined;
            const isSep    = n.item.type === 'separator';

            const col = hasKids ? NODE_COLOR.container : hasClick ? NODE_COLOR.action : NODE_COLOR.plain;

            return (
              <g key={n.id} className="gn" transform={`translate(${n.x},${n.y})`}>
                <rect x={3} y={4} width={GNW} height={GNH} rx={7} className="gn-shadow" />
                <rect width={GNW} height={GNH} rx={7} fill="var(--ms-bg-side, #1e2028)" stroke={col.stroke} strokeWidth={1} />
                <rect width={3} height={GNH} rx={2} fill={col.fill} />

                {hasKids && (
                  <>
                    <rect x={GNW - 58} y={0} width={58} height={18} rx={7} fill={col.stroke} opacity={0.22} />
                    <text x={GNW - 52} y={12} className="gn-tag">CONTAINER</text>
                  </>
                )}

                <text x={12} y={24} className="gn-label">
                  {isSep ? '─── separator ───' : trunc(n.item.label || 'Unnamed', 21)}
                </text>

                <text x={12} y={40} className="gn-id">{trunc(n.id, 28)}</text>

                {hasWhen  && <circle cx={GNW - 10} cy={10} r={4} className="gn-dot dot-when" />}
                {hasClick && <circle cx={GNW - 22} cy={10} r={4} className="gn-dot dot-fn" />}
                {n.item.checked  && <circle cx={GNW - 34} cy={10} r={4} className="gn-dot dot-checked" />}
                {n.item.disabled && <circle cx={GNW - 34} cy={10} r={4} className="gn-dot dot-disabled" />}
                {n.item.shortcut && <circle cx={GNW - 46} cy={10} r={4} className="gn-dot dot-shortcut" />}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="ms-graph-legend">
        <span className="legend-item"><span className="gn-dot dot-fn legend-dot" />ƒ onClick</span>
        <span className="legend-item"><span className="gn-dot dot-when legend-dot" />when</span>
        <span className="legend-item"><span className="gn-dot dot-checked legend-dot" />checked</span>
        <span className="legend-item"><span className="gn-dot dot-disabled legend-dot" />disabled</span>
        <span className="legend-item"><span className="gn-dot dot-shortcut legend-dot" />shortcut</span>
        <span className="legend-sep" />
        <span className="legend-item"><span className="legend-block" style={{ background: NODE_COLOR.container.stroke }} />container</span>
        <span className="legend-item"><span className="legend-block" style={{ background: NODE_COLOR.action.stroke }} />action</span>
        <span className="legend-item"><span className="legend-block" style={{ background: NODE_COLOR.plain.stroke }} />plain</span>
        <span className="legend-hint">drag to pan</span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN INSPECTOR
// ══════════════════════════════════════════════════════════════════════════════

export const MenuInspector: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [isGrouped, setIsGrouped] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  const rawMenus       = useMenuStore(state => state.registeredMenus);
  const dynamicHistory = useMenuStore(state => state.dynamicHistory);

  // ── Sidebar views parser (unchanged) ──────────────────────────────────────
  const parseSidebarViews = useCallback((actions: MenuItem[], panelDef: any): MenuItem[] => {
    if (!actions) return [];
    return actions.flatMap(action => {
      const newAction = { ...action };
      if (newAction.children) newAction.children = parseSidebarViews(newAction.children, panelDef);
      if (newAction.views) {
        const allGenerated: MenuItem[] = [];
        newAction.views.forEach((viewConfig: any) => {
          const overrides = viewConfig.children || [];
          const generatedItems: MenuItem[] = [];
          panelDef.sections.forEach((sec: any) => {
            if (!sec.title || sec.title === '') return;
            const override = overrides.find((o: any) => o.id === sec.id) || {};
            if (override.keep === false) return;
            generatedItems.push({
              id: `toggle-${sec.id}`, label: override.label || sec.title,
              checked: !sec.hidden, disabled: override.disabled || false,
              order: override.order ?? 1, onClick: () => {}
            });
          });
          overrides.forEach((override: any) => {
            if (!panelDef.sections.some((sec: any) => sec.id === override.id)) generatedItems.push(override);
          });
          if (viewConfig.packIn) {
            allGenerated.push({ id: `pack-${viewConfig.id || 'auto'}`, label: viewConfig.packIn, children: generatedItems, order: viewConfig.order ?? 0 });
          } else {
            allGenerated.push(...generatedItems);
          }
        });
        if (!newAction.label && !newAction.icon) return [...allGenerated, ...(newAction.children || [])];
        else newAction.children = [...(newAction.children || []), ...allGenerated];
      }
      const isAutoFlat = newAction.children && newAction.children.length === 1 && newAction.flat !== false;
      if (newAction.flat || isAutoFlat) return newAction.children || [];
      return newAction;
    });
  }, []);

  // ── Aggregate all menu sources ─────────────────────────────────────────────
  const aggregatedMenus = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    if (rawMenus) Object.keys(rawMenus).forEach(id => { map[id] = [...rawMenus[id]]; });
    if (dynamicHistory) {
      Object.keys(dynamicHistory).forEach(id => {
        if (!map[id]) map[id] = [];
        const existingMap = new Map(map[id].map(item => [item.id, item]));
        dynamicHistory[id].forEach((item: MenuItem) => existingMap.set(item.id, item));
        map[id] = Array.from(existingMap.values());
      });
    }
    activityBarRegistry.getAll().forEach(barItem => {
      const panel = sidebarRegistry.getPanel(barItem.id);
      if (!panel) return;
      if (panel.header?.actions) {
        map[`sidebar/${panel.activityBarId}/header/actions`] = parseSidebarViews(panel.header.actions, panel);
      }
      panel.sections.forEach(sec => {
        if (sec.actions) map[`sidebar/${panel.activityBarId}/${sec.id}/actions`] = parseSidebarViews(sec.actions, panel);
      });
    });
    return map;
  }, [rawMenus, dynamicHistory, parseSidebarViews]);

  // 🚀 THE MAGIC: Reconstruct Structural Parents for flattened or raw items
  const reconstructParents = useCallback((items: MenuItem[], parentId?: string): MenuItem[] => {
    return items.map(item => {
      const reconstructed = { ...item };

      // Recursively process any explicitly nested children first
      if (reconstructed.children) {
        reconstructed.children = reconstructParents(reconstructed.children, reconstructed.id);
      }

      const match = reconstructed.id.match(/^(.*?)\.children-\d+$/);
      const hasOnClick = !!reconstructed.onClick;
      const noChildren = !reconstructed.children || reconstructed.children.length === 0;

      // ── Case 1: Already wrapped items ──
      // "Jodi parent -> children erokom bhabei asche data tahole ar normalization korte hobe na"
      if (match) {
        const expectedParentId = match[1];
        
        // If the system has flattened it, we recreate the parent Container
        if (parentId !== expectedParentId) {
          return {
            id: expectedParentId, 
            label: reconstructed.label,
            icon: reconstructed.icon,
            order: reconstructed.order,
            when: reconstructed.when,
            // Full Child ID is preserved inside it!
            children: [ { ...reconstructed } ] 
          };
        }
      } 
      
      // ── Case 2: Raw / Unnormalized Actions (e.g. from Sidebar) ──
      // "Direct option ache, take children kore parent banao"
      if (!match && hasOnClick && noChildren) {
        return {
          id: reconstructed.id, 
          label: reconstructed.label,
          icon: reconstructed.icon,
          order: reconstructed.order,
          when: reconstructed.when,
          children: [ 
            { 
              ...reconstructed, 
              id: `${reconstructed.id}.children-1` // Explicitly append suffix for the child 
            } 
          ]
        };
      }

      return reconstructed;
    });
  }, []);

  const menuIds = useMemo(() => Object.keys(aggregatedMenus).sort(), [aggregatedMenus]);
  const [selectedMenuId, setSelectedMenuId] = useState('');

  useEffect(() => {
    if (!selectedMenuId && menuIds.length > 0) setSelectedMenuId(menuIds[0]);
  }, [menuIds, selectedMenuId]);

  // 3. Resolve deeply AND reconstruct structural reality!
  const resolvedTree = useMemo(() => {
    if (!selectedMenuId) return [];
    try {
      const defaults = aggregatedMenus[selectedMenuId] || [];
      const resolved = getResolvedMenu(selectedMenuId, defaults);
      return reconstructParents(resolved); // 👈 Application of the structural reconstructor
    } catch (err) {
      console.error(`[MenuInspector] Error resolving '${selectedMenuId}':`, err);
      return [];
    }
  }, [selectedMenuId, aggregatedMenus, reconstructParents]);

  // ── Build Tree View Data for Menu IDs ──────────────────────────────────────
  const sidebarTreeData = useMemo(() => {
    const root: TreeNode[] = [];
    const map = new Map<string, TreeNode>();

    menuIds.forEach(id => {
      const parts = id.split('/');
      let currentPath = '';
      let currentParentList = root;

      parts.forEach((part, i) => {
        const isLast = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        let node = map.get(currentPath);
        if (!node) {
          node = { id: currentPath, name: part, isLeaf: isLast, children: [] };
          map.set(currentPath, node);
          currentParentList.push(node);
        } else if (isLast) {
          node.isLeaf = true; 
        }
        currentParentList = node.children;
      });
    });

    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach(n => sortNodes(n.children));
    };
    sortNodes(root);
    return root;
  }, [menuIds]);

  // ── Helper actions ─────────────────────────────────────────────────────────
  const toggleFolder = (id: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (id: string) => {
    setSelectedMenuId(id);
    if (window.innerWidth <= 768) setSidebarOpen(false); 
  };

  const viewActions = useMemo<MenuItem[]>(() => [
    {
      id:      'mi.view-tree',
      label:   'Tree View',
      icon:    'list-tree',
      checked: viewMode === 'tree',
      onClick: () => setViewMode('tree'),
    },
    {
      id:      'mi.view-graph',
      label:   'Graph View',
      icon:    'type-hierarchy-sub',
      checked: viewMode === 'graph',
      onClick: () => setViewMode('graph'),
    },
  ], [viewMode]);

  const stats = useMemo(() => {
    const flat = (items: MenuItem[]): MenuItem[] =>
      items.flatMap(i => [i, ...(i.children ? flat(i.children) : [])]);
    const all = flat(resolvedTree);
    return { total: all.length, actions: all.filter(i => !!i.onClick).length };
  }, [resolvedTree]);

  const renderTreeNodes = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => {
      const isCollapsed = collapsedFolders.has(node.id);
      const isSelected = selectedMenuId === node.id;
      const hasChildren = node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <div
            className={`ms-mi-sidebar-item ${isSelected ? 'active' : ''}`}
            style={{ paddingLeft: `${15 + depth * 14}px` }}
            onClick={() => {
              if (node.isLeaf) handleSelect(node.id);
              else if (hasChildren) toggleFolder(node.id);
            }}
          >
            {hasChildren ? (
              <span className="ms-mi-folder-toggle" onClick={(e) => { e.stopPropagation(); toggleFolder(node.id); }}>
                <Icon name={isCollapsed ? 'chevron-right' : 'chevron-down'} size={14} />
              </span>
            ) : (
              <span className="ms-mi-folder-toggle-spacer" />
            )}
            <Icon name={hasChildren ? (node.isLeaf ? 'symbol-namespace' : 'folder') : 'list-tree'} size={14} />
            <span className="ms-mi-tree-node-name">{node.name}</span>
          </div>
          {!isCollapsed && hasChildren && renderTreeNodes(node.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="ms-menu-inspector">
      
      {sidebarOpen && <div className="ms-mi-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className={`ms-mi-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ms-mi-sidebar-header">
          <span>MENU REGISTRY</span>
          <div className="ms-mi-sidebar-actions">
            <span
              className={`ms-mi-action-icon ${isGrouped ? 'active' : ''}`}
              title="Show with Grouping"
              onClick={() => setIsGrouped(!isGrouped)}
            >
              <Icon name="list-tree" size={14} />
            </span>
          </div>
        </div>
        <div className="ms-mi-sidebar-list">
          {menuIds.length === 0 && <div className="ms-mi-empty">No menus registered</div>}
          {!isGrouped
            ? menuIds.map(id => (
                <div key={id} className={`ms-mi-sidebar-item ${selectedMenuId === id ? 'active' : ''}`} onClick={() => handleSelect(id)}>
                  <Icon name="list-tree" size={14} />
                  <span>{id}</span>
                </div>
              ))
            : renderTreeNodes(sidebarTreeData)}
        </div>
      </div>

      <div className="ms-mi-content">
        <Collapsible
          isCollapsible={false}
          title={
            <div className="ms-mi-col-title-wrap">
              <span className="ms-mi-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Icon name="menu" size={16} />
              </span>
              <div className="ms-mi-col-title">
                <span className="ms-mi-col-name">{selectedMenuId || 'Select a Menu'}</span>
                {selectedMenuId && (
                  <span className="ms-mi-col-meta">
                    {stats.total} nodes · {stats.actions} actions · {viewMode} view
                  </span>
                )}
              </div>
            </div>
          }
          actions={viewActions}
          actionMenuId="menu-inspector-view-toggle"
          maxOverflow={0}
          fillHeight
          headerStyle={{ borderBottom: '1px solid var(--ms-border-color, #333)', minHeight: 42 }}
        >
          {viewMode === 'tree' ? (
            <div className="ms-mi-tree-container">
              {resolvedTree.length === 0 ? (
                <div className="ms-mi-empty">
                  {!selectedMenuId ? 'Select a menu from the left panel.' : 'Menu is empty.'}
                </div>
              ) : (
                resolvedTree.map((item, idx) => (
                  <MenuNode key={`${item.id}-${idx}`} item={item} depth={0} />
                ))
              )}
            </div>
          ) : (
            resolvedTree.length === 0 ? (
              <div className="ms-mi-empty">
                {!selectedMenuId ? 'Select a menu from the left panel.' : 'Menu is empty.'}
              </div>
            ) : (
              <GraphView items={resolvedTree} />
            )
          )}
        </Collapsible>
      </div>
    </div>
  );
};