// src/features/editor/hooks/useStickyHighlight.ts

import { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { symbolManager } from '@/core/symbols';
import type { DocumentSymbol } from '@/core/symbols';

/**
 * Hook that tracks the active structural scopes (classes, functions, objects) 
 * matching the user's cursor or viewport scroll position. It isolates the line 
 * elements inside Monaco's sticky container scroll layer and applies custom high-visibility 
 * CSS classes (`.ms-active-sticky-line` and `.ms-exact-bracket-highlight`) directly onto 
 * the target token nodes.
 *
 * @param editor Root host code editor view structure context.
 */
export const useStickyHighlight = (editor: monaco.editor.IStandaloneCodeEditor | null) => {

  useEffect(() => {
    if (!editor) return;

    const domNode = editor.getDomNode();
    if (!domNode) return;

    // Safe environment-agnostic timeout handle wrapper
    let timeout: ReturnType<typeof setTimeout>;

    /**
     * Resolves the matching semantic block and handles updating the DOM 
     * nodes in the sticky header overlay.
     */
    const applyHighlight = async (position: monaco.Position) => {
      const model = editor.getModel();
      if (!model) return;

      const currentLine = position.lineNumber;
      const symbols = await symbolManager.getSymbols(model);

      /**
       * Recursively steps through nested symbol definitions to match the exact 
       * terminal leaf block containing the requested line coordinates.
       */
      const findMatchingScope = (nodes: DocumentSymbol[], line: number): DocumentSymbol | null => {
        let match: DocumentSymbol | null = null;
        for (const node of nodes) {
          if (line === node.range.startLineNumber || line === node.range.endLineNumber) {
            match = node;
          }
          if (node.children && node.children.length > 0) {
            const childMatch = findMatchingScope(node.children, line);
            if (childMatch) {
              match = childMatch; 
            }
          }
        }
        return match;
      };

      const matchedSymbol = findMatchingScope(symbols || [], currentLine);

      //  Flush existing highlight states across sticky element containers
      domNode.querySelectorAll('.ms-active-sticky-line').forEach(el => el.classList.remove('ms-active-sticky-line'));
      domNode.querySelectorAll('.ms-exact-bracket-highlight').forEach(el => el.classList.remove('ms-exact-bracket-highlight'));

      // Project modified focus flags onto active targets
      if (matchedSymbol && matchedSymbol.range.startLineNumber !== matchedSymbol.range.endLineNumber) {
        const targetLine = matchedSymbol.range.startLineNumber;
        const stickyLineEl = domNode.querySelector(`.sticky-widget .stickyLine${targetLine}`);
        
        if (stickyLineEl) {
          stickyLineEl.classList.add('ms-active-sticky-line');

          // Isolate raw un-nested text spans to prevent parent-child styling bleeding
          const spans = Array.from(stickyLineEl.querySelectorAll('span')).filter(s => s.children.length === 0);
          let exactTarget: HTMLElement | null = null;

          // Scanning Right-to-Left for structural block openers
          for (let i = spans.length - 1; i >= 0; i--) {
            if (spans[i].textContent?.includes('{')) {
              exactTarget = spans[i];
              break;
            }
          }

          // Fallback: Scanning Left-to-Right for markup/tag boundaries
          if (!exactTarget) {
            for (let i = 0; i < spans.length; i++) {
              if (spans[i].textContent?.includes('<')) {
                exactTarget = spans[i];
                break;
              }
            }
          }

          if (exactTarget) {
            exactTarget.classList.add('ms-exact-bracket-highlight');
          }
        }
      }
    };

    const handleCursorMove = (e: monaco.editor.ICursorPositionChangedEvent) => {
      clearTimeout(timeout);
      // Brief layout buffer trailing window execution to ensure internal Monaco elements are painted
      timeout = setTimeout(() => applyHighlight(e.position), 50); 
    };

    const handleScroll = () => {
      const pos = editor.getPosition();
      if (pos) {
        clearTimeout(timeout);
        timeout = setTimeout(() => applyHighlight(pos), 50);
      }
    };

    const cursorDisposable = editor.onDidChangeCursorPosition(handleCursorMove);
    const scrollDisposable = editor.onDidScrollChange(handleScroll);

    return () => {
      cursorDisposable.dispose();
      scrollDisposable.dispose();
      clearTimeout(timeout);
      
      // Clean up mutations on breakdown lifecycle passes
      domNode.querySelectorAll('.ms-active-sticky-line').forEach(el => el.classList.remove('ms-active-sticky-line'));
      domNode.querySelectorAll('.ms-exact-bracket-highlight').forEach(el => el.classList.remove('ms-exact-bracket-highlight'));
    };
  }, [editor]);
};
