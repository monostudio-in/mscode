// src/core/services/userSnippetsService.ts

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { useTabStore } from '@/store/tabStore';
import { snippets as snippetRegistry } from '@/core/extensionAPI/registry/snippetRegistry';
import { useOutputStore } from '@/features/termis/components/output/store/outputStore';

const BASE_LANG_DIR = 'storage/user/languages';

/**
 * Dispatches diagnostic tracing information simultaneously to the development console 
 * and the application's exposed running extension host background panel output streaming buffer.
 */
const logSnippet = (msg: string, isError = false) => {
  const formatted = `[UserSnippets] ${msg}`;
  if (isError) {
    console.error(formatted);
  } else {
    console.log(formatted);
  }
  
  try { 
    const outputStore = useOutputStore.getState();
    outputStore.createChannel('Extension Host');
    outputStore.appendLog('Extension Host', `${formatted}\n`);
  } catch (e) {
    // Structural Guard: Fail silently if the Extension Host output window channel is uninitialized
  }
};

/**
 * String-literal safe regular-expression comment stripper pattern.
 * Captures string literals intact prior to stripping out block and single-line comment tags.
 * This guarantees URL syntax paths like "http://" or custom regex strings remain uncorrupted.
 */
function stripJsonComments(raw: string): string {
  const stripped = raw.replace(
    /("(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (_match, str) => str ? str : ''
  );
  logSnippet(`扫 Comment strip: ${raw.length} → ${stripped.length} chars`);
  return stripped;
}

export const userSnippetsService = {

  /**
   * Initializes workspace paths and brings custom language specific snippets directly into the editor viewport.
   * Auto-provisions baseline templates if missing prior to triggering document tab creation.
   * * @param languageId Context tracking system identifier key (e.g., 'javascript', 'cpp').
   */
  openSnippetFile: async (languageId: string) => {
    const langDir = `${BASE_LANG_DIR}/${languageId}`;
    const filePath = `${langDir}/snippets.json`;

    logSnippet(`📂 Opening snippet file for language: '${languageId}'`);
    logSnippet(`   Target path: ${filePath}`);

    try {
      // Assert directory path tree foundations prior to structural initialization
      await Filesystem.mkdir({
        path: langDir,
        directory: Directory.Data,
        recursive: true
      }).catch(() => {
        logSnippet(`   mkdir skipped (already exists or no-op)`);
      });

      let exists = true;
      try {
        await Filesystem.stat({ path: filePath, directory: Directory.Data });
        logSnippet(`   File already exists, skipping template creation.`);
      } catch (e) {
        exists = false;
        logSnippet(`   File not found, creating template...`);
      }

      if (!exists) {
        const defaultContent = `{
    // Place your snippets for ${languageId} here.
    // Each snippet has a prefix, body and description.
    // The prefix triggers the snippet; body is inserted.
    //
    // Example:
    // "Print to console": {
    //     "prefix": "log",
    //     "body": [
    //         "console.log('$1');",
    //         "$2"
    //     ],
    //     "description": "Log output to console"
    // }
}`;
        await Filesystem.writeFile({
          path: filePath,
          data: defaultContent,
          directory: Directory.Data,
          encoding: Encoding.UTF8
        });
        logSnippet(`   ✅ Template created at: ${filePath}`);
      }

      const fullTabPath = `ms-storage://${filePath}`;
      logSnippet(`   Opening tab: ${fullTabPath}`);

      // Dispatch tracking registration payload right into active workspace tab models
      useTabStore.getState().addTab({
        id: fullTabPath,
        type: 'code',
        title: `${languageId}.snippets.json`,
        filePath: fullTabPath,
        icon: 'json'
      });

    } catch (error: any) {
      logSnippet(`Failed to open snippet file for '${languageId}': ${error.message}`, true);
    }
  },

  /**
   * Discovers, reads, and processes local language customization files.
   * Extracts clean syntax records past string block comment lines to register macros into Intellisense maps.
   * * @param languageId Context tracking system identifier key (e.g., 'javascript', 'cpp').
   */
  loadSnippetsForLanguage: async (languageId: string) => {
    const filePath = `${BASE_LANG_DIR}/${languageId}/snippets.json`;

    logSnippet(`🔍 Attempting to load user snippets for: '${languageId}'`);
    logSnippet(`   Looking at: ${filePath}`);

    try {
      await Filesystem.stat({ path: filePath, directory: Directory.Data });
    } catch (e) {
      logSnippet(`   No user snippet file found for '${languageId}', skipping.`);
      return;
    }

    try {
      const contents = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      const rawData = typeof contents.data === 'string' ? contents.data : '';
      logSnippet(`   Raw file size: ${rawData.length} chars`);

      if (rawData.trim() === '' || rawData.trim() === '{}') {
        logSnippet(`   File is empty or blank object, nothing to register.`);
        return;
      }

      let cleanJson: string;
      try {
        cleanJson = stripJsonComments(rawData);
      } catch (stripErr: any) {
        logSnippet(`   ❌ Comment stripping failed: ${stripErr.message}`, true);
        return;
      }

      logSnippet(`   Attempting JSON.parse...`);
      let parsed: Record<string, any>;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (parseErr: any) {
        logSnippet(`   ❌ JSON.parse failed: ${parseErr.message}`, true);
        logSnippet(`   First 200 chars after strip: ${cleanJson.substring(0, 200)}`, true);
        return;
      }

      const count = Object.keys(parsed).length;
      logSnippet(`   Parsed ${count} snippet(s).`);

      if (count === 0) {
        logSnippet(`   File has no snippets defined, skipping registration.`);
        return;
      }

      // Log structured macro details for downstream debug traces
      Object.entries(parsed).forEach(([name, snippet]: [string, any]) => {
        const prefixes = Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix];
        logSnippet(`   → Snippet: "${name}" | prefix: [${prefixes.join(', ')}]`);
      });

      // Submit parsed definitions to the engine's centralized compilation token registries
      snippetRegistry.registerSnippets(languageId, parsed, 'user');
      logSnippet(`✅ Successfully registered ${count} user snippet(s) for '${languageId}'.`);

    } catch (error: any) {
      logSnippet(`❌ Unexpected error loading snippets for '${languageId}': ${error.message}`, true);
    }
  }
};