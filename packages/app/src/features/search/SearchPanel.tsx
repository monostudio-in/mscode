// src/features/search/SearchPanel.tsx

import React, { useEffect } from 'react';
import { InputBox, InputAction } from '@/ui/components/InputBox/InputBox';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import { useSearchStore } from './store/searchStore';
import { useTabStore } from '@/store/tabStore';
import { Collapsible } from '@/ui/components/Collapsible/Collapsible';
import { SidebarHeader } from '@/ui/components/SidebarHeader/SidebarHeader';
import { FileIcon } from '@/ui/components/FileIcon/DefaultIconTheme'; 
import './SearchPanel.css';

/**
 * Workbench sidebar component orchestrating multi-file project searches, global text substitutions, 
 * and regex pattern filtering constraints inside file indexing boundaries.
 */
export const SearchPanel: React.FC = () => {
  const {
    searchQuery, setSearchQuery, replaceQuery, setReplaceQuery,
    includeQuery, setIncludeQuery, excludeQuery, setExcludeQuery,
    isReplaceOpen, setIsReplaceOpen, isDetailsOpen, toggleDetailsOpen,
    matchCase, wholeWord, useRegex, toggleOption,
    results, isSearching, executeSearch, executeReplace, dismissResult, toggleFileExpanded
  } = useSearchStore();

  const { addTab } = useTabStore();

  // Debounce search evaluations automatically when user configuration updates occur
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { executeSearch(); }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, matchCase, wholeWord, useRegex, includeQuery, excludeQuery, executeSearch]);

  const totalMatches = results.reduce((acc, file) => acc + file.matches.length, 0);
  const totalFiles = results.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SidebarHeader title="Search" />
      
      <div style={{ padding: '10px 15px 10px 5px', flexShrink: 0 }}>
        
        {/* Search & Replace Input Row Configuration Layout */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          
          <div style={{ flex: 1 }}>
            {/* Main Full-Text Target Input Field */}
            <InputBox 
              placeholder="Search" 
              value={searchQuery} 
              onChange={setSearchQuery} 
              leftIcon={
                <div onClick={() => setIsReplaceOpen(!isReplaceOpen)} style={{ cursor: 'pointer' }}>
                  <Icon name={isReplaceOpen ? 'chevron-down' : 'chevron-right'} size={16} />
                </div>
              } 
              insideIcons={
                <>
                  <InputAction icon={<Icon name="case-sensitive" size={16} />} active={matchCase} onClick={() => toggleOption('matchCase')} />
                  <InputAction icon={<Icon name="whole-word" size={16} />} active={wholeWord} onClick={() => toggleOption('wholeWord')} />
                  <InputAction icon={<Icon name="regex" size={16} />} active={useRegex} onClick={() => toggleOption('useRegex')} />
                </>
              }
            />
            
            {/* Replace Field Panel View Conditional Toggle */}
            {isReplaceOpen && (
              <div style={{ marginTop: '6px' }}>
                <InputBox 
                  placeholder="Replace" 
                  value={replaceQuery} 
                  onChange={setReplaceQuery} 
                  leftIcon={<div style={{ width: '16px' }}/>} 
                  insideIcons={<InputAction icon={<Icon name="case-sensitive" size={16} />} />} 
                  outsideIcons={<InputAction icon={<Icon name="replace-all" size={16} />} onClick={() => console.log('Replace all everywhere')} />}
                />
              </div>
            )}
          </div>
          
          {/* Toggle Button for Supplementary Directory Filtering Bounds */}
          <div 
            onClick={toggleDetailsOpen}
            title="Toggle Search Details"
            style={{ 
              padding: '4px', 
              marginLeft: '4px', 
              cursor: 'pointer', 
              opacity: isDetailsOpen ? 1 : 0.6, 
              background: isDetailsOpen ? 'var(--ms-icon-hover-bg)' : 'transparent', 
              borderRadius: '4px' 
            }}
          >
            <Icon name="more-vertical" size={16} />
          </div>
          
        </div>

        {/* Supplementary Path Inclusion/Exclusion Filtering View Node */}
        {isDetailsOpen && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '0' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ms-text-faded)', marginBottom: '4px', paddingLeft: '5px' }}>
                files to include
              </div>
              <InputBox 
                placeholder="e.g. *.ts, src/**/include" 
                value={includeQuery} 
                onChange={setIncludeQuery} 
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ms-text-faded)', marginBottom: '4px', paddingLeft: '5px' }}>
                files to exclude
              </div>
              <InputBox 
                placeholder="e.g. *.js, node_modules" 
                value={excludeQuery} 
                onChange={setExcludeQuery} 
              />
            </div>
          </div>
        )}
        
        {/* Dynamic Telemetry Metric Output Status Subtitle Text */}
        <div style={{ paddingTop: '10px', color: 'var(--ms-text-faded)', fontSize: '11px', paddingLeft: '5px' }}>
          {isSearching ? 'Searching...' : totalMatches > 0 ? `${totalMatches} results in ${totalFiles} files` : 'No results found.'}
        </div>
      </div>

      {/* Match Results Interactive List Presentation Tree */}
      <div className="ms-search-results-container">
        {results.map((file) => (
          <Collapsible
            key={file.filePath}
            expanded={file.expanded}
            onToggle={() => toggleFileExpanded(file.filePath)}
            showGuideLine={true}
            title={
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingLeft: '5px' }}>
                <FileIcon name={file.fileName} isDir={false} />
                <span style={{ fontSize: '13px', marginLeft: '6px' }}>{file.fileName}</span>
                <span className="ms-search-path-faded" style={{ marginLeft: '8px' }}>{file.dirPath}</span>
                <div className="ms-search-badge" style={{ marginLeft: 'auto', marginRight: '5px' }}>
                  {file.matches.length}
                </div>
              </div>
            }
            rightActions={
              <div className="ms-search-actions" onClick={(e) => e.stopPropagation()}>
                {isReplaceOpen && (
                  <div className="ms-search-action-btn" onClick={() => executeReplace(file.filePath)}>
                    <Icon name="replace-all" size={14} />
                  </div>
                )}
                <div className="ms-search-action-btn" onClick={() => dismissResult(file.filePath)}>
                  <Icon name="close" size={14} />
                </div>
              </div>
            }
          >
            {/* Individual Inline Token String Match Elements */}
            {file.matches.map((match) => (
              <div 
                key={match.id} 
                className="ms-search-match-row" 
                onClick={() => addTab({ id: file.filePath, type: 'code', title: file.fileName, filePath: file.filePath })}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                  {match.preview.substring(0, match.matchStart)}
                  <span className="ms-search-match-highlight">
                    {match.preview.substring(match.matchStart, match.matchStart + match.matchLength)}
                  </span>
                  {match.preview.substring(match.matchStart + match.matchLength)}
                </div>
                <div className="ms-search-actions" onClick={(e) => e.stopPropagation()}>
                  {isReplaceOpen && (
                    <div className="ms-search-action-btn" onClick={() => executeReplace(file.filePath, match.id)}>
                      <Icon name="replace" size={14} />
                    </div>
                  )}
                  <div className="ms-search-action-btn" onClick={() => dismissResult(file.filePath, match.id)}>
                    <Icon name="close" size={14} />
                  </div>
                </div>
              </div>
            ))}
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
