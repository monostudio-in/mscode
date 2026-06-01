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
 * Visual asset component that safely resolves and paints branding nodes.
 * Automatically handles ArrayBuffers, Base64 strings, and raw binary text to bypass CSP blocks.
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
        const targetPath = (storeDir.startsWith('/') || storeDir.startsWith('file://'))
          ? `${storeDir}/${icon.replace(/^\//, '')}`
          : `ms-storage://${storeDir}/${icon.replace(/^\//, '')}`;

        const fileData = await fs.readFile(targetPath);

        const ext = icon.split('.').pop()?.toLowerCase() || 'png';
        const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

        let finalBase64 = '';

        if (fileData instanceof ArrayBuffer || fileData instanceof Uint8Array) {
          const buffer = new Uint8Array(fileData);
          let binaryStr = '';
          for (let i = 0; i < buffer.byteLength; i++) {
            binaryStr += String.fromCharCode(buffer[i]);
          }
          finalBase64 = btoa(binaryStr);
        } 
        else if (typeof fileData === 'string') {
          if (fileData.startsWith('data:')) {
            if (isMounted) setImgSrc(fileData);
            return;
          } 
          else if (/^[A-Za-z0-9+/=]+$/.test(fileData.substring(0, 50))) {
            finalBase64 = fileData;
          } 
          else {
            finalBase64 = btoa(fileData);
          }
        }

        // ৩. ফাইনাল ইমেজ রেন্ডার
        if (isMounted && finalBase64) {
          setImgSrc(`data:${mime};base64,${finalBase64}`);
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