// src/ui/components/Icon/IconRegistry.tsx
import React from 'react';
import { customIcons } from './iconsData';
/**
 * Pre-registered safe semantic identity tokens map matching the MS Code design framework.
 */
export type IconName =
  | 'files' | 'search' | 'settings' | 'close' | 'menu' | 'more' | 'more-vertical'
  | 'chevron-up' | 'chevron-down' | 'chevron-right' | 'chevron-left'
  | 'check' | 'refresh' | 'clear-all' | 'collapse-all'
  | 'case-sensitive' | 'whole-word' | 'regex'
  | 'replace' | 'replace-all'
  | 'new-file' | 'new-folder' | 'filter'
  | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'arrow-right'
  | 'file' | 'folder' | 'folder-android' | 'folder-active' | 'folder-linux'
  | 'info' | 'keyboard' | 'undo' | 'redo' | 'save';

/**
 * Configuration schemas for the universal Icon rendering engine.
 */
export interface IconProps {
  /** * Name of the target asset. Supports 3 configurations:
   * 1. A recognized internal token (e.g., `'save'`, `'search'`).
   * 2. A remote direct HTTP/HTTPS link or standalone Base64 DataURI.
   * 3. A fallback standard fallback Codicon system string (e.g., `'bell'`, `'git-compare'`).
   */
  name: IconName | string;

  /** Edge bounding box size width and height scale in pixels. Defaults to `16`. */
  size?: number;

  /** CSS hex, rgb, or variable color injected directly into the graphic instance. */
  color?: string;

  /** Standard optional wrapper layout class styling descriptor. */
  className?: string;

  /** Optional event hook capturing user cursor touch or click frames. */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;

  /** Fallback raw CSS structural style matrix properties. */
  style?: React.CSSProperties;

  /** Optional HTML browser descriptive hovering caption text. */
  title?: string;
}

/**
 * Universal MS Code Icon Gateway System.
 * Intelligently routes compilation layers dynamically to provide matching themed graphics seamlessly.
 * * @example
 * ```tsx
 * const { Icon } = mscode.ui.components;
 * * // 1. Render a native bundled custom SVG
 * <Icon name="save" size={18} color="var(--ms-accent)" />
 * * // 2. Render an absolute web path target asset
 * <Icon name="[https://example.com/logo.png](https://example.com/logo.png)" size={24} />
 * * // 3. Fallback effortlessly into the local codicon system layout
 * <Icon name="git-merge" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  name, size = 16, color, className = '', onClick, style, title,
}) => {

  // ── 1. URL Image Router (http://, https://, data:) ───────────────────────
  if (
    typeof name === 'string' &&
    (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('data:'))
  ) {
    return (
      <span
        className={`ms-icon ms-img-icon ${className}`}
        onClick={onClick}
        title={title}
        style={{
          width:   size,
          height:  size,
          display: 'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={name}
          alt={title ?? ''}
          draggable={false}
          style={{
            width:      size,
            height:     size,
            objectFit:  'contain',
            borderRadius: '2px',
            opacity: color ? undefined : 1,
          }}
        />
      </span>
    );
  }

  // ── 2. Registered Custom SVG Core Layer ──────────────────────────────────
  const SvgIcon = customIcons[name as IconName];
  if (SvgIcon) {
    return (
      <span
        className={`ms-icon ms-svg-icon ${className}`}
        onClick={onClick}
        title={title}
        style={{
          width:  size,
          height: size,
          color:  color || 'inherit',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        {SvgIcon}
      </span>
    );
  }

  // ── 3. Codicon Standard Fallback Subsystem ────────────────────────────────
  return (
    <i
      className={`codicon codicon-${name} ${className}`}
      onClick={onClick}
      title={title}
      style={{
        fontSize:       `${size}px`,
        color:          color || 'inherit',
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        ...style,
      }}
    />
  );
};