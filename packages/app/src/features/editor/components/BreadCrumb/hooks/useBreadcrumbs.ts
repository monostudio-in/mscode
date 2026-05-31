// src/features/editor/components/BreadCrumb/hooks/useBreadcrumbs.ts

import { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { symbolManager } from '@/core/symbols';
import type { DocumentSymbol } from '@/core/symbols/types';
import { useBreadcrumbStore } from '../store/breadcrumbStore';
import { useTabStore } from '@/store/tabStore';

/**
 * Hook for resolving and updating document path breadcrumbs.
 * Listens to active editor position matrices and builds a structural hierarchy 
 * from DocumentSymbols matching the current line offset.
 *
 * @param editor The active Monaco editor instance.
 * @param filePath Full context absolute file identifier path.
 * @param tabId Anchor token identifying the host editor tab lifecycle boundary.
 */
export const useBreadcrumbs = (
  editor: monaco.editor.IStandaloneCodeEditor | null, 
  filePath: string,
  tabId: string
) => {
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const isActive = activeTabId === tabId;

  useEffect(() => {
    // Avoid evaluating structural parsing tasks and emitting redundant store updates
    // if the corresponding editor viewport context is currently inactive.
    if (!editor || !isActive) return;

    const updateBreadcrumbs = async () => {
      const model = editor.getModel();
      if (!model) return;

      const position = editor.getPosition();
      if (!position) return;

      // Request current abstract syntax tree symbols cached for this specific code model
      const symbols = await symbolManager.getSymbols(model);
      const path: any[] = [{ name: filePath.split('/').pop() || '', kind: 'file' }];

      /**
       * Deep-traverses nested document structural symbols to find match layers containing the target line.
       */
      const findPath = (nodes: DocumentSymbol[], line: number) => {
        for (const node of nodes) {
          if (line >= node.range.startLineNumber && line <= node.range.endLineNumber) {
            path.push({
              name:       node.name,
              kind:       'symbol',
              symbolKind: node.kind,
              range:      node.range
            });
            if (node.children) {
              findPath(node.children, line);
            }
            break;
          }
        }
      };

      if (symbols) {
        findPath(symbols, position.lineNumber);
      }
      
      setBreadcrumbs(path);
    };

    // Listeners handling manual layout alterations and operational scope shifts
    const cursorDisposable = editor.onDidChangeCursorPosition(() => updateBreadcrumbs());
    const modelDisposable = editor.onDidChangeModel(() => updateBreadcrumbs());

    // Force initialization query immediately upon receiving active viewport focus indicators
    updateBreadcrumbs();

    return () => {
      cursorDisposable.dispose();
      modelDisposable.dispose();
    };
  }, [editor, filePath, isActive, setBreadcrumbs]);
};
