// src/features/extensions/api/extensionApi.ts

import type { Extension, ExtensionDetail, ExtensionContributions } from '../types';
import { loadExtensionJsonSafely , loadManifestSafely } from '../services/extensionLoader'; 
import { useExtensionStore } from '../store/extensionStore'; 
import { fs } from '@/core/fileSystem';
import { supabase } from '@/core/server/supabaseClient';

/**
 * Connects to the remote Supabase catalog repository to retrieve a paginated index 
 * of available plugins sorted by active downloads metadata metrics.
 *
 * @param page Zero-indexed sequential pointer matching current offset limits.
 * @param limit Total allocation size targeted per discrete pagination block.
 */
export const fetchExtensionRegistry = async (page: number = 0, limit: number = 10): Promise<Extension[]> => {
  try {
    console.log(`Fetching Marketplace data from Supabase (Page: ${page})...`);
    
    const from = page * limit;
    const to = from + limit - 1;
    
    const { data, error } = await supabase
      .from('extensions')
      .select('*')
      .order('downloads', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase fetch error:', error);
      return []; 
    }

    return data.map((ext: any) => {
      let downloadUrl = ext.file_url;
      if (ext.file_url && !ext.file_url.startsWith('http')) {
        const { data: urlData } = supabase.storage.from('extensions').getPublicUrl(ext.file_url);
        downloadUrl = urlData.publicUrl;
      }

      return {
        id: ext.id,
        name: ext.name,
        publisher: ext.publisher || 'Unknown',
        description: ext.description || '',
        version: ext.version || '1.0.0',
        category: ext.category || 'Other',
        tags: ext.tags || [],
        icon: ext.icon,
        iconColor: ext.icon_color,
        iconLetter: ext.icon_letter,
        main: ext.main,
        activates: ext.activates || [],
        readme: ext.readme,
        changelog: ext.changelog,
        license: ext.license,
        contributes: ext.contributes || {}, 
        storeDir: `extensions/${ext.id}`,
        isBuiltIn: ext.is_built_in || false,
        isVerified: ext.is_verified || false,
        downloads: ext.downloads || 0,
        rating: ext.rating || 0,
        zipSize: ext.zip_size,
        fileUrl: downloadUrl 
      };
    }) as Extension[];

  } catch (error) {
    console.error('Failed to fetch marketplace data:', error);
    return []; 
  }
};

/**
 * Resolves supplementary structural features schema configuration objects 
 * either raw or out of nested partition target sub-files.
 */
async function resolveContributionData(storeDir: string, data: any) {
  if (!data) return undefined;
  if (typeof data === 'string') {
    try {
      return await loadExtensionJsonSafely(storeDir, data); 
    } catch (err) {
      return undefined;
    }
  }
  return data;
}

/**
 * Sanitizes file extraction pipeline exceptions by catching read errors 
 * and supplying contextual structured default textual information.
 */
async function loadTextSafely(storeDir: string, filePath: string | undefined, fallbackText: string): Promise<string> {
  if (!filePath) return fallbackText;
  try {
    // const targetPath = `ms-storage://${storeDir}/${filePath}`;
    
    const targetPath = (storeDir.startsWith('/') || storeDir.startsWith('file://'))
      ? `${storeDir}/${filePath}`
      : `ms-storage://${storeDir}/${filePath}`;
      
    return await fs.readFile(targetPath);
  } catch (err) {
    return fallbackText;
  }
}

/**
 * Resolves explicit configuration definitions, structural contribution schema mappings, 
 * and localized human documentation structures for any individual extension item record.
 * Supports handling un-hydrated installations by fallback routing onto marketplace schema records.
 *
 * @param id Unique identification registry hash key.
 */
export const fetchExtensionDetail = async (id: string): Promise<ExtensionDetail> => {
  const manifest = useExtensionStore.getState().allExtensions.find(e => e.id === id);
  if (!manifest) throw new Error(`Extension not found: ${id}`);

  let manifestData: any = null;

  try {
    manifestData = await loadManifestSafely(manifest.storeDir);
  } catch (e) {
    console.log(`[ExtensionApi] Local manifest not found for ${id} (Probably not installed yet).`);
  }

  try {
    const rawContributions = manifestData?.contributes || manifest.contributes || {};
    
    const resolvedConfig = await resolveContributionData(manifest.storeDir, rawContributions.configuration);
    const resolvedLanguages = await resolveContributionData(manifest.storeDir, rawContributions.languages);

    const contributions: ExtensionContributions = {
      ...rawContributions,
      configuration: resolvedConfig || {},
      languages: resolvedLanguages || []
    };
    
    /** Type guard to distinguish loaded raw document records from relative file addresses */
    const isRealMarkdown = (text: string | undefined): text is string => 
      typeof text === 'string' && text.length > 25 && text.includes(' ');

    const readmeStr = isRealMarkdown(manifest.readme)
      ? manifest.readme 
      : await loadTextSafely(manifest.storeDir, manifestData?.readme, `# ${manifest.name}\n\nDocumentation coming soon.`);

    const changelogStr = isRealMarkdown(manifest.changelog)
      ? manifest.changelog
      : await loadTextSafely(manifest.storeDir, manifestData?.changelog, '# Changelog\n\nNo changelog provided.');

    const licenseStr = isRealMarkdown(manifest.license)
      ? manifest.license
      : await loadTextSafely(manifest.storeDir, manifestData?.license, 'No license provided.');
      
    return { manifest, contributions, readme: readmeStr, changelog: changelogStr, license: licenseStr };
    
  } catch (err) {
    console.error(`[ExtensionApi] Error formatting details for ${id}`, err);
    return { 
      manifest, 
      contributions: {}, 
      readme: `# ${manifest.name}\n\nError loading documentation.`, 
      changelog: 'Error loading changelog.',
      license: 'Error loading license.'
    };
  }
};
