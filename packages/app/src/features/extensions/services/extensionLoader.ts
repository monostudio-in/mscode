// src/features/extensions/services/extensionLoader.ts
import { fs } from '@/core/fileSystem';
import { parseJSONC } from '@/utils/jsoncUtils';

/**
 * String-safe comment stripper.
 * Handles // and block comments without corrupting strings like "http://..."
 */

export const loadExtensionJsonSafely = async (storeDir: string, fileName: string) => {
  const targetPath = (storeDir.startsWith('/') || storeDir.startsWith('file://'))
    ? `${storeDir}/${fileName}`
    : `ms-storage://${storeDir}/${fileName}`;
  
  try {
    const fileContent = await fs.readFile(targetPath);

    if (!fileContent || fileContent.trim() === '') {
      throw new Error(`Empty file: ${fileName}`);
    }

    // JSONC parser!
    return parseJSONC(fileContent);

  } catch (error: any) {
    console.error(`❌ [ExtensionLoader] Failed to load '${fileName}' from '${storeDir}'`);
    throw error;
  }
};



/**
 * Loads an image from the virtual file system safely as a Blob URL.
 * Avoids Base64 encoding overhead and prevents UTF-8 binary corruption.
 */
export const loadExtensionIconSafely = async (storeDir: string, iconPath: string): Promise<string> => {
  if (!iconPath) return '';

  const targetPath = (storeDir.startsWith('/') || storeDir.startsWith('file://'))
    ? `${storeDir}/${iconPath}`
    : `ms-storage://${storeDir}/${iconPath}`;

  try {
    const fileData = await fs.readFile(targetPath);

    const ext = iconPath.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext || 'png'}`;

    const blob = new Blob([fileData], { type: mimeType });

    return URL.createObjectURL(blob);
    
  } catch (error) {
    console.error(`❌ [ExtensionLoader] Failed to load icon: '${targetPath}'`, error);
    return '/assets/default-extension-icon.png'; 
  }
};


/**
 * Manifest Loader
 * Resolves the manifest file, prioritizing 'manifest.jsonc' over 'manifest.json'.
 */
export const loadManifestSafely = async (storeDir: string) => {
  try {
    // 1. Try to load JSONC first
    return await loadExtensionJsonSafely(storeDir, 'manifest.jsonc');
  } catch (err) {
    // 2. Fallback to standard JSON
    return await loadExtensionJsonSafely(storeDir, 'manifest.json');
  }
};