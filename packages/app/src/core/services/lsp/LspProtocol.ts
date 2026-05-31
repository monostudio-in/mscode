// src/core/services/lsp/LspProtocol.ts

import * as monaco from 'monaco-editor';
import type { LspState } from './types';
import { sendRequest, sendNotify } from './LspTransport';
import { fromLspUri, getDocUri } from './utils/uriHelpers';

// ─── LSP CAPABILITIES DEFINITIONS ────────────────────────────────────────────
// Declaring client-supported features up front allows clean expansion patterns 
// when adding structural options like formatting, declarations, or code actions.

const CLIENT_CAPABILITIES = {
  offsetEncoding: ['utf-16', 'utf-8'],
  textDocument: {
    synchronization: {
      dynamicRegistration: true,
      willSave: false,
      didSave: true,
      willSaveWaitUntil: false,
    },
    completion: {
      dynamicRegistration: true,
      completionItem: {
        snippetSupport: true,
        commitCharactersSupport: true,
        documentationFormat: ['markdown', 'plaintext'],
        resolveSupport: { properties: ['documentation', 'detail'] },
      },
    },
    hover: {
      dynamicRegistration: true,
      contentFormat: ['markdown', 'plaintext'],
    },
    signatureHelp: {
      dynamicRegistration: true,
      signatureInformation: {
        documentationFormat: ['markdown', 'plaintext'],
        parameterInformation: { labelOffsetSupport: true },
      },
    },
    publishDiagnostics: { relatedInformation: true },
  },
  workspace: {
    didChangeConfiguration: { dynamicRegistration: true },
    workspaceFolders: true,
  },
};

// ─── WORKSPACE PROFILE HELPERS ────────────────────────────────────────────────
/**
 * Extracts a legible visual tag label out of deep system absolute file paths.
 * 
 * @param rootUri The baseline configuration directory address pointer.
 */
export function getWorkspaceName(rootUri: string): string {
  const parts = decodeURI(rootUri).replace('file://', '').split('/').filter(Boolean);
  return parts[parts.length - 1] ?? 'workspace';
}

// ─── HANDSHAKE SUBSYSTEM INITIATION ───────────────────────────────────────────
/**
 * Orchestrates the two-way initialize/initialized handshake lifecycle with the language server.
 * Flips the operational state flag once negotiation is confirmed.
 * 
 * @param state The central language server operational state cache context.
 */
export async function initializeLsp(state: LspState): Promise<void> {
  const result = await sendRequest(state, 'initialize', {
    processId: null,
    rootUri: state.rootUri,
    capabilities: CLIENT_CAPABILITIES,
    initializationOptions: { clangdFileStatus: true },
    workspaceFolders: [{ uri: state.rootUri, name: getWorkspaceName(state.rootUri) }],
  });

  sendNotify(state, 'initialized', {});
  state.initialized = true;
  console.log('[LSP] Handshake verified. Acknowledged capabilities:', (result as any)?.capabilities ?? {});
}

// ─── DIAGNOSTICS & TELEMETRY HANDLERS ─────────────────────────────────────────
/**
 * Intercepts incoming `textDocument/publishDiagnostics` asynchronous notifications 
 * and maps the diagnostic errors into active Monaco structural text decorations.
 * 
 * @param state The central language server operational state cache context.
 * @param params Structural diagnostic notification parameters sent from the server.
 */
export function handlePublishDiagnostics(state: LspState, params: any): void {
  const lspUri = params?.uri as string;
  const localUri = fromLspUri(lspUri);

  // Identify matching editor instances by matching native schemes or translated storage keys
  const model = monaco.editor.getModels().find(m =>
    m.uri.toString() === localUri || getDocUri(m, state) === lspUri
  );
  if (!model) return;

  // Convert zero-indexed LSP ranges to Monaco's one-indexed position layout configurations
  const markers: monaco.editor.IMarkerData[] = (params?.diagnostics ?? []).map((d: any) => ({
    severity: diagSeverity(d.severity),
    startLineNumber: (d.range?.start?.line ?? 0) + 1,
    startColumn: (d.range?.start?.character ?? 0) + 1,
    endLineNumber: (d.range?.end?.line ?? 0) + 1,
    endColumn: (d.range?.end?.character ?? 0) + 1,
    message: d.message,
    source: d.source,
  }));

  monaco.editor.setModelMarkers(model, 'lsp', markers);
}

/**
 * Maps raw language server issue integers straight into functional Monaco severity definitions.
 */
function diagSeverity(s?: number): monaco.MarkerSeverity {
  if (s === 1) return monaco.MarkerSeverity.Error;
  if (s === 2) return monaco.MarkerSeverity.Warning;
  if (s === 3) return monaco.MarkerSeverity.Info;
  return monaco.MarkerSeverity.Hint;
}
