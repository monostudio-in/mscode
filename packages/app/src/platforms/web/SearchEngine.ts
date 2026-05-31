// src/platforms/web/SearchEngine.ts
import type { ISearchEngine, SearchOptions } from '@/core/services/searchService';
import type { SearchFileResult, SearchMatch } from '@/features/search/store/searchStore';
import { fs } from '@/core/fileSystem';

export class WebSearchEngine implements ISearchEngine {
  async search(options: SearchOptions): Promise<{ results: SearchFileResult[] }> {
    const results: SearchFileResult[] = [];
    const { basePath, query, isRegex, matchCase, wholeWord, ignoreDirs = [], ignoreExtensions = [] } = options;

    if (!query || !query.trim()) return { results: [] };

    let regexStr = isRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    if (wholeWord) regexStr = `\\b${regexStr}\\b`;
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(regexStr, flags);

    const MAX_MATCHES = 2000;
    let totalMatches = 0;

    const searchRecursive = async (currentPath: string) => {
      if (totalMatches >= MAX_MATCHES) return;

      try {
        const items = await fs.readDir(currentPath);
        
        for (const item of items) {
          if (item.isDirectory) {
            if (!ignoreDirs.includes(item.name)) {
              await searchRecursive(item.path);
            }
          } else {
            const lowerName = item.name.toLowerCase();
            const shouldIgnore = ignoreExtensions.some((ext: string) => lowerName.endsWith(ext));
            
            if (shouldIgnore) continue;

            const content = await fs.readFile(item.path);
            const lines = content.split('\n');
            const fileMatches: SearchMatch[] = [];

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              let match;
              regex.lastIndex = 0; 

              while ((match = regex.exec(line)) !== null) {
                if (match.index === regex.lastIndex) regex.lastIndex++;

                fileMatches.push({
                  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
                  line: i + 1,
                  column: match.index + 1,
                  matchStart: match.index,
                  matchLength: match[0].length,
                  preview: line.length > 150 ? line.substring(0, 150) + "..." : line
                });
                
                totalMatches++;
                if (totalMatches >= MAX_MATCHES) break;
              }
              if (totalMatches >= MAX_MATCHES) break;
            }

            if (fileMatches.length > 0) {
              let dirPath = item.path.substring(0, item.path.lastIndexOf('/'));
              dirPath = dirPath.replace(basePath, '~');
              if (dirPath === basePath || dirPath === '') dirPath = '~';

              results.push({
                filePath: item.path,
                fileName: item.name,
                dirPath: dirPath,
                expanded: true,
                matches: fileMatches
              });
            }
          }
        }
      } catch (e) {
        console.error("Web Search Error reading:", currentPath, e);
      }
    };

    await searchRecursive(basePath);
    return { results };
  }
}