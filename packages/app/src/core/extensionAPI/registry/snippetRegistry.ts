// src/core/extensionAPI/registry/snippetRegistry.ts
import * as monaco from 'monaco-editor';

/**
 * Utility helper evaluating file paths against glob patterns.
 * Supports standard syntax markers including double-star globstars (**).
 */
function matchGlob(str: string, pattern: string): boolean {
  const cleanPath = str.startsWith('/') ? str.substring(1) : str;
  const re = new RegExp(
    '^' + pattern.replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*') + '$'
  );
  return re.test(cleanPath) || re.test(str);
}

/**
 * SnippetRegistry Subsystem Engine
 * Centralizes management, isolation, contextual parsing, and sorting of language completions.
 * Connects directly with the Monaco Editor engine via custom structural completion providers.
 */
class SnippetRegistry {
  /** Map tracking nested scopes: [languageId] -> [sourceNamespace] -> [snippetConfigurations] */
  private snippetsMap: Record<string, Record<string, Record<string, any>>> = {};
  /** Set managing activated Monaco runtime language provider instances to enforce idempotency */
  private registeredLanguages = new Set<string>();

  /**
   * Mounts a group of syntax snippet descriptors into the targeted language workspace environment.
   * Lazily spins up structural Monaco Completion Providers when encountering new language keys.
   * 
   * @param languageId Standard Monaco language code mapping destination context (e.g., 'typescript').
   * @param snippetsObj Dictionary of configurations defining keywords, snippet bodies, and descriptions.
   * @param source Tracking origin identity boundary used for grouping and sorting weights.
   * @returns Cleanup resource object wrapper containing explicit disposal handlers.
   */
  registerSnippets(
    languageId: string,
    snippetsObj: Record<string, any>,
    source: string = 'default'
  ): { dispose: () => void } {
    const count = Object.keys(snippetsObj).length;
    console.log(`⚙ [SnippetRegistry] registerSnippets called`);
    console.log(`   Language  : '${languageId}'`);
    console.log(`   Source    : '${source}'`);
    console.log(`   Count     : ${count}`);

    if (count === 0) {
      console.warn(`⚠️ [SnippetRegistry] Empty snippetsObj for '${languageId}' from '${source}', skipping.`);
      return { dispose: () => {} };
    }

    if (!this.snippetsMap[languageId]) {
      this.snippetsMap[languageId] = {};
      console.log(`   Created new language bucket for '${languageId}'.`);
    }

    const existing = this.snippetsMap[languageId][source];
    if (existing) {
      console.log(`   ⚠️ Overwriting existing '${source}' snippets for '${languageId}' (had ${Object.keys(existing).length} entries).`);
    }

    this.snippetsMap[languageId][source] = snippetsObj;

    const allSources = Object.keys(this.snippetsMap[languageId]);
    console.log(`   Current sources for '${languageId}': [${allSources.join(', ')}]`);

    // Guard boundary: reuse existing providers if active while updating underlying memory stores in-place
    if (this.registeredLanguages.has(languageId)) {
      console.log(`   Provider already registered for '${languageId}', data updated in-place.`);
      return { 
        dispose: () => {
          if (this.snippetsMap[languageId] && this.snippetsMap[languageId][source]) {
            delete this.snippetsMap[languageId][source];
          }
        } 
      };
    }

    this.registeredLanguages.add(languageId);
    console.log(`   Registering new Monaco CompletionProvider for '${languageId}'...`);

    const provider = monaco.languages.registerCompletionItemProvider(languageId, {
      provideCompletionItems: (model, position) => {
        try {
          const wordUntil = model.getWordUntilPosition(position);
          const wordAt = model.getWordAtPosition(position);
          const currentPath = model.uri.path;

          // ── TIER 1: THE CONTEXT ANALYZER ──
          // Parses upstream tokens sequentially behind the cursor position to infer 
          // deep current structural states like literal strings or method parameter boundaries.
          const lineContent = model.getLineContent(position.lineNumber);
          const textBeforeCursor = lineContent.substring(0, position.column - 1);

          let inString = false;
          let quoteChar = null;
          let openParens = 0;

          for (let i = 0; i < textBeforeCursor.length; i++) {
            const char = textBeforeCursor[i];
            
            // Toggle state boundaries when intercepting quotes, escaping backslash characters securely
            if ((char === '"' || char === "'" || char === '`') && textBeforeCursor[i - 1] !== '\\') {
              if (!inString) { 
                inString = true; 
                quoteChar = char; 
              } else if (quoteChar === char) { 
                inString = false; 
                quoteChar = null; 
              }
            }
            
            // Track nesting levels inside functional execution blocks while outside string literals
            if (!inString) {
              if (char === '(') openParens++;
              if (char === ')') openParens--;
            }
          }

          const inParameter = openParens > 0;

          // Structural Interception Guard: Suppress custom snippets while typing within text strings.
          // Yields execution priority back to downstream LSP tools for context-sensitive strings.
          if (inString) {
            return { suggestions: [], incomplete: false };
          }

          const range = {
            insert: { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: wordUntil.startColumn, endColumn: position.column },
            replace: { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: wordUntil.startColumn, endColumn: wordAt ? wordAt.endColumn : position.column }
          };

          const formattedSnippets: monaco.languages.CompletionItem[] = [];
          const sourceGroups = this.snippetsMap[languageId] || {};

          for (const [sourceName, snippetsObj] of Object.entries(sourceGroups)) {
            for (const [name, snippet] of Object.entries(snippetsObj)) {
              
              // Validate dynamic file include boundaries
              if (snippet.include && Array.isArray(snippet.include)) {
                if (!snippet.include.some((p: string) => matchGlob(currentPath, p))) continue;
              }
              // Validate dynamic file exclude boundaries
              if (snippet.exclude && Array.isArray(snippet.exclude)) {
                if (snippet.exclude.some((p: string) => matchGlob(currentPath, p))) continue;
              }

              const prefixes = Array.isArray(snippet.prefix) ? snippet.prefix : [snippet.prefix];
              const bodyStr = Array.isArray(snippet.body) ? snippet.body.join('\n') : (snippet.body || '');

              // ── TIER 2: DYNAMIC PRIORITY WEIGHT CALCULATOR ──
              // Contextually repositions custom structures within completion lists using priority string weighting.
              // Demotes items behind parameters ('zzz_') while prioritizing explicit user-configured blocks ('000_').
              const basePriority = inParameter ? 'zzz_snippet_' : (sourceName === 'user' ? '000_' : '001_');

              for (const prefix of prefixes) {
                if (!prefix) continue; 

                formattedSnippets.push({
                  label: prefix,
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  documentation: `${snippet.description || name}\n\nSource: ${sourceName === 'user' ? 'User Snippet' : sourceName}`,
                  insertText: bodyStr,
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  sortText: basePriority + prefix,
                  filterText: prefix,
                  range: range
                });
              }
            }
          }

          // ── TIER 3: TEXT TOKENIZER LOOKUP FALLBACK ──
          // Automatically scrapes, filters, and packages fallback words from document scopes 
          // to generate dynamic local terminology completions.
          const textContent = model.getValue();
          const uniqueWords = Array.from(new Set(textContent.match(/\b[a-zA-Z_]\w*\b/g) || []));
          const localWords = uniqueWords
            .filter(w => w !== wordUntil.word && w.length > 1) 
            .map(w => ({
              label: w, 
              kind: monaco.languages.CompletionItemKind.Text, 
              insertText: w, 
              range: range, 
              sortText: (inParameter ? 'zzz_word_' : 'zzz_') + w,
              filterText: w 
            }));

          return { suggestions: [...formattedSnippets, ...localWords], incomplete: false };
            
        } catch (err) {
          console.error(`❌ [SnippetRegistry] Crash during completion evaluation:`, err);
          return { suggestions: [], incomplete: false };
        }
      }
    });

    console.log(`   ✅ Monaco provider registered for '${languageId}'.`);
    // return { dispose: () => provider.dispose() };
    return { 
      dispose: () => {
        // Clean memory AND dispose Monaco provider
        if (this.snippetsMap[languageId] && this.snippetsMap[languageId][source]) {
          delete this.snippetsMap[languageId][source];
        }
        provider.dispose();
      }
    }
    
    
    
  }
}

/**
 * Shared singleton registry provider managing framework completion providers and context snippets.
 */
export const snippets = new SnippetRegistry();
