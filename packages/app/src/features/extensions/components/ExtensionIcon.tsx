// src/features/extensions/components/ExtensionIcon.tsx

import React, { useState, useEffect } from 'react';
import { fs } from '@/core/fileSystem';

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
 * Visual asset component that resolves and paints branding nodes for application extensions.
 * Handles remote network imagery sources, local storage-sandboxed binary parsing into Base64 
 * data schemes, and falls back gracefully to a letter avatar blocks when assets are absent or unreadable.
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
  const isLocalImage = icon ? /\.(png|jpe?g|svg|webp|gif)$/i.test(icon) : false;

  const [imgSrc, setImgSrc] = useState<string | undefined>(isHttp ? icon : undefined);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    if (!icon || isHttp || !isLocalImage) return;

    let isMounted = true;

    const loadLocalIcon = async () => {
      try {
        const targetPath = `ms-storage://${storeDir}/${icon.replace(/^\//, '')}`;
        const fileData = await fs.readFile(targetPath);
        
        if (isMounted) {
          const ext = icon.split('.').pop()?.toLowerCase() || 'png';
          const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
          
          const finalSrc = fileData.startsWith('data:') ? fileData : `data:${mime};base64,${fileData}`;
          setImgSrc(finalSrc);
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
    };
  }, [icon, storeDir, isHttp, isLocalImage]);

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
  if (icon && (isHttp || isLocalImage) && !imgError) {
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

  // ── 2. Render Path: Fallback Node Anchor ──
  return (
    <div className={className} style={fallbackStyle} aria-hidden>
      {letterContent}
    </div>
  );
};
