// src/core/services/symbolService.ts

import * as monaco from 'monaco-editor';
import { symbolManager } from '@/core/symbols';
import type { DocumentSymbol } from '@/core/symbols';

// ─── 1. STRUCTURAL TREE EXPLORATION LAYER ─────────────────────────────────────
/**
 * Resolves a hierarchical syntax structural representation tree used to map language 
 * assets inside structural outline component sidebars.
 * 
 * @param model Active Monaco target configuration document instance buffer.
 */
export const getSymbolTree = async (model: monaco.editor.ITextModel): Promise<DocumentSymbol[]> => {
  return await symbolManager.getSymbols(model);
};

// ─── 2. SEAMLESS SYMBOL FLATTENING UTILITIES ──────────────────────────────────
/**
 * Flattens nested document structural definitions into a single sequential index map.
 * Primarily designed to populate match queries inside search bars and command palettes.
 * 
 * @param model Active Monaco target configuration document instance buffer.
 */
export const getFlatSymbols = async (model: monaco.editor.ITextModel): Promise<DocumentSymbol[]> => {
  const tree = await symbolManager.getSymbols(model);
  const flat: DocumentSymbol[] = [];
  
  const flatten = (nodes: DocumentSymbol[], parentName?: string) => {
    for (const node of nodes) {
      node.containerName = parentName; 
      flat.push(node);
      if (node.children) {
        flatten(node.children, node.name);
      }
    }
  };
  
  flatten(tree);
  return flat;
};

// ─── 3. CONTEXTUAL BREADCRUMB RESOLUTION UTILITIES ───────────────────────────
/**
 * Traces hierarchical scope trees to pinpoint the path leading to specific lines.
 * Yields historical code tracking arrays used directly to construct breadcrumb items.
 * 
 * @param model Active Monaco target configuration document instance buffer.
 * @param lineNumber Position tracker mapping target layer constraints.
 * @returns Array tracking nested logical pathways (e.g., [ClassNode, MethodNode])
 */
export const getScopeStackAtPosition = async (
  model: monaco.editor.ITextModel, 
  lineNumber: number
): Promise<DocumentSymbol[]> => {
  const tree = await symbolManager.getSymbols(model);
  const stack: DocumentSymbol[] = [];

  const traverse = (nodes: DocumentSymbol[]) => {
    for (const node of nodes) {
      // Validate whether target context markers intersect with the target node's position ranges
      if (
        node.range.startLineNumber <= lineNumber && 
        (node.range.endLineNumber >= lineNumber || node.range.endLineNumber === node.range.startLineNumber)
      ) {
        stack.push(node);
        
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
        break; // Break execution loop once the absolute deepest context node matches criteria
      }
    }
  };

  traverse(tree);
  return stack;
};

// ─── 4. RUNTIME VIEWPORT RESOLUTION LAYER ──────────────────────────────────────
/**
 * Safely evaluates active Monaco instance groupings to isolate the specific text interface 
 * containing non-hidden, visible client screen dimensions.
 * 
 * @param fallbackEditor A fallback reference fallback instance used if viewports are uncalculated.
 */
export const getActiveEditor = (fallbackEditor?: any) => {
  const editors = monaco.editor.getEditors();
  return editors.find(e => (e.getDomNode()?.clientWidth || 0) > 0) || fallbackEditor;
};
