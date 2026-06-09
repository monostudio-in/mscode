// src/ui/components/Button/SplitButton.tsx
//
// ─── SplitButton ─────────────────────────────────────────────────────────────
//
// Usage:
//   <SplitButton
//     label="Commit"
//     onClick={onCommit}
//     options={[
//       { label: 'Commit',           onClick: onCommit },
//       { label: 'Commit (Amend)',   onClick: onAmend  },
//       { label: 'Commit & Push',    onClick: onCP     },
//       { label: 'Commit & Sync',    onClick: onCS     },
//     ]}
//     disabled={isLoading}
//   />
//
// The left part triggers `onClick`; the ∨ chevron opens a small dropdown.

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../Icon/IconRegistry';

export interface SplitButtonOption {
  label:    string;
  onClick:  () => void;
  disabled?: boolean;
}

export interface SplitButtonProps {
  /** Label shown on the main (left) button */
  label:     string;
  /** Main action — called when the left button is clicked */
  onClick:   () => void;
  /** Dropdown options shown when ∨ is clicked */
  options:   SplitButtonOption[];
  disabled?: boolean;
  fullWidth?: boolean;
  style?:    React.CSSProperties;
  className?: string;
}

export const SplitButton: React.FC<SplitButtonProps> = ({
  label, onClick, options,
  disabled = false, fullWidth = false,
  style, className = '',
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const base: React.CSSProperties = {
    display:        'flex',
    alignItems:     'stretch',
    width:          fullWidth ? '100%' : undefined,
    borderRadius:   '1px',
    overflow:       'visible',
    position:       'relative',
    ...style,
  };

  const mainStyle: React.CSSProperties = {
    flex:           1,
    border:         'none',
    background:     disabled ? 'var(--ms-bg-sidebar)' : 'var(--ms-accent)',
    color:          disabled ? 'var(--ms-text-faded)' : '#fff',
    fontSize:       '12px',
    fontFamily:     'inherit',
    padding:        '8px 10px',
    cursor:         disabled ? 'not-allowed' : 'pointer',
    opacity:        disabled ? 0.5 : 1,
    textAlign:      'left',
    borderRadius:   '1px 0 0 1px',
    transition:     'opacity 0.15s, background 0.15s',
  };

  const chevronStyle: React.CSSProperties = {
    border:         'none',
    borderLeft:     `1px solid rgba(255,255,255,0.25)`,
    background:     disabled ? 'var(--ms-bg-sidebar)' : 'var(--ms-accent)',
    color:          disabled ? 'var(--ms-text-faded)' : '#fff',
    cursor:         disabled ? 'not-allowed' : 'pointer',
    padding:        '5px 6px',
    display:        'flex',
    alignItems:     'center',
    opacity:        disabled ? 0.5 : 1,
    borderRadius:   '0 1px 1px 0',
    transition:     'opacity 0.15s, background 0.15s',
    flexShrink:     0,
  };

  const dropdownStyle: React.CSSProperties = {
    position:       'absolute',
    bottom:         'calc(100% + 4px)',
    left:           0,
    right:          0,
    background:     'var(--ms-bg-menu, #252526)',
    border:         '1px solid var(--ms-border-dark, #454545)',
    borderRadius:   '2px',
    zIndex:         9999,
    overflow:       'hidden',
    boxShadow:      '0 4px 12px rgba(0,0,0,0.4)',
    minWidth:       '160px',
  };

  const optionStyle = (opt: SplitButtonOption): React.CSSProperties => ({
    width:          '100%',
    padding:        '7px 12px',
    background:     'none',
    border:         'none',
    color:          opt.disabled ? 'var(--ms-text-faded)' : 'var(--ms-text-bright)',
    fontSize:       '12px',
    fontFamily:     'inherit',
    textAlign:      'left',
    cursor:         opt.disabled ? 'not-allowed' : 'pointer',
    display:        'block',
    opacity:        opt.disabled ? 0.5 : 1,
  });

  return (
    <div ref={wrapRef} style={base} className={`ms-split-btn ${className}`}>
      {/* ── Main action button ─────────────────────────────────────────── */}
      <button
        style={mainStyle}
        disabled={disabled}
        onClick={() => { if (!disabled) onClick(); }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = disabled ? '0.5' : '1'; }}
      >
        {label}
      </button>

      {/* ── Dropdown chevron ───────────────────────────────────────────── */}
      <button
        style={chevronStyle}
        disabled={disabled}
        title="More commit actions"
        onClick={e => { e.stopPropagation(); if (!disabled) setOpen(v => !v); }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = disabled ? '0.5' : '1'; }}
      >
        <Icon name="chevron-down" size={12} />
      </button>

      {/* ── Dropdown menu ──────────────────────────────────────────────── */}
      {open && (
        <div style={dropdownStyle}>
          {options.map((opt, i) => (
            <button
              key={i}
              style={optionStyle(opt)}
              disabled={opt.disabled}
              onMouseEnter={e => { if (!opt.disabled) (e.currentTarget as HTMLButtonElement).style.background = 'var(--ms-menu-hover-bg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
              onClick={() => {
                if (!opt.disabled) {
                  setOpen(false);
                  opt.onClick();
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
