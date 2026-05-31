// src/core/services/ILspService.ts

import * as monaco from 'monaco-editor';

/**
 * ILspService Core Architectural Interface
 * Defines the contract for all Language Server Protocol service implementations.
 * Both real connection subsystems and web-safe test mock modules must implement this,
 * decoupling consumption hooks like `useLspSync` from concrete layout dependencies.
 */
export interface ILspService {
  /** Reflects whether the underlying WebSocket network pipe is alive and active */
  readonly isConnected: boolean;

  /** True once the bi-directional initialize/initialized handshake lifecycle is confirmed */
  initialized: boolean;

  /**
   * Tracks intermediate connection state where the socket has connected but the structural 
   * handshake is still outstanding. Used to trap microsecond race windows safely.
   */
  isInitializing: boolean;

  /** Dynamic operational registry tracking allocated language feature handlers for teardown */
  disposables: monaco.IDisposable[];

  /**
   * Returns a promise that resolves instantly if initialization has wrapped up, 
   * or suspends execution until active handshake workflows finish. 
   * Rejects immediately if no backing connection exists.
   */
  waitUntilReady(): Promise<void>;

  /**
   * Provisions network sockets and bootstraps the asynchronous LSP initialization protocol layers.
   * 
   * @param languageId Context identifier matching target editor configurations (e.g., 'typescript').
   * @param url Absolute remote proxy endpoint or web socket server channel path.
   * @param options Secondary operational configurations mapping custom compiler settings.
   */
  connect(languageId: string, url: string, options?: Record<string, any>): void;

  /**
   * severs underlying web communication channels, wipes diagnostic maps, 
   * and unregisters active code intellisense providers from Monaco.
   */
  disconnect(): void;

  /**
   * Associates an ephemeral, in-memory Monaco TextModel space with a concrete absolute filesystem string.
   * Must be evaluated within file sync processes prior to submitting operational range positions.
   * 
   * @param model Active Monaco document tracking model instance.
   * @param realFileUri Absolute peripheral file storage route address string.
   */
  registerModelUri(model: monaco.editor.ITextModel, realFileUri: string): void;

  /**
   * Triggers terminal cleanup sequences when a document context unmounts.
   * Transmits a `textDocument/didClose` RPC frame to flush out internal workspace map caches.
   * 
   * @param model Target Monaco document tracking model instance.
   */
  unregisterModelUri(model: monaco.editor.ITextModel): void;

  /**
   * Synchronizes active code buffers upon tab mutations or layout focus updates.
   * Alternates tracking streams via `textDocument/didChange` or initial `textDocument/didOpen` structures.
   * 
   * @param model Target Monaco document tracking model instance.
   */
  notifyDocumentOpen(model: monaco.editor.ITextModel): void;

  /**
   * Direct pipeline allowing execution layers to fire off low-level custom notification strings.
   * Intended strictly for test scripting runs or internal lifecycle testing loops.
   */
  _notify(method: string, params: unknown): void;
}
