// src/features/git/components/ChangedFileItem.tsx

import React, { useState } from 'react';
import { Icon }       from '@/ui/components/Icon/IconRegistry';
import { FileIcon }   from '@/ui/components/FileIcon/DefaultIconTheme';
import { GIT_STATUS_META } from '../store/gitStore';
import type { GitChangedFile } from '../store/gitStore';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChangedFileItemProps {
  file:        GitChangedFile;
  /** Primary action button icon + tooltip (e.g. stage / unstage) */
  actionIcon:  string;
  actionTitle: string;
  onAction:    (path: string) => void;
  /** Optional second action (e.g. discard for unstaged) */
  action2Icon?:  string;
  action2Title?: string;
  onAction2?:    (path: string) => void;
  onClick?:    (file: GitChangedFile) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ChangedFileItem: React.FC<ChangedFileItemProps> = ({
  file,
  actionIcon, actionTitle, onAction,
  action2Icon, action2Title, onAction2,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const meta = GIT_STATUS_META[file.status];

  // Derive the folder portion for the dim path label
  const parts     = file.path.split('/');
  const folderPath = parts.slice(1, -1).join('/'); // strips leading '/'

  return (
    <div
      onClick={() => onClick && onClick(file)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '6px',
        padding:         '3px 8px 3px 16px',
        cursor:          'pointer',
        backgroundColor: hovered ? 'var(--ms-menu-hover-bg)' : 'transparent',
        userSelect:      'none',
        minHeight:       '26px',
      }}
    >
      {/* File Icon */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <FileIcon name={file.name} isDir={false} />
      </div>

      {/* Filename + dim folder path */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '0px', overflow: 'hidden', minWidth: 0 }}>
        <span style={{
          display: 'flex',
          flexDirection: 'column' ,
          gap:'0',
          rowGap: '0',
          columnGap: '0',
          lineHeight:1
        }}>{file.name && (
          <span style={{
          fontSize:     '13px',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          color:        meta.color,
          textDecoration:        meta.decoration,
          fontStyle : meta.style 
        }}>{file.name}</span>
        )}
          {folderPath && (
          <span style={{
            fontSize:     '9px',
            color:        'var(--ms-text-faded)',
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            fontStyle: 'italic',
            flexShrink:   1,
          }}>{folderPath}</span>
        )}
          
        </span>

      </div>

      {/* Action buttons — visible on hover */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '2px',
        flexShrink: 0,
        opacity:    hovered ? 1 : 0,
        transition: 'opacity 0.1s',
      }}>
        {/* Secondary action (e.g. Discard) */}
        {action2Icon && onAction2 && (
          <span
            title={action2Title}
            onClick={e => { e.stopPropagation(); onAction2(file.path); }}
            style={{
              display:    'flex',
              alignItems: 'center',
              padding:    '2px',
              borderRadius:'2px',
              color:      'var(--ms-text-faded)',
            }}
          >
            <Icon name={action2Icon as any} size={14} />
          </span>
        )}

        {/* Primary action (e.g. Stage / Unstage) */}
        <span
          title={actionTitle}
          onClick={e => { e.stopPropagation(); onAction(file.path); }}
          style={{
            display:    'flex',
            alignItems: 'center',
            padding:    '2px',
            borderRadius:'2px',
            color:      'var(--ms-text-faded)',
          }}
        >
          <Icon name={actionIcon as any} size={14} />
        </span>
      </div>

      {/* Status badge — always visible on the right */}
      <span
        title={meta.label}
        style={{
          fontSize:    '11px',
          fontWeight:  700,
          color:       meta.color,
          flexShrink:  0,
          minWidth:    '12px',
          textAlign:   'right',
        }}
      >
        {meta.badge}
      </span>
    </div>
  );
};