// src/features/explorer/components/GenericTreeView/GenericTreeView.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { Collapsible }  from '@/ui/components/Collapsible/Collapsible';
import { Icon }         from '@/ui/components/Icon/IconRegistry';
import type { TreeItem, TreeDataProvider } from '@/core/extensionAPI/registry/treeViewRegistry';
import { ROW_HEIGHT }   from '../FileTree/constant/constants';

// ─── Types & Contract Definitions ───────────────────────────────────────────

/**
 * Interface properties schema mapped directly onto the `GenericTreeView` root container.
 */
interface GenericTreeViewProps {
  /** * The structural data abstraction layer. 
   * Responsible for sourcing hierarchical tree nodes dynamically from any core or extension module.
   */
  provider: TreeDataProvider;
}

/**
 * Internal state profile allocated dynamically to manage standalone interactive Tree Nodes.
 */
interface TreeNodeState {
  /** Immutable meta configuration definition assigned to this explicit node point. */
  item: TreeItem;
  /** Discovered or resolved child elements nested straight under this specific node. */
  children: TreeItem[];
  /** Flag determining if the underlying collapsible wrapper layout is actively expanded. */
  isOpen: boolean;
  /** Active network or data-source resolution state monitoring asynchronous fetch requests. */
  isLoading: boolean;
}

// ─── Single Generic Node Component ───────────────────────────────────────────

/**
 * Internal Layer: Recursive structural element representing a single point inside the Tree hierarchy.
 * Handles self-contained lifecycle configurations, child injection arrays, and asynchronous lazy loading.
 * * @component
 * @private
 */
const GenericNode: React.FC<{
  /** Config token containing layout parameters like labels, badges, icons, and action keys. */
  item: TreeItem;
  /** Core target provider responsible for resolution callbacks when fetching nested arrays. */
  provider: TreeDataProvider;
  /** Incremental hierarchy placement index utilized to apply incremental padding offsets. */
  depth: number;
}> = ({ item, provider, depth }) => {

  const [state, setState] = useState<TreeNodeState>({
    item,
    children:  [],
    isOpen:    item.collapsibleState === 'expanded',
    isLoading: false,
  });

  /**
   * Safe asynchronous pipeline querying the underlying DataProvider to evaluate children.
   * Leveraged primarily to accomplish on-demand Lazy Loading for sub-nodes.
   */
  const loadChildren = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const kids = await provider.getChildren(item);
      setState(s => ({ ...s, children: kids, isLoading: false }));
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [item, provider]);
  
  // Triggers background child fetching sequences if a node is explicitly flagged as expanded on mount
  useEffect(() => {
    if (item.collapsibleState === 'expanded' && state.children.length === 0) {
      loadChildren();
    }
  }, [item.collapsibleState, state.children.length, loadChildren]);

  /** Switches collapsible visibility profiles and hooks into dynamic child resolution streams. */
  const handleToggle = () => {
    const opening = !state.isOpen;
    setState(s => ({ ...s, isOpen: opening }));
    if (opening && state.children.length === 0) loadChildren();
  };

  /** Dispatches action triggers back into the provider context and captures expansion parameters. */
  const handleClick = () => {
    provider.onItemClick?.(item);
    if (item.collapsibleState !== 'none') handleToggle();
  };

  // ── Leaf Node Element Layout (e.g. Simple Actions or Flat Files) ──────────────
  if (item.collapsibleState === 'none') {
    return (
      <div
        className="ms-file-item"
        onClick={handleClick}
        style={{
          height:       `${ROW_HEIGHT}px`,
          display:      'flex',
          alignItems:   'center',
          gap:          '6px',
          paddingLeft:  `${depth * 12 + 4}px`,
          cursor:       'pointer',
          fontSize:     '13px',
        }}
      >
        {item.icon && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <Icon name={item.icon as any} size={16} />
          </div>
        )}

        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.label}
        </span>

        {item.description && (
          <span style={{ fontSize: '11px', color: 'var(--ms-text-faded)', paddingRight: '4px', flexShrink: 0 }}>
            {item.description}
          </span>
        )}

        {item.badge && (
          <span style={{
            fontSize:     '10px',
            fontWeight:   700,
            color:        item.badgeColor ?? 'var(--ms-text-faded)',
            paddingRight: '8px',
            flexShrink:   0,
          }}>
            {item.badge}
          </span>
        )}
      </div>
    );
  }

  // ── Collapsible Parent Node Layout (e.g. Directories, Script Groups, Categories) ──
  return (
    <Collapsible
      expanded={state.isOpen}
      onToggle={handleToggle}
      showGuideLine={true}
      titleStyle={{ fontWeight: 'normal' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', width: '100%' }}>
          {item.icon && (
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Icon name={item.icon as any} size={16} />
            </div>
          )}

          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>

          {item.description && (
            <span style={{ fontSize: '11px', color: 'var(--ms-text-faded)', flexShrink: 0 }}>
              {item.description}
            </span>
          )}

          {item.badge && (
            <span style={{
              fontSize:     '10px',
              fontWeight:   700,
              color:        item.badgeColor ?? 'var(--ms-text-faded)',
              paddingRight: '8px',
              flexShrink:   0,
            }}>
              {item.badge}
            </span>
          )}
        </div>
      }
    >
      {state.isLoading && (
        <div style={{ paddingLeft: `${(depth + 1) * 12 + 4}px`, fontSize: '12px', color: 'var(--ms-text-faded)' }}>
          Loading…
        </div>
      )}

      {/* Recursively maps child sub-nodes into identical layout structures */}
      {state.children.map(child => (
        <GenericNode
          key={child.id}
          item={child}
          provider={provider}
          depth={depth + 1}
        />
      ))}
    </Collapsible>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────

/**
 * Component Layer: Extensible Agnostic Tree Structure Interface Render Block.
 * * A core architectural view mechanism capable of constructing fully collapsible, 
 * asynchronous multi-tier hierarchies without maintaining direct ties to specific data paradigms (like native OS file structures).
 * * All operational blueprints, tracking data, and execution handlers arrive mapped through an incoming `TreeDataProvider`.
 * * ### Extension API Usage & Registration Lifecycle
 * Extensions leverage this module by binding a compliant schema definition into the active view layout:
 * * @example
 * ```typescript
 * import React from 'react';
 * import { GenericTreeView } from '@/features/explorer/components/GenericTreeView/GenericTreeView';
 * import type { TreeDataProvider, TreeItem } from '@/core/extensionAPI/registry/treeViewRegistry';
 * * // 1. Construct an independent, domain-specific Data Provider
 * const customTodoProvider: TreeDataProvider = {
 * getChildren: async (element?: TreeItem) => {
 * if (!element) {
 * // Root levels definition
 * return [{ id: 'proj-1', label: 'Mscode Refactor', collapsibleState: 'expanded' }];
 * }
 * // Sub-option lazy fetch trigger
 * return [{ id: 'task-1', label: 'Document GenericTreeView.tsx', collapsibleState: 'none', icon: 'info' }];
 * },
 * onItemClick: (item) => {
 * console.log(`User interacted with target task ID: ${item.id}`);
 * }
 * };
 * * // 2. Deploy into your custom Explorer View Slot
 * const MyCustomExtensionPanel = () => {
 * return <GenericTreeView provider={customTodoProvider} />;
 * };
 * ```
 * * ### Architecture Subsystem Flow
 * ```
 * [GenericTreeView Component] ──> Ingests [TreeDataProvider] ──> Invokes getChildren(undefined)
 * │
 * ┌───────────────────────────────────────────────────────────────────┘
 * ▼
 * [Maps Root TreeItems] ──> Mounts Individual [GenericNode] Components
 * │
 * ├───> If 'none': Renders Flat Leaf Node Row
 * │
 * └───> If 'expanded' / 'collapsed': Wraps with [Collapsible]
 * │
 * └─> (On Toggle Expansion)
 * Triggers lazy-fetch getChildren(parentItem)
 * and recursively appends sub-GenericNodes.
 * ```
 * * @component
 * @category Explorer Subsystems
 */
export const GenericTreeView: React.FC<GenericTreeViewProps> = ({ provider }) => {
  const [roots, setRoots]       = useState<TreeItem[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    // Request topmost hierarchical items by passing `undefined` as anchor token
    provider
      .getChildren(undefined)
      .then(items => { if (alive) { setRoots(items); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
      
    return () => { alive = false; };
  }, [provider]);

  if (isLoading) {
    return (
      <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--ms-text-faded)' }}>
        Loading…
      </div>
    );
  }

  if (roots.length === 0) {
    return (
      <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--ms-text-faded)' }}>
        No items.
      </div>
    );
  }

  return (
    <>
      {roots.map(item => (
        <GenericNode key={item.id} item={item} provider={provider} depth={1} />
      ))}
    </>
  );
};