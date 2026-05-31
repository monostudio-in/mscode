// src/ui/components/FileIcon/DefaultIconTheme.tsx
import React, { useState, useEffect } from 'react';
import { fileIconRegistry } from '@/core/extensionAPI/registry/FileIconRegistry';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { fs } from '@/core/fileSystem';
import './FileIconTheme.css';

import defaultThemeMap from '@/core/constants/defaultIconTheme'; 

// Load initial built-in icons structure
fileIconRegistry.loadIconTheme(defaultThemeMap as any);

/**
 * Shared runtime cache tracking Base64/DataURIs of loaded assets.
 * Prevents heavy repetitive disk compilation operations during rendering loops.
 */
const iconCache = new Map<string, string>();

/**
 * Configuration schemas for the MS Code FileIcon renderer.
 */
export interface FileIconProps {
  /** Name of the target file or folder including extension (e.g., `'package.json'`, `'index.ts'`). */
  name: string;

  /** Flag forcing the layout resolver to search within the folder taxonomy instead of flat files. */
  isDir: boolean;

  /** Optional state indicator to alternate between `'open'` and `'closed'` folder glyph graphics. */
  isOpen?: boolean;
}

/**
 * Native MS Code File & Folder Icon Renderer.
 * Resolves glyph tokens dynamically based on the active `'workbench.iconTheme'` global setting matrices.
 * * * **Performance Engineered:** Leverages an asynchronous memory cache subsystem to transform local storage bitmaps (`ms-storage://`) into ultra-fast DataURIs seamlessly.
 * * **Flicker Protection:** Implements an instant CSS-based semantic fallback system until async disk streams finish pipeline updates.
 * * @example
 * ```tsx
 * const { FileIcon } = mscode.ui.components;
 * * // 1. Render a TypeScript source file icon
 * <FileIcon name="App.tsx" isDir={false} />
 * * // 2. Render an open source directory folder node
 * <FileIcon name="components" isDir={true} isOpen={true} />
 * ```
 */
export const FileIcon: React.FC<FileIconProps> = ({ name, isDir, isOpen }) => {
  // Subscribe to changes in the workspace workbench layout preferences
  useSettingsStore(s => s.settings['workbench.iconTheme']);

  const icon = fileIconRegistry.getFileIcon(name, isDir, isOpen);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (icon.type === 'image') {
      // Decode locally hosted plugin asset links safely
      if (icon.value.startsWith('ms-storage://')) {
        
        // Match found inside memory buffers -> dispatch payload sync
        if (iconCache.has(icon.value)) {
          setImgSrc(iconCache.get(icon.value)!);
          return;
        }

        // Cache miss -> stream asset source directly from localized disk allocations
        fs.readFile(icon.value)
          .then(content => {
            if (!isMounted) return;
            
            let dataUri = '';
            if (icon.value.endsWith('.svg')) {
              // Raw-pass UTF-8 formats for precise vector alignments
              dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(content)}`;
            } else {
              // Convert binary PNG/JPEG structures straight to Base64 descriptors
              dataUri = `data:image/png;base64,${content}`; 
            }

            // Commit layout data to hot memory cache
            iconCache.set(icon.value, dataUri);
            setImgSrc(dataUri);
          })
          .catch(err => {
            console.error(`[FileIcon] Failed to load image asset path: ${icon.value}`, err);
          });
          
      } else {
        // Fallback capture pipeline routing directly to external HTTP/HTTPS cloud endpoints
        setImgSrc(icon.value);
      }
    }

    return () => { isMounted = false; };
  }, [icon.value, icon.type]);

  // ── Rendering Engine Core Matrix ──
  if (icon.type === 'image') {
    // Dispatch lightweight temporary placeholder tags until the asset thread releases the lock
    if (!imgSrc) {
      const fallbackClass = isDir ? 'ms-icon-default-folder' : 'ms-icon-default-file';
      return <div className={`ms-file-icon ${fallbackClass}`} style={{ width: 16, height: 16 }} />;
    }
    
    return (
      <img 
        src={imgSrc} 
        alt={name} 
        className="ms-file-icon-img" 
        style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0, display: 'inline-block' }} 
      />
    );
  }

  // Fallback to core class tokens (such as fallback codicon-based default layouts)
  return <div className={`ms-file-icon ${icon.value}`} style={{ width: 16, height: 16 }} />;
};