// src/features/output/hooks/useOutputEditor.ts

import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useOutputStore, getOrCreateModel } from '../store/outputStore';

/**
 * Initializes and registers the structural declarative grammar tokenization specs 
 * and matching visual color theme profiles for standard system output log feeds.
 */
const setupLogLanguage = (): void => {
  if (monaco.languages.getLanguages().some(l => l.id === 'log')) return;
  
  monaco.languages.register({ id: 'log' });
  
  monaco.languages.setMonarchTokensProvider('log', {
    tokenizer: {
      root: [
        // 1. Match ISO and Timestamp Blocks
        [/\[?\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}(\.\d{3}Z?)?\]?/, 'log-date'],
        [/\[\d{2}:\d{2}:\d{2}\]/, 'log-date'],

        // 2. Severity Classification Patterns
        [/\[?(ERROR|ERR|FAIL|FATAL)\]?/i, 'log-error'],
        [/\[?(WARNING|WARN)\]?/i, 'log-warn'],
        [/\[?(INFO|NOTICE)\]?/i, 'log-info'],
        [/\[?(DEBUG)\]?/i, 'log-debug'],
        [/\[?(TRACE)\]?/i, 'log-trace'],
        
        // Runtime Framework Boundaries
        [/\[?(Running|Done)\]?/i, 'log-success'],

        // 3. Network and Absolute System File Vectors
        [/(https?|ws|file):\/\/[^\s]+/, 'log-link'],
        [/((\/|\\|[a-zA-Z]:\\)[^\s]+\.\w+)/, 'log-path'],

        // 4. Literal Expressions
        [/"([^"\\]|\\.)*"/, 'log-string'],
        [/'([^'\\]|\\.)*'/, 'log-string'],

        // 5. Numeric Entities
        [/\b\d+(\.\d+)?\b/, 'log-number'],

        // 6. Primitive States & Operational System Keywords
        [/\b(true|false|null|undefined|success|ok)\b/i, 'log-keyword'],
      ]
    }
  });

  monaco.editor.defineTheme('log-color-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'log-error',   foreground: 'f44747', fontStyle: 'bold' },
      { token: 'log-warn',    foreground: 'cca700', fontStyle: 'bold' },
      { token: 'log-info',    foreground: '3794ff' },
      { token: 'log-debug',   foreground: 'b5cea8' },
      { token: 'log-trace',   foreground: '888888' },
      { token: 'log-success', foreground: '1b8ef8', fontStyle: 'bold' },
      { token: 'log-date',    foreground: '888888' },
      { token: 'log-link',    foreground: '4ec9b0', fontStyle: 'underline' },
      { token: 'log-path',    foreground: '4ec9b0' },
      { token: 'log-string',  foreground: 'ce9178' },
      { token: 'log-number',  foreground: 'b5cea8' },
      { token: 'log-keyword', foreground: '569cd6', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
    }
  });
};

/**
 * Custom React hook establishing data pipelines, touch response systems, 
 * and anchor snapping thresholds for a read-only Monaco layout tracking output buffers.
 * 
 * @param containerRef Target HTML parent wrapper node hosting the editor canvas surface.
 * @returns Ref handles monitoring instances and terminal anchor states.
 */
export function useOutputEditor(containerRef: React.RefObject<HTMLDivElement | null>) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const autoScrollRef = useRef(true); 
  const activeChannel = useOutputStore(s => s.activeChannel);

  useEffect(() => {
    if (!containerRef.current) return;

    setupLogLanguage();

    const editor = monaco.editor.create(containerRef.current, {
      model: getOrCreateModel(activeChannel),
      readOnly: true,
      language: 'log',
      theme: 'log-color-theme', 
      lineNumbers: 'off',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      folding: false,
      renderLineHighlight: 'none',
      fontSize: 12,
      fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      contextmenu: true,
      domReadOnly: true,
      automaticLayout: true,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'hidden'
      }
    });

    editorRef.current = editor;

    const scrollDisposable = editor.onDidScrollChange(e => {
      const totalHeight = editor.getScrollHeight();
      const visibleBot = e.scrollTop + editor.getLayoutInfo().height;
      autoScrollRef.current = totalHeight - visibleBot < 50; 
    });

    // Handle high-performance touch interception mechanisms across virtual panels
    const domNode = containerRef.current;
    let lastY = 0;
    let isTouching = false;

    const onTouchStart = (e: TouchEvent) => {
      isTouching = true;
      lastY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching) return;
      e.preventDefault();
      e.stopPropagation();

      const currentY = e.touches[0].clientY;
      const deltaY = lastY - currentY;
      lastY = currentY;

      editor.setScrollTop(editor.getScrollTop() + deltaY);
    };

    const onTouchEnd = () => {
      isTouching = false;
    };

    domNode.addEventListener('touchstart', onTouchStart, { passive: false });
    domNode.addEventListener('touchmove', onTouchMove, { passive: false });
    domNode.addEventListener('touchend', onTouchEnd);
    domNode.addEventListener('touchcancel', onTouchEnd);

    return () => {
      scrollDisposable.dispose();
      editor.dispose();
      
      domNode.removeEventListener('touchstart', onTouchStart);
      domNode.removeEventListener('touchmove', onTouchMove);
      domNode.removeEventListener('touchend', onTouchEnd);
      domNode.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = getOrCreateModel(activeChannel);
    editor.setModel(model);
    
    if (autoScrollRef.current) {
      editor.revealLine(model.getLineCount());
    }
  }, [activeChannel]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = getOrCreateModel(activeChannel);

    const disposable = model.onDidChangeContent(() => {
      if (!autoScrollRef.current) return;
      setTimeout(() => {
        editor.revealLine(model.getLineCount());
      }, 0);
    });

    return () => disposable.dispose();
  }, [activeChannel]);

  return { editorRef, autoScrollRef };
}
