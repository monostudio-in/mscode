// src/features/extensions/components/ExtensionIcon.tsx

import React, { useState, useEffect } from 'react';
import { loadExtensionIconSafely } from '@/features/extensions/services/extensionLoader';

interface ExtensionIconProps {
  icon?: string;
  storeDir: string;
  name: string;
  iconColor?: string;
  iconLetter?: string;
  size?: number; 
  className?: string;
}

/**
 * Visual asset component that safely resolves and paints branding nodes using Blob URLs.
 */
export const ExtensionIcon: React.FC<ExtensionIconProps> = ({
  icon, 
  storeDir, 
  name, 
  iconColor, 
  iconLetter, 
  size = 42, 
  className = ''
}) => {
  const letterContent = iconLetter || name.charAt(0).toUpperCase();
  
  const isHttp = icon ? /^https?:\/\//i.test(icon) : false;

  const [imgSrc, setImgSrc] = useState<string | undefined>(isHttp ? icon : undefined);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadLocalIcon = async () => {
      if (!icon || isHttp) return;

      try {
        const blobUrl = await loadExtensionIconSafely(storeDir, icon);
        
        if (isMounted && blobUrl) {
          setImgSrc(blobUrl);
        } else if (isMounted) {
          setImgError(true);
        }
      } catch (err) {
        console.error(`[ExtensionIcon] Failed to load icon from ${storeDir}`, err);
        if (isMounted) {
          setImgError(true);
        }
      }
    };

    loadLocalIcon();

    return () => { 
      isMounted = false; 
      if (imgSrc && imgSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [icon, storeDir, isHttp]);

  const fallbackStyle: React.CSSProperties = {
    backgroundColor: iconColor || 'var(--ms-activity-hover)', 
    width: `${size}px`, 
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size * 0.55}px`,
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    flexShrink: 0
  };

  // ── 1. Render Path: Active Image Asset Route ──
  if (icon && !imgError) {
    return (
      <>
        <img 
          src={imgSrc || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
          alt={name} 
          className={className}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            borderRadius: '8px', 
            objectFit: 'contain',
            flexShrink: 0,
            display: imgSrc ? 'block' : 'none'
          }}
          onError={() => setImgError(true)}
        />
        
        {/* Render placeholder scaffolding block down the wire until binary parsing wraps up */}
        {!imgSrc && (
          <div className={className} style={fallbackStyle} aria-hidden>
            {letterContent}
          </div>
        )}
      </>
    );
  }

  // ── 2. Render Path: Fallback Node Anchor (If image fails to load) ──
  return (
    <div className={className} style={fallbackStyle} aria-hidden>
      {letterContent}
    </div>
  );
};