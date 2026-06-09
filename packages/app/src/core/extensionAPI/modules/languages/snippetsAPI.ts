// src/core/extensionAPI/modules/languages/snippetsAPI.ts

import { snippets as snippetRegistry } from '@/core/extensionAPI/registry/snippetRegistry';

export const createSnippetsAPI = (extId: string) => ({
  /**
   * Register code snippets for a language.
   * `snippetData` should follow the VS Code snippet JSON format.
   *
   * @example
   * mscode.languages.registerSnippets('rust', {
   * 'println macro': {
   * prefix: 'println',
   * body:   ['println!("$1");'],
   * description: 'Print to stdout',
   * }
   * });
   */
  registerSnippets: (languageId: string, snippetData: any) => {
    return snippetRegistry.registerSnippets(languageId, snippetData, extId);
  },
});


// Example :
/* 
```javascript
// 1. create collection
const myLinter = mscode.languages.createDiagnosticCollection('my-awesome-linter');

// 2. scan code & set error
myLinter.set('file:///sdcard/project/main.js', [
  {
    severity: 8, // Error (Monaco Severity enum)
    message: "Missing semicolon!",
    startLineNumber: 10,
    startColumn: 5,
    endLineNumber: 10,
    endColumn: 6
  }
]);

// 3. other extension can track it
mscode.languages.onDidChangeDiagnostics((allProblems) => {
  console.log(`Total problems in project: ${allProblems.length}`);
});
```
*/