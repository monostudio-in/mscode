// src/features/editor/components/BreadCrumb/Breadcrumbs.tsx
import React, { useRef, useEffect } from 'react';
import { useBreadcrumbStore } from './store/breadcrumbStore';
import { useTabStore } from '@/store/tabStore'; 
import { FileIcon } from '@/ui/components/FileIcon/DefaultIconTheme'; 
import './Breadcrumbs.css';

const getSymbolIcon = (kind?: number) => {
  switch (kind) {
    case 4: return 'codicon-symbol-class';
    case 11: return 'codicon-symbol-function';
    case 12: return 'codicon-symbol-variable';
    case 17: return 'codicon-symbol-array';
    case 2: return 'codicon-symbol-namespace';
    default: return 'codicon-symbol-property';
  }
};

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useBreadcrumbStore();
  const { tabs, activeTabId } = useTabStore(); 
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [breadcrumbs]);

  const activeTab = tabs.find(t => t.id === activeTabId);
  if (!activeTab) return null;

  const shouldShow = (activeTab as any).showBreadcrumb ?? (activeTab.type === 'code');
  if (!shouldShow) return null; 

  const handleClick = (item: any) => {
    console.log(`[Breadcrumb Click] Type: ${item.kind}`, item);
  };

  return (
    <div className="ms-breadcrumbs-container" ref={containerRef}>
      {breadcrumbs.map((item, index) => {
        const isFile = item.kind === 'file';

        return (
          <React.Fragment key={index}>
            <div className="ms-breadcrumb-item" onClick={() => handleClick(item)}>
              
              <div style={{ display: 'flex', alignItems: 'center', marginRight: 6 }}>
                {isFile ? (
                  <FileIcon name={item.name} isDir={false} />
                ) : (
                  <span className={`codicon ${getSymbolIcon(item.symbolKind)}`} style={{ fontSize: 14 }} />
                )}
              </div>
              
              <span>{item.name}</span>
            </div>
            
            {index < breadcrumbs.length - 1 && (
              <span className="ms-breadcrumb-separator codicon codicon-chevron-right" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};