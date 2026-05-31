// src/features/settings/components/SettingsView.tsx
import React, { useState, useMemo, memo, useEffect } from 'react';
import { configRegistry, type SettingDefinition } from '@/core/extensionAPI/registry/configurationRegistry';
import { SettingItem } from './components/SettingItem';
import { InputBox, InputAction } from '@/ui/components/InputBox/InputBox';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { useMenuStore } from '@/store/menuStore';
import { useExtensionStore } from '@/features/extensions/store/extensionStore'; 
import './SettingView.css';

interface SettingGroup {
  settings: SettingDefinition[];
  subGroups: Record<string, SettingGroup>;
}

export const SettingsView: React.FC = memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const { openMenu } = useMenuStore();
  const extRecords = useExtensionStore(state => state.records); 

  // Listen to external commands (like from Git panel) to update search query
  useEffect(() => {
    const handleExternalSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSearchQuery(customEvent.detail);
      }
    };
    document.addEventListener('ms-settings-search', handleExternalSearch);
    return () => document.removeEventListener('ms-settings-search', handleExternalSearch);
  }, []);

  const handleFilterClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const applyFilter = (filterText: string) => {
      const cleaned = searchQuery.replace(/@(ext|lang|id|exp|tag):?/gi, '').trim();
      setSearchQuery(`${filterText} ${cleaned}`.trim());
    };
    
    openMenu('settings/filter', e.clientX, e.clientY + 15, [
      { id: 'ext', label: 'Extension ID...', onClick: () => applyFilter('@ext:') },
      { id: 'sid', label: 'Setting ID...', onClick: () => applyFilter('@id:') },
      { id: 'exp', label: 'Experimental', onClick: () => applyFilter('@exp') },
    ]);
  };

  // TOKENIZER: Parse @id, @ext, @exp, @tag correctly!
  const settingsTree = useMemo(() => {
    let query = searchQuery.toLowerCase().trim();
    const allSettings = configRegistry.getAllSettings();
    
    let filtered = allSettings;

    if (query) {
      const tokens = query.split(/\s+/);
      
      tokens.forEach(token => {
        if (token.startsWith('@id:')) {
          const val = token.substring(4);
          filtered = filtered.filter(s => s.id.toLowerCase().includes(val));
        } 
        else if (token.startsWith('@ext:')) {
          const val = token.substring(5);
          filtered = filtered.filter(s => 
            s.id.toLowerCase().startsWith(val) || 
            s.tags?.some(t => t.toLowerCase() === val) ||
            (!val && s.tags?.includes('extension')) // Show all extensions if just @ext: is typed
          );
        } 
        else if (token === '@exp') {
          filtered = filtered.filter(s => s.experimental === true);
        } 
        else if (token.startsWith('@tag:')) {
          const val = token.substring(5);
          filtered = filtered.filter(s => s.tags?.some(t => t.toLowerCase().includes(val)));
        } 
        else {
          // Standard text search across multiple fields
          filtered = filtered.filter(s => 
            (s.title || '').toLowerCase().includes(token) || 
            (s.category || '').toLowerCase().includes(token) ||
            (s.id || '').toLowerCase().includes(token) ||
            (s.description || '').toLowerCase().includes(token)
          );
        }
      });
    }

    const root: Record<string, SettingGroup> = {};

    filtered.forEach(s => {
      const cat = s.category || 'General';
      if (!root[cat]) root[cat] = { settings: [], subGroups: {} };

      const path = s.subCategory ? s.subCategory.split('>').map(p => p.trim()) : [];
      let currentLevel = root[cat];
      
      path.forEach(part => {
        if (!currentLevel.subGroups[part]) {
          currentLevel.subGroups[part] = { settings: [], subGroups: {} };
        }
        currentLevel = currentLevel.subGroups[part];
      });

      currentLevel.settings.push(s);
    });

    return root;
  }, [searchQuery, extRecords]);

  const renderGroup = (name: string, group: SettingGroup, depth: number, parentTop: number) => {
    const isCategory = depth === 0;
    const headerHeight = isCategory ? 38 : 32;
    const currentTop = parentTop;
    const nextTop = currentTop + headerHeight;

    return (
      <div key={name} style={{ marginLeft: depth > 1 ? '15px' : '0' }}>
        <div style={{ 
          position: 'sticky', 
          top: `${currentTop}px`, 
          zIndex: 100 - depth,
          backgroundColor: 'var(--ms-settings-bg)',
          padding: isCategory ? '12px 20px 4px 20px' : '6px 20px',
          fontSize: Math.max(11, 18 - (depth * 3)) + 'px', 
          fontWeight: isCategory ? 'bold' : '600',
          color: isCategory ? 'var(--ms-text-main)' : 'var(--ms-settings-category-color)',
          textTransform: isCategory ? 'none' : 'uppercase',
          borderBottom: '1px solid var(--ms-border-light)',
          backdropFilter: 'blur(8px)',
          display: name === '' ? 'none' : 'block'
        }}>
          {name}
        </div>

        <div style={{ padding: '8px 0' }}>
          {group.settings.map(s => <SettingItem key={s.id} setting={s} />)}
        </div>

        {Object.entries(group.subGroups).map(([subName, subGroup]) => 
          renderGroup(subName, subGroup, depth + 1, nextTop)
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--ms-settings-bg)' }}>
      <div style={{ padding: '15px 20px', backgroundColor: 'var(--ms-bg-main)', position: 'sticky', top: 0, zIndex: 110 }}>
        <InputBox 
          placeholder="Search settings..." 
          value={searchQuery} 
          onChange={setSearchQuery}
          insideIcons={
            <>
              {searchQuery.length > 0 && (
                <InputAction 
                  icon={<Icon name="close" size={16} />} 
                  onClick={() => setSearchQuery('')} 
                />
              )}
              <InputAction 
                icon={<Icon name="filter" size={16} />} 
                onClick={handleFilterClick as any} 
              />
            </>
          }
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        {Object.entries(settingsTree).map(([catName, group]) => renderGroup(catName, group, 0, 0))}
      </div>
    </div>
  );
});