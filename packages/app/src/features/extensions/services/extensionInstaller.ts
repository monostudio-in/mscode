// src/features/extensions/services/extensionInstaller.ts

import { Filesystem } from '@capacitor/filesystem';
import JSZip from 'jszip';
import { fs } from '@/core/fileSystem';
import type { Extension, ExtensionManifest } from '../types';
import { parseJSONC } from '@/utils/jsoncUtils';

/**
 * Parses and extracts a local, packaged application extension archive file directly 
 * into the sandbox system storage layer.
 *
 * @param localFilePath Source path pointing to the compressed asset bundle location.
 * @returns Resolves with the populated extension metadata and its isolated target storage directory.
 */
export const installExtensionFromLocal = async (
  localFilePath: string
): Promise<{ manifest: Extension; storeDir: string }> => {
  try {
    const fileResult = await Filesystem.readFile({ path: localFilePath });
    const base64Data = fileResult.data as string;

    const zip = await JSZip.loadAsync(base64Data, { base64: true });

    const manifestFile = zip.file('manifest.jsonc') || zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid .msxt package: manifest.json(c) is missing.');
    }

    const manifestStr = await manifestFile.async('string');
    const rawManifest = parseJSONC(manifestStr) as ExtensionManifest;

    const storeDir = `extensions/${rawManifest.id}`;
    const internalBasePath = `ms-storage://${storeDir}`;

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) {
        continue; 
      }
      const fileContent = await zipEntry.async('string');
      await fs.writeFile(`${internalBasePath}/${relativePath}`, fileContent);
    }

    // Hydrate raw manifest fields with contextual structural flags for internal catalog processing
    const completeExtension: Extension = {
      ...rawManifest,
      storeDir,
      downloads: 0,       
      rating: 0,          
      isBuiltIn: false,
      isVerified: false,  
      zipSize: 'Local'
    };

    return { manifest: completeExtension, storeDir };

  } catch (error: any) {
    throw new Error(`Failed to install extension: ${error.message}`);
  }
};

/**
 * Fetches a remote compressed distribution package over the network, streams the binary data buffer 
 * into memory, and inflates the file records to the sandbox storage layer.
 *
 * @param extension Targeted package entry record structure holding cloud catalog metadata records.
 * @returns Target structural subdirectory folder location path mapping.
 */
export const installExtensionFromCloud = async (extension: Extension): Promise<string> => {
  try {
    if (!extension.fileUrl) {
      throw new Error('Download URL is missing for this extension.');
    }

    // console.log(`☁ Downloading extension from: ${extension.fileUrl}`);
    
    const response = await fetch(extension.fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download from server. Status: ${response.status}`);
    }

    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);

    const storeDir = `extensions/${extension.id}`;
    const internalBasePath = `ms-storage://${storeDir}`;

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) {
        continue; 
      }
      
      const fileContent = await zipEntry.async('string');
      await fs.writeFile(`${internalBasePath}/${relativePath}`, fileContent);
    }

    // console.log(`✅ Extracted successfully to: ${storeDir}`);
    return storeDir;

  } catch (error: any) {
    console.error('Cloud Installation Error:', error);
    throw new Error(`Failed to install from cloud: ${error.message}`);
  }
};
