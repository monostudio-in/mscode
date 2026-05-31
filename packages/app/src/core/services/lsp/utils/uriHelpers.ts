// src/core/services/lsp/utils/uriHelpers.ts

import * as monaco from 'monaco-editor';
import type { LspState } from '../types';

/**
 * Normalizes absolute Android file paths into LSP-compliant URI addresses.
 * Cleans up double-slash path segments and converts storage boundaries:
 * `/storage/emulated/0/...` translates back into standard `file:///sdcard/...` blocks.
 * 
 * @param uri Raw destination address string received from the file system hooks.
 */
export function toLspUri(uri: string): string {
  let clean = uri.replace(/([^:/])\/{2,}/g, '$1/');
  clean = clean.replace('file:///storage/emulated/0', 'file:///sdcard');
  return clean;
}

/**
 * Translates incoming language server paths back into canonical host file system formats.
 * Map conversion layers shift: `file:///sdcard/...` back to native `/storage/emulated/0/...`.
 * 
 * @param uri Standard standardized language server address resource sequence.
 */
export function fromLspUri(uri: string): string {
  return uri.replace('file:///sdcard', 'file:///storage/emulated/0');
}

/**
 * Extracts the authorized workspace-safe target URI tracking a specific document layout model.
 * Checks virtual tracking maps for in-memory virtual scripts, falling back gracefully to 
 * native model structures when mapping definitions are absent.
 * 
 * @param model Active Monaco model definition slice tracking text modifications.
 * @param state Central Language Server state cache tracking transient document mappings.
 */
export function getDocUri(model: monaco.editor.ITextModel, state: LspState): string {
  const mapped = state.modelUriMap.get(model.id);
  if (mapped) return mapped;
  return toLspUri(model.uri.toString());
}
