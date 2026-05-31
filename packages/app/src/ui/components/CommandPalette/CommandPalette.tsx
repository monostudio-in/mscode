// src/ui/components/CommandPalette/CommandPalette.tsx

import React, { useState, useEffect, useRef } from 'react';
import './CommandPalette.css';
import { usePaletteStore, type QuickPickItem } from '@/store/paletteStore';
import { Icon } from '../Icon/IconRegistry';
import { useBackButtonStore } from '@/store/backButtonStore'; 

export const CommandPalette: React.FC = () => {
  const { 
    isOpen, 
    query, 
    setQuery, 
    closePalette, 
    providers,
    isQuickPick, 
    quickPickItems, 
    quickPickItemsGenerator,
    quickPickPlaceholder, 
    onQuickPickSelect,
    isInputBox,
    inputBoxPlaceholder,
    onInputBoxSubmit
  } = usePaletteStore();
  
  const [items, setItems] = useState<QuickPickItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && items.length > 0 && items[selectedIndex]) {
      const currentItem = items[selectedIndex];
      if (currentItem.onFocus && typeof currentItem.onFocus === 'function') {
        currentItem.onFocus();
      }
    }
  }, [selectedIndex, items, isOpen]); 

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handlerId = 'command-palette-close-handler';
      useBackButtonStore.getState().push(handlerId, () => {
        closePalette(); return true; 
      });
      return () => { useBackButtonStore.getState().remove(handlerId); };
    }
  }, [isOpen, closePalette]);

  // ── Query Parsing & Dynamic UI ─────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (isInputBox) {
      setItems([]);
      return;
    }

    if (isQuickPick) {
      // If a dynamic generator function was passed, let IT handle everything!
      if (quickPickItemsGenerator) {
        setItems(quickPickItemsGenerator(query));
      } else {
        // Fallback to traditional static filtering
        const txt = query.trim().toLowerCase();
        if (!txt) {
          setItems(quickPickItems);
        } else {
          setItems(quickPickItems.filter(i => 
            i.type === 'separator' || 
            i.label.toLowerCase().includes(txt) || 
            i.description?.toLowerCase().includes(txt)
          ));
        }
      }
      setSelectedIndex(0);
      return;
    }

    let alive = true;
    const trimmed = query.trim();
    const prefix = query.startsWith('>') ? '>' : (trimmed.match(/^([@:#/])/) ? trimmed[0] : '');
    const searchWord = prefix ? query.substring(prefix.length) : query;

    const provider = providers[prefix];
    if (!provider) { setItems([]); return; }

    setIsLoading(true);
    Promise.resolve(provider.provideItems(searchWord))
      .then(res => { if (alive) { setItems(res); setSelectedIndex(0); } })
      .catch(err => console.error(`[Palette] Provider '${prefix}' crash:`, err))
      .finally(() => { if (alive) setIsLoading(false); });

    return () => { alive = false; };
  }, [query, isOpen, providers, isQuickPick, quickPickItems, quickPickItemsGenerator, isInputBox]);

  // ── Keyboard Navigation Controls ──────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { closePalette(); e.preventDefault(); return; }

    if (isInputBox) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (onInputBoxSubmit && query.trim()) {
          const submitFn = onInputBoxSubmit;
          const val = query.trim();
          closePalette(); 
          submitFn(val);
        }
      }
      return;
    }

    const selectableItems = items.filter(i => i.type !== 'separator');
    const currentSelectableIndex = selectableItems.indexOf(items[selectedIndex]);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectableItems.length === 0) return;
      const nextSelectableIdx = (currentSelectableIndex + 1) % selectableItems.length;
      const actualIdx = items.indexOf(selectableItems[nextSelectableIdx]);
      setSelectedIndex(actualIdx);
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectableItems.length === 0) return;
      const prevSelectableIdx = (currentSelectableIndex - 1 + selectableItems.length) % selectableItems.length;
      const actualIdx = items.indexOf(selectableItems[prevSelectableIdx]);
      setSelectedIndex(actualIdx);
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      const activeItem = items[selectedIndex];
      if (activeItem && !activeItem.readonly && activeItem.type !== 'separator') {
        handleItemSelect(activeItem);
      }
    }
  };

  const handleItemSelect = (item: QuickPickItem) => {
    if (!item.keepOpen) closePalette();
    if (isQuickPick && onQuickPickSelect) onQuickPickSelect(item);
    else if (item.onSelect) item.onSelect();
  };

  if (!isOpen) return null;

  return (
    <div className="ms-palette-overlay" onClick={closePalette}>
      <div className="ms-palette-container" onClick={e => e.stopPropagation()}>
        <div className="ms-palette-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="ms-palette-input"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={
              isInputBox ? inputBoxPlaceholder : 
              isQuickPick ? quickPickPlaceholder : 
              "Type '>' to show commands, ':' to go to line..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="ms-palette-body">
          {isLoading && <div className="ms-palette-loading">Loading operations…</div>}
          
          {isInputBox ? (
            <div style={{ padding: '12px 16px', color: 'var(--ms-text-faded)', fontSize: '12.5px', borderTop: '1px solid var(--ms-border-dark, #242424)' }}>
              Press <span style={{ color: 'var(--ms-accent)', fontWeight: 'bold', fontFamily: 'monospace' }}>Enter</span> to confirm input or <span style={{ color: 'var(--ms-text-bright)', fontWeight: 'bold', fontFamily: 'monospace' }}>Esc</span> to dismiss.
            </div>
          ) : (
            <div className="ms-palette-list">
              {items.map((item, index) => {
                if (item.type === 'separator') {
                  return (
                    <div key={item.id || index} className="ms-palette-separator">{item.label}</div>
                  );
                }

                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id || index}
                    className={`ms-palette-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => !item.readonly && handleItemSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="ms-palette-left">
                      {item.iconClass ? (
                        <div className="ms-palette-icon-left"><i className={item.iconClass}></i></div>
                      ) : item.leftIcon ? (
                        <div className="ms-palette-icon-left"><Icon name={item.leftIcon} size={14} /></div>
                      ) : null}

                      <span className="ms-palette-label" style={item.readonly ? { opacity: 0.6, fontStyle: 'italic' } : {}}>{item.label}</span>
                      
                      {item.inlineDetail && <span style={{ color: 'var(--ms-text-faded)', marginLeft: '6px', fontSize: '12px' }}>{item.inlineDetail}</span>}
                      {item.suffix && <span style={{ color: 'var(--ms-text-faded)', fontStyle: 'italic', marginLeft: '6px', fontSize: '12px', opacity: 0.7 }}>{item.suffix}</span>}
                      {item.description && <span className="ms-palette-description">{item.description}</span>}
                    </div>

                    <div className="ms-palette-right">
                      {item.shortcut ? (
                        <span className="ms-palette-shortcut">{item.shortcut}</span>
                      ) : item.rightIcon ? (
                        <div className="ms-palette-icon-right" onClick={(e) => { e.stopPropagation(); item.onRightIconClick?.(e); }}>
                          <Icon name={item.rightIcon} size={14} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {!isLoading && items.length === 0 && (
                <div className="ms-palette-no-results">No matching workspace actions found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};