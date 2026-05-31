// src/core/extensionAPI/registry/FileIconRegistry.ts
import defaultThemeMap from '@/core/constants/defaultIconTheme';

/**
 * Interface definition for configuration schemas mapping structural workspace targets 
 * to unique string asset identification labels. Fully mirrors VS Code's material icon map structure.
 */
export interface IconThemeMap {
  /** Root catalog mapping abstract symbol identifiers to clear filesystem asset locations */
  iconDefinitions?: Record<string, { iconPath: string }>;
  /** Primary map binding localized explicit file syntax identifiers to internal symbol keys */
  fileExtensions?: Record<string, string>;
  /** Secondary or alternative design specification container tracking file suffix strings */
  extensions?: Record<string, string>; 
  /** High-precedence matching dictionary indexing standalone unique files (e.g., '.gitignore', 'package.json') */
  fileNames?: Record<string, string>;
  /** Folder categorization indices matching exact collection directory names */
  folderNames?: Record<string, string>;
  /** Alternate collection labels mapping state transformations across expanded paths */
  folderNamesExpanded?: Record<string, string>;
  /** Generic baseline symbol key assigned to file elements failing distinct lookups */
  file?: string;
  /** Generic baseline symbol key assigned to collection directories failing distinct lookups */
  folder?: string;
  /** Generic baseline symbol key assigned to active open directories failing distinct lookups */
  folderExpanded?: string;
  /** Explicit dictionary mapping engine-level language strings back to target icon keys */
  languageIds?: Record<string, string>;
  /** Relative or absolute root network address prefix path used to mount image nodes */
  basePath?: string; 
}

/**
 * Resolved icon payload contract dispatched downstream to render components.
 * Specifies whether a target identifier should generate a font style class string or mount an external source image.
 */
export interface ResolvedIcon {
  type: 'class' | 'image';
  value: string;
}

/**
 * IconThemeRegistry Orchestration Engine
 * Calculates, resolves, and manages contextual lookups translating raw file metrics 
 * (names, suffixes, open/closed states, programmatic languages) into structural visual assets.
 */
class IconThemeRegistry {
  private theme: IconThemeMap = { ...defaultThemeMap };
  private defaultFileClass = 'ms-icon-default-file';
  private defaultFolderClass = 'ms-icon-default-folder';
  private folderOpenClass = 'ms-icon-default-folder-open';

  /**
   * Initializes or hot-swaps the underlying target style layer map configuration.
   * Gracefully merges incoming structural customizations or reverts back to core default baselines.
   * 
   * @param newTheme Incoming schema structure mappings, or null to invoke system restoration cascades.
   */
  loadIconTheme(newTheme: IconThemeMap | null): void {
    if (!newTheme || !newTheme.iconDefinitions) {
      this.theme = newTheme ? { ...defaultThemeMap, ...newTheme } : JSON.parse(JSON.stringify(defaultThemeMap));
      return;
    }
    this.theme = newTheme;
  }

  /**
   * Resolves an internal configuration tracking identifier string to its final deployment asset metadata type.
   * Sanitizes relative locations and injects base platform network endpoint prefixes where necessary.
   */
  private resolveIdToIcon(id: string): ResolvedIcon {
    if (!id) return { type: 'class', value: this.defaultFileClass };
    
    if (this.theme.iconDefinitions && this.theme.iconDefinitions[id]) {
      let path = this.theme.iconDefinitions[id].iconPath;
      if (path.startsWith('./')) path = path.slice(2);
      if (this.theme.basePath) {
        return { type: 'image', value: `${this.theme.basePath}/${path}` };
      }
    }
    return { type: 'class', value: id };
  }

  /**
   * Primary translation query gateway evaluating structural file variables to derive final visual assets.
   * Executes cascading resolution tiers prioritizing name match rules before evaluating extension mappings.
   * 
   * @param fileName The raw base filename extracted from the physical target system.
   * @param isDirectory Flag specifying if the current node represents a collection folder element.
   * @param isOpen Optional flag setting structural state variations across folder elements.
   * @returns An asset routing payload specifying formatting requirements.
   */
  getFileIcon(fileName: string, isDirectory: boolean, isOpen: boolean = false): ResolvedIcon {
    const lowerName = fileName.toLowerCase();

    // ── 1. FOLDER RESOLUTION LOGIC ──
    if (isDirectory) {
      let folderId = '';
      const fNames = this.theme.folderNames || {};
      const fNamesExpanded = this.theme.folderNamesExpanded || {};

      if (isOpen && fNamesExpanded[lowerName]) folderId = fNamesExpanded[lowerName];
      else if (fNames[lowerName]) folderId = fNames[lowerName];
      else folderId = isOpen ? (this.theme.folderExpanded || 'folder-open') : (this.theme.folder || 'folder');

      // Fallback boundaries for lightweight icon themes without distinct image asset tracking
      if (!this.theme.iconDefinitions) {
         if (folderId === 'folder-open') return { type: 'class', value: this.folderOpenClass };
         if (folderId === 'folder') return { type: 'class', value: this.defaultFolderClass };
      }
      return this.resolveIdToIcon(folderId);
    }

    // ── 2. EXACT MATCH STANDALONE FILE NAME LOGIC ──
    const fileNames = this.theme.fileNames || {};
    if (fileNames[lowerName]) return this.resolveIdToIcon(fileNames[lowerName]);

    // ── 3. CASCADING EXTENSION EXTRACTION & LANGUAGE LOOKUP ──
    const exts = this.theme.fileExtensions || this.theme.extensions || {};
    const parts = lowerName.split('.');
    
    // Tier A: Intercept double-dot multi-extensions (e.g., '.test.tsx', '.blade.php')
    if (parts.length > 2) {
       const doubleExt = parts.slice(-2).join('.'); 
       if (exts[doubleExt]) return this.resolveIdToIcon(exts[doubleExt]);
    }
    
    const ext = parts.pop() || '';
    
    // Tier B: Standard Extension Verification Matches
    if (exts[ext]) return this.resolveIdToIcon(exts[ext]);
    if (exts['.' + ext]) return this.resolveIdToIcon(exts['.' + ext]);

    // Tier C: Native Language Identifier Schema Matching
    const langIds = this.theme.languageIds || {};
    if (langIds[ext]) return this.resolveIdToIcon(langIds[ext]);

    // Tier D: Smart Extension Interpolation Heuristics
    // Fallback dictionary mapping common file suffixes to canonical workspace language IDs.
    // Safeguards layout delivery when tracking themes miss structural definitions.
    const smartMap: Record<string, string> = {
        'js': 'javascript', 'jsx': 'react', 'ts': 'typescript', 'tsx': 'react_ts',
        'py': 'python', 'rb': 'ruby', 'html': 'html', 'css': 'css', 
        'json': 'json', 'md': 'markdown', 'sh': 'console', 'bash': 'console',
        'yml': 'yaml', 'xml': 'xml', 'csv': 'csv', 'svg': 'svg', 'cpp': 'cpp', 'c': 'c',
        'java': 'java', 'kt': 'kotlin'
    };
    
    const mappedLang = smartMap[ext];
    if (mappedLang) {
        if (langIds[mappedLang]) return this.resolveIdToIcon(langIds[mappedLang]);
        if (this.theme.iconDefinitions && this.theme.iconDefinitions[mappedLang]) {
            return this.resolveIdToIcon(mappedLang);
        }
    }

    // Tier E: Direct Identity Symbol Property Check
    if (this.theme.iconDefinitions && this.theme.iconDefinitions[ext]) {
        return this.resolveIdToIcon(ext);
    }

    // ── 4. DEFAULT FILE FALLBACK BOUNDARY ──
    const fileId = this.theme.file || 'file';
    if (!this.theme.iconDefinitions && fileId === 'file') {
        return { type: 'class', value: this.defaultFileClass };
    }
    return this.resolveIdToIcon(fileId);
  }

  /**
   * Resolves symbol references using direct programmatic language classification strings.
   * Utilized primarily by code elements, terminal panels, and tab components requiring quick indicators.
   * 
   * @param langId Target standard language tracking key (e.g., 'typescript').
   * @returns Resolved structural icon configurations.
   */
  getLanguageIcon(langId: string): ResolvedIcon {
    const lowerLangId = langId.toLowerCase();
    const iconId = this.theme.languageIds?.[lowerLangId] || (this.theme.file || 'file');
    
    if (!this.theme.iconDefinitions && iconId === 'file') {
        return { type: 'class', value: this.defaultFileClass };
    }
    return this.resolveIdToIcon(iconId);
  }
}

/**
 * Global singleton access provider managing application-wide workspace file tree visual iconography.
 */
export const fileIconRegistry = new IconThemeRegistry();
