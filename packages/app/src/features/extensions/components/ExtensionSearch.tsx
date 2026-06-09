import React, { useRef } from 'react';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { useMenuStore, type MenuItem } from '@/store/menuStore' ;
import type { ExtensionFilter } from '../types';

const CATEGORIES = ['All', 'Language Support', 'Formatters', 'Linters', 'Themes'] as const;

interface ExtensionSearchProps {
  filter: ExtensionFilter;
  setFilter: (partial: Partial<ExtensionFilter>) => void;
}

export const ExtensionSearch: React.FC<ExtensionSearchProps> = ({ filter, setFilter }) => {
  const { openMenu } = useMenuStore();
  const filterButtonRef = useRef<HTMLSpanElement>(null); // To anchor the popup position

  // ─── Trigger Inbuilt Context Menu ──────────────────────────────────────────
  const handleFilterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!filterButtonRef.current) return;

    // Calculate dynamic anchor position right under the filter icon
    const rect = filterButtonRef.current.getBoundingClientRect();
    const x = rect.left;
    const y = rect.bottom + 4;

    // Dynamically map categories into native MenuItem schema
    const menuItems: MenuItem[] = CATEGORIES.map(cat => ({
      id: `ext-filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`,
      label: cat,
      checked: (filter.category ?? 'All') === cat, // Standard checkmark support
      onClick: () => setFilter({ category: cat }),
    }));

    // Launch the core menu subsystem
    openMenu('sidebar/extensions/filter', x, y, menuItems);
  };

  return (
    <div className="ms-ext-search-row">
      <div className="ms-ext-search-box">
        <Icon name="search" size={13} className="ms-ext-search-icon" />

        <input
          className="ms-ext-search-input"
          type="text"
          placeholder="Search Extensions in Marketplace"
          value={filter.query}
          onChange={e => setFilter({ query: e.target.value })}
          spellCheck={false}
        />

        {filter.query && (
          <Icon
            name="close"
            size={13}
            className="ms-ext-search-clear"
            onClick={() => setFilter({ query: '' })}
          />
        )}

        {/* Filter Anchor Area */}
        <div className="ms-ext-filter-wrapper">
          <span 
            ref={filterButtonRef} 
            onClick={handleFilterClick}
            style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <Icon
              name="filter"
              size={13}
              className="ms-ext-filter-icon"
              title="Filter by category"
            />
          </span>
        </div>
      </div>

      {filter.category !== 'All' && (
        <div className="ms-ext-active-chip">
          <span>{filter.category}</span>
          <Icon name="close" size={11} onClick={() => setFilter({ category: 'All' })} />
        </div>
      )}
    </div>
  );
};