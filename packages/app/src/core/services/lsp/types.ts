// src/core/services/lsp/types.ts

import * as monaco from 'monaco-editor';

// ─── JSON-RPC WIRE LAYER INTERFACES ──────────────────────────────────────────

/**
 * Standard structured frame representing an outgoing bidirectional JSON-RPC request.
 */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown;
}

/**
 * Standard structured frame representing an asynchronous, unidirectional JSON-RPC notification.
 */
export interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params: unknown;
}

/**
 * Execution state references tracking unfulfilled outbound communications waiting on server resolution loops.
 */
export interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

// ─── LSP CONFIGURATION CONTEXTS ───────────────────────────────────────────────

/**
 * Structural settings payload specifying individual engine features toggled during transport setups.
 */
export interface LspOptions {
  hover?: boolean;
  completion?: boolean;
  linting?: boolean;
  signatureHelp?: boolean;
  rootUri?: string;
  fileUri?: string;
}

// ─── SHARED MUTABLE SYSTEM STATE CARRIER ──────────────────────────────────────

/**
 * Central state bucket holding system references, message streams, and lookup maps.
 * Passed via object referential pointers so adjustments cascade across linked layers instantly.
 */
export interface LspState {
  /** Active persistent network channel running low-level frame payloads */
  ws: WebSocket | null;
  /** Atomic counter ensuring non-repeating message sequence ids */
  msgId: number;
  /** Active registry routing inbound data frames back to matching asynchronous requests */
  pendingRequests: Map<number, PendingRequest>;
  /** Core Monaco execution callbacks flagged for dynamic lifecycle cleanups */
  disposables: monaco.IDisposable[];

  /** True once two-way handshake initialization loops finish cleanly */
  initialized: boolean;
  /** Structural state block preventing concurrent socket negotiation threads */
  isInitializing: boolean;
  _initResolve: (() => void) | null;
  _initReject: ((e: Error) => void) | null;
  _initPromise: Promise<void> | null;

  /** Target programming architecture language key token (e.g., 'cpp', 'rust') */
  languageId: string;
  /** Primary working file path tracking project workspaces */
  rootUri: string;
  /** Unprocessed data string buffer collecting fragmented raw stream segments */
  buffer: string;
  /** Active binary decoder translating incoming raw character values uniformly */
  decoder: TextDecoder;

  /** Dynamic lookup tracking structural identities: inmemory model.id → absolute file:// LSP URI */
  modelUriMap: Map<string, string>;
  /** Local registry containing tracking path keys that have safely dispatched didOpen notifications */
  openedUris: Set<string>;
}

// ─── STATE INITIALIZATION MATRIX ──────────────────────────────────────────────

/**
 * Generates an empty, isolated baseline state structure.
 */
export function createInitialState(): LspState {
  return {
    ws: null,
    msgId: 1,
    pendingRequests: new Map(),
    disposables: [],

    initialized: false,
    isInitializing: false,
    _initResolve: null,
    _initReject: null,
    _initPromise: null,

    languageId: '',
    rootUri: 'file:///sdcard',
    buffer: '',
    decoder: new TextDecoder('utf-8'),

    modelUriMap: new Map(),
    openedUris: new Set(),
  };
}
