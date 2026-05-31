// src/core/services/lsp/LspDocumentManager.ts

import * as monaco from 'monaco-editor';
import type { LspState } from './types';
import { sendNotify } from './LspTransport';
import { toLspUri, getDocUri } from './utils/uriHelpers';

/**
 * Associates an in-memory Monaco TextModel instance with a concrete filesystem URI address.
 * Typically dispatched from tab lifecycle activations (`useLspSync`) when documents mount.
 * 
 * @param state The central language server operational state cache context.
 * @param model Target Monaco document tracking model instance.
 * @param realFileUri Absolute peripheral file storage route address string.
 */
export function registerModelUri(
  state: LspState,
  model: monaco.editor.ITextModel,
  realFileUri: string,
): void {
  const lspUri = toLspUri(realFileUri);
  state.modelUriMap.set(model.id, lspUri);
  console.log(`[LSP] Workspace URI association established: ${model.id} → ${lspUri}`);
}

/**
 * Tears down document context maps upon tab deletion or model disposal loops.
 * Transmits a `textDocument/didClose` tracking notification payload to flush active language server layers.
 * 
 * @param state The central language server operational state cache context.
 * @param model Target Monaco document tracking model instance.
 */
export function unregisterModelUri(
  state: LspState,
  model: monaco.editor.ITextModel,
): void {
  const uri = state.modelUriMap.get(model.id);
  if (!uri) return;

  if (state.openedUris.has(uri)) {
    sendNotify(state, 'textDocument/didClose', { textDocument: { uri } });
    console.log(`[LSP] Dispatched explicit didClose signal for: ${uri}`);
  }
  
  state.openedUris.delete(uri);
  state.modelUriMap.delete(model.id);
}

/**
 * Signals language server ports when switching between document tabs or pulling up fresh source paths.
 * Automatically switches execution tracks between synchronization vectors (`textDocument/didOpen` 
 * vs. full text frame buffers via `textDocument/didChange`).
 * 
 * @param state The central language server operational state cache context.
 * @param model Target Monaco document tracking model instance.
 */
export function notifyDocumentOpen(
  state: LspState,
  model: monaco.editor.ITextModel,
): void {
  if (!state.initialized) return;
  if (model.getLanguageId() !== state.languageId) return;

  const uri = getDocUri(model, state);

  // ── RE-SYNCHRONIZATION TIER ──
  // If the resource is already tracked, pipe full buffer deltas across open channels
  if (state.openedUris.has(uri)) {
    sendNotify(state, 'textDocument/didChange', {
      textDocument: { uri, version: model.getVersionId() },
      contentChanges: [{ text: model.getValue() }],
    });
    console.log(`[LSP] Document stream sync updated via didChange: ${uri}`);
    return;
  }

  // ── INITIAL ACCESS TIER ──
  // Dispatch structural allocation signatures for fresh tracking sequences
  sendNotify(state, 'textDocument/didOpen', {
    textDocument: {
      uri,
      languageId: state.languageId,
      version: model.getVersionId(),
      text: model.getValue(),
    },
  });
  
  state.openedUris.add(uri);
  console.log(`[LSP] Document stream tracking initialized via didOpen: ${uri}`);
}

/**
 * Sequentially sweeps through active Monaco editor instances following a connection 
 * initialization handshake to synchronize environment buffers with language servers.
 * 
 * @param state The central language server operational state cache context.
 */
export function syncOpenEditors(state: LspState): void {
  const models = monaco.editor.getModels();
  console.log(`[LSP] Initializing compilation sync across ${models.length} active models...`);
  
  for (const model of models) {
    if (model.getLanguageId() !== state.languageId) continue;
    notifyDocumentOpen(state, model);
  }
}
