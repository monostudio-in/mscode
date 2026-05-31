// src/features/editor/monaco/monacoSetup.ts
//
// Responsibility: Configure Monaco loader to use local node_modules
// instead of CDN. Must be imported once, before any <Editor /> renders.
//
// Why: Our custom touch patches live inside local node_modules/monaco-editor.
// CDN would load an unpatched version and break touch handling.

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Import our custom symbol bootstrapper
import { bootstrapSymbolProviders } from '@/core/symbols'; 

loader.config({ monaco });

(window as any).MonacoEnvironment = {
  getWorker: function (_moduleId: string, label: string) {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    
    return new editorWorker();
  }
};

(window as any).MONACO = monaco;

// INITIALIZE ALL CUSTOM SYMBOL PROVIDERS (HTML, CSS, Rust, Python, etc.)
bootstrapSymbolProviders();