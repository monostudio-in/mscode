import React, { useEffect, useState } from 'react';
import { fs } from '@/core/fileSystem';
import { Icon } from '@/ui/components/Icon/IconRegistry';

export const ImagePreviewer: React.FC<{ tabId: string; filePath: string }> = ({ filePath }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const loadImage = async () => {
      try {
        const data = await fs.readFile(filePath);
        
        if (alive) {
          const ext = filePath.split('.').pop()?.toLowerCase();
          const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
          
          if (typeof data === 'string') {
            setImgSrc(data.startsWith('data:') ? data : `data:${mimeType};base64,${data}`);
          } else {
             const blob = new Blob([data as BlobPart], { type: mimeType });
             setImgSrc(URL.createObjectURL(blob));
          }
        }
      } catch (err: any) {
        if (alive) setError(err.message);
      }
    };
    
    loadImage();
    return () => { alive = false; };
  }, [filePath]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--vscode-errorForeground, #f48771)' }}>
        <Icon name="error" size={48} />
        <p style={{ marginTop: '16px' }}>Failed to load image: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%', 
      width: '100%', 
      backgroundColor: 'var(--ms-bg-main)',
      overflow: 'auto'
    }}>
      {imgSrc ? (
        <img 
          src={imgSrc} 
          alt={filePath.split('/').pop()} 
          style={{ 
            maxWidth: '90%', 
            maxHeight: '90%', 
            objectFit: 'contain',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            backgroundColor: 'transparent' 
          }} 
        />
      ) : (
        <span style={{ color: 'var(--ms-text-faded)' }}>Loading Image...</span>
      )}
    </div>
  );
};