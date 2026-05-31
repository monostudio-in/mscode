// src/features/termis/components/parts/problems/ProblemsPanel.tsx

import React, { useMemo } from 'react';
import * as monaco from 'monaco-editor';

import { useProblemsStore } from './store/problemsStore';
import { useMenuStore, type MenuItem } from '@/store/menuStore';
import { useTabStore }                from '@/store/tabStore';

import { Collapsible }  from '@/ui/components/Collapsible/Collapsible';
import { FileIcon }     from '@/ui/components/FileIcon/DefaultIconTheme';
import { Icon }         from '@/ui/components/Icon/IconRegistry';
import { InputBox, InputAction } from '@/ui/components/InputBox/InputBox';
import { useNavigationStore } from '@/store/navigationStore';

import './ProblemsPanel.css';

/**
 * Maps Monaco marker severity integers to custom styling descriptors.
 * 
 * @param s Severity indicator extracted directly from the system diagnostic engine.
 * @returns Object configuration outlining matching visual cues and accent tokens.
 */
const severityIcon = (s: monaco.MarkerSeverity) => {
  if (s === monaco.MarkerSeverity.Error) {
    return { name: 'error' as const, color: 'var(--ms-problems-error, #f48771)' };
  }
  if (s === monaco.MarkerSeverity.Warning) {
    return { name: 'warning' as const, color: 'var(--ms-problems-warning, #cca700)' };
  }
  return { name: 'info' as const, color: 'var(--ms-problems-info, #75beff)' };
};

/**
 * Diagnostics compilation layout displaying systematic syntax anomalies, compilation warnings,
 * and workspace markers grouped smoothly under resource paths.
 */
export const ProblemsPanel: React.FC = () => {
  const {
    showErrors, showWarnings, showInfos,
    toggleErrors, toggleWarnings, toggleInfos,
    filterText, setFilterText, clearMarkers,
    showExcludeInput, showIncludeInput,
    toggleExcludeInput, toggleIncludeInput,
    excludeFilter, setExcludeFilter,
    includeFilter, setIncludeFilter,
    getFilteredMarkers
  } = useProblemsStore();

  const { openMenu } = useMenuStore();
  const { addTab } = useTabStore();
  const setNavigation = useNavigationStore(s => s.setNavigation);

  const markers = getFilteredMarkers();

  const grouped = useMemo(() => {
    const groups: Record<string, monaco.editor.IMarker[]> = {};
    markers.forEach(m => {
      const path = m.resource.path;
      if (!groups[path]) {
        groups[path] = [];
      }
      groups[path].push(m);
    });
    return groups;
  }, [markers]);

  const openFile = (path: string, marker: monaco.editor.IMarker) => {
    const filename = path.split('/').pop() || 'File';
    addTab({ id: path, type: 'code', title: filename, filePath: path });
    setNavigation(path, marker.startLineNumber, marker.startColumn);
  };

  const handleFilterMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    const menuItems: MenuItem[] = [
      { id: 'toggle-errors', label: 'Show Errors', checked: showErrors, onClick: toggleErrors },
      { id: 'toggle-warnings', label: 'Show Warnings', checked: showWarnings, onClick: toggleWarnings },
      { id: 'toggle-infos', label: 'Show Infos', checked: showInfos, onClick: toggleInfos },
      { type: 'separator', id: 'sep1' },
      { id: 'toggle-include', label: 'Include Files...', checked: showIncludeInput, onClick: toggleIncludeInput },
      { id: 'toggle-exclude', label: 'Exclude Files...', checked: showExcludeInput, onClick: toggleExcludeInput },
    ];

    openMenu('termis/problems/filter', rect.left - 130, rect.bottom + 8, menuItems);
  };

  return (
    <div className="ms-problems-root">
      {/* ── Filter bar ── */}
      <div className="ms-problems-filterbar">
        <InputBox
          placeholder="Filter. E.g. text, **/*.ts, !**/node_modules"
          value={filterText}
          onChange={setFilterText}
          insideIcons={
            <InputAction 
              icon={<Icon name="filter" size={14} />} 
              onClick={handleFilterMenu} 
            />
          }
          outsideIcons={
            <InputAction
              icon={<Icon name="clear-all" size={15} />}
              onClick={() => { clearMarkers(); setFilterText(''); }}
            />
          }
        />
        
        {showIncludeInput && (
          <div className="ms-problems-filter-extra">
            <span className="ms-problems-filter-label">files to include</span>
            <InputBox placeholder="e.g. src/**/*.ts" value={includeFilter} onChange={setIncludeFilter} />
          </div>
        )}
        
        {showExcludeInput && (
          <div className="ms-problems-filter-extra">
            <span className="ms-problems-filter-label">files to exclude</span>
            <InputBox placeholder="e.g. out/**" value={excludeFilter} onChange={setExcludeFilter} />
          </div>
        )}
      </div>

      {/* ── Tree / List ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '4px' }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ padding: '10px 20px', color: 'var(--ms-text-faded)', fontSize: '13px' }}>
            No problems have been detected in the workspace.
          </div>
        ) : (
          Object.entries(grouped).map(([path, fileMarkers]) => {
            const cleanPath = path.replace(/^\//, '');
            const parts = cleanPath.split('/');
            const filename = parts.pop() || '';
            const dir = parts.join('/');
            
            let errCount = 0; 
            let warnCount = 0;
            
            fileMarkers.forEach(m => {
              if (m.severity === monaco.MarkerSeverity.Error) {
                errCount++;
              } else if (m.severity === monaco.MarkerSeverity.Warning) {
                warnCount++;
              }
            });

            return (
              <Collapsible
                key={path}
                defaultExpanded={true}
                showGuideLine={false}
                headerStyle={{ padding: '4px 10px', height: '26px' }}
                title={
                  <div className="ms-problems-file-header">
                    <FileIcon name={filename} isDir={false} />
                    <span className="ms-problems-filename">{filename}</span>
                    <span className="ms-problems-dirpath">{dir}</span>
                    <div className="ms-problems-badges">
                      {errCount > 0 && (
                        <span className="ms-problems-badge ms-problems-badge--error">
                          <Icon name="error" size={12} /> {errCount}
                        </span>
                      )}
                      {warnCount > 0 && (
                        <span className="ms-problems-badge ms-problems-badge--warn">
                          <Icon name="warning" size={12} /> {warnCount}
                        </span>
                      )}
                    </div>
                  </div>
                }
              >
                {fileMarkers.map((m, i) => {
                  const { name: iconName, color } = severityIcon(m.severity);
                  const code = m.code ? (typeof m.code === 'string' ? m.code : m.code.value) : '';

                  return (
                    <div
                      key={i}
                      className="ms-problems-marker-row"
                      onClick={() => openFile(path, m)} 
                    >
                      <Icon name={iconName} size={14} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div className="ms-problems-marker-msg">
                        <span className="ms-problems-marker-source">[{m.source ?? 'lsp'}]</span>
                        {' '}
                        {m.message}
                        <span className="ms-problems-marker-meta">
                          {code && ` [${code}]`} ({m.startLineNumber},{m.startColumn})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
};
