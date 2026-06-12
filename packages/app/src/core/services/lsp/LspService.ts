// src/core/services/lsp/LspService.ts
//
// Responsibility: Implement ILspService and orchestrate all LSP sub-modules.
// This file contains no business logic of its own — it only wires modules
// together and owns the WebSocket lifecycle.
//
// Architecture overview
// ─────────────────────
//
//   LspService  (this file)
//   ├── LspTransport      – raw WebSocket framing, request/response tracking
//   ├── LspProtocol       – initialize handshake, publishDiagnostics handler
//   ├── LspDocumentManager– textDocument/didOpen, model-URI registry
//   └── LspProviders      – Monaco provider registration, model change tracking

import * as monaco          from 'monaco-editor';
import type { ILspService } from '../ILspService';
import type { LspOptions }  from './types';
import { createInitialState }                                       from './types';
import { toLspUri }                                                 from './utils/uriHelpers';
import { sendNotify, sendRequest, processBuffer, dispatchMessage }  from './LspTransport';
import { initializeLsp, handlePublishDiagnostics }                  from './LspProtocol';
import { registerModelUri, unregisterModelUri,
         notifyDocumentOpen, syncOpenEditors }                      from './LspDocumentManager';
import { registerProviders, teardownProviders }                     from './LspProviders';


export class LspService implements ILspService {
  private state = createInitialState();


  // §1  Public surface  –  ILspService properties & methods

  /**
   * `true` when the underlying WebSocket exists and is in the OPEN state.
   * Does not imply the LSP handshake has completed — check `initialized` for that.
   */
  get isConnected(): boolean {
    return this.state.ws !== null &&
           this.state.ws.readyState === WebSocket.OPEN;
  }

  /**
   * `true` after the LSP initialize / initialized handshake has completed
   * successfully and providers are registered.
   */
  get initialized(): boolean      { return this.state.initialized; }
  set initialized(v: boolean)     { this.state.initialized = v; }

  /**
   * `true` while the handshake is in progress (WS open but not yet ready).
   * Consumers can gate capability checks on this flag.
   */
  get isInitializing(): boolean   { return this.state.isInitializing; }
  set isInitializing(v: boolean)  { this.state.isInitializing = v; }

  /** Live array of Monaco `IDisposable` objects managed by the provider layer. */
  get disposables(): monaco.IDisposable[]  { return this.state.disposables; }
  set disposables(v: monaco.IDisposable[]) { this.state.disposables = v; }

  /**
   * Returns a Promise that resolves once the server is fully initialised.
   *
   * - Resolves immediately if already initialised.
   * - Returns the in-flight init Promise if a connection attempt is running.
   * - Rejects if called before `connect()` has been invoked.
   */
  waitUntilReady(): Promise<void> {
    if (this.state.initialized)   return Promise.resolve();
    if (this.state._initPromise)  return this.state._initPromise;
    return Promise.reject(new Error('LspService: not connecting'));
  }

  /**
   * Maps a Monaco model to an explicit file URI so the provider layer sends
   * the correct `textDocument/` URIs to the server even when the model's
   * own URI doesn't match the on-disk path.
   */
  registerModelUri(model: monaco.editor.ITextModel, realFileUri: string): void {
    registerModelUri(this.state, model, realFileUri);
  }

  /** Removes the URI mapping for a model that is being closed or disposed. */
  unregisterModelUri(model: monaco.editor.ITextModel): void {
    unregisterModelUri(this.state, model);
  }

  /**
   * Sends `textDocument/didOpen` for a model that was created after the
   * initial `syncOpenEditors` call (e.g. the user opened a new file while the
   * LSP server was already running).
   */
  notifyDocumentOpen(model: monaco.editor.ITextModel): void {
    notifyDocumentOpen(this.state, model);
  }

  /**
   * Sends a fire-and-forget LSP notification.
   * Use this for messages that don't require a server response
   * (e.g. `textDocument/didChange`, `textDocument/didClose`).
   */
  _notify(method: string, params: unknown): void {
    sendNotify(this.state, method, params);
  }

  /**
   * Sends an LSP request and returns a Promise for the server response.
   * The Promise rejects if the connection is closed before a response arrives
   * or if the server returns an LSP error object.
   */
  request(method: string, params: unknown): Promise<unknown> {
    return sendRequest(this.state, method, params);
  }


  // §2  connect()
  connect(languageId: string, url: string, options: LspOptions = {}): void {
    this.disconnect();

    const s          = this.state;
    s.languageId     = languageId;
    s.rootUri        = toLspUri(options.rootUri ?? 'file:///sdcard');
    s.initialized    = false;
    s.isInitializing = true;
    s.openedUris.clear();

    // Create the init promise before opening the socket so that callers who
    // call waitUntilReady() synchronously after connect() get this promise.
    s._initPromise = new Promise<void>((res, rej) => {
      s._initResolve = res;
      s._initReject  = rej;
    });

    // Register the language with Monaco if it's not already known
    if (!monaco.languages.getLanguages().some(l => l.id === languageId)) {
      monaco.languages.register({ id: languageId });
    }

    console.log(`[LSP] Connecting → ${url}  lang: ${languageId}  root: ${s.rootUri}`);
    s.ws            = new WebSocket(url);
    s.ws.binaryType = 'arraybuffer';

    // ── onopen: run handshake, register providers, mark ready ───────────────
    s.ws.onopen = async () => {
      console.log('[LSP] WebSocket open — starting handshake…');
      try {
        await initializeLsp(s);      // initialize ↔ initialized round-trip
        registerProviders(s, options); // Monaco completion / hover / etc.
        syncOpenEditors(s);            // didOpen for already-open models

        s.isInitializing = false;
        s._initResolve?.();
        s._initResolve = s._initReject = null;
        console.log(`[LSP] ✅ ${languageId} server ready`);
      } catch (e) {
        console.error('[LSP] Handshake failed:', e);
        s.isInitializing = false;
        s._initReject?.(e instanceof Error ? e : new Error(String(e)));
        s._initResolve = s._initReject = null;
      }
    };

    // ── onmessage: decode and feed into the transport buffer ────────────────
    s.ws.onmessage = (event) => {
      const raw = typeof event.data === 'string'
        ? event.data
        : s.decoder.decode(event.data as ArrayBuffer, { stream: true });

      s.buffer += raw;

      // processBuffer extracts complete LSP messages; dispatchMessage routes them
      processBuffer(s, msg =>
        dispatchMessage(s, msg, this._onNotification.bind(this))
      );
    };

    // ── onerror: reject init promise if still in handshake ──────────────────
    s.ws.onerror = () => {
      console.warn('[LSP] WebSocket error');
      if (s.isInitializing) {
        s.isInitializing = false;
        s._initReject?.(new Error('WebSocket error during handshake'));
        s._initResolve = s._initReject = null;
      }
    };

    // ── onclose: reject init promise if still in handshake, tear down ───────
    s.ws.onclose = (e) => {
      console.log(`[LSP] WebSocket closed (code: ${e.code})`);
      if (s.isInitializing) {
        s.isInitializing = false;
        s._initReject?.(new Error(`WebSocket closed before initialized (code ${e.code})`));
        s._initResolve = s._initReject = null;
      }
      teardownProviders(s);
    };
  }


  // §3  disconnect()
  disconnect(): void {
    const s = this.state;

    // 1 & 2 Dispose all Monaco providers and clear diagnostic marker & Clear the open-document URI registry.
    teardownProviders(s);
    s.openedUris.clear();

    // 3 — reject pending init promise
    if (s.isInitializing) {
      s._initReject?.(new Error('LspService disconnected during initialization'));
      s._initResolve = s._initReject = null;
    }
    s.isInitializing = false;
    s.initialized    = false;
    s._initPromise   = null;

    // 4 — close the WebSocket cleanly
    if (s.ws) {
      s.ws.onopen = s.ws.onmessage = s.ws.onerror = s.ws.onclose = null;
      if (s.ws.readyState < WebSocket.CLOSING) s.ws.close();
      s.ws = null;
    }

    // 5 — unblock any callers awaiting a request response
    s.pendingRequests.forEach(p => p.reject(new Error('disconnected')));
    s.pendingRequests.clear();

    // 6 Reset the transport receive buffer.
    s.buffer = '';
  }


  // §4  Notification handler  –  server-push message dispatch
  private _onNotification(method: string, params: any): void {
    if (method === 'textDocument/publishDiagnostics') {
      handlePublishDiagnostics(this.state, params);
    }
  }
}