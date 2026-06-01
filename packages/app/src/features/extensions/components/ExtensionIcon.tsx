// src/features/extensions/components/ExtensionIcon.tsx

import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
 * Visual asset component optimized for Capacitor.
 * Bypasses custom fs (which forces UTF-8) and natively reads pure Base64 to bypass WebView CSP blocks.
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
        const cleanIconPath = icon.replace(/^\//, '');
        let base64Data = '';

        if (storeDir.startsWith('/') || storeDir.startsWith('file://')) {
          const result = await Filesystem.readFile({
            path: `${storeDir}/${cleanIconPath}`
          });
          base64Data = result.data as string;
        } else {
          const cleanStoreDir = storeDir.replace('ms-storage://', '');
          const result = await Filesystem.readFile({
            path: `${cleanStoreDir}/${cleanIconPath}`,
            directory: Directory.Data 
          });
          base64Data = result.data as string;
        }

        const ext = icon.split('.').pop()?.toLowerCase() || 'png';
        const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

        if (isMounted && base64Data) {
          setImgSrc(`data:${mime};base64,${base64Data}`);
        }
      } catch (err) {
        console.error(`[ExtensionIcon] Failed to load icon from ${storeDir}`, err);
        if (isMounted) setImgError(true);
      }
    };

    loadLocalIcon();

    return () => { isMounted = false; };
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

  if (icon && !imgError) {
    return (
      <>
        <img 
          src={imgSrc} 
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
        {!imgSrc && (
          <div className={className} style={fallbackStyle} aria-hidden>
            {letterContent}
          </div>
        )}
      </>
    );
  }

  return (
    <div className={className} style={fallbackStyle} aria-hidden>
      {letterContent}
    </div>
  );
};