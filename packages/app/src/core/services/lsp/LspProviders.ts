// src/core/services/lsp/LspProviders.ts
//
// Responsibility: Register Monaco language providers and track model changes.
// Each provider independently sends LSP requests over the transport layer.
//
// Sections:
//   §1  Public API          – registerProviders / teardownProviders
//   §2  Completion          – textDocument/completion
//   §3  Hover               – textDocument/hover
//   §4  Signature Help      – textDocument/signatureHelp
//   §5  Go-to Definition    – textDocument/definition
//   §6  Model Change Tracking – debounced textDocument/didChange
//   §7  Helpers             – completion kind mapping

import * as monaco from 'monaco-editor';
import type { LspState, LspOptions } from './types';
import { sendRequest, sendNotify }   from './LspTransport';
import { getDocUri, fromLspUri }     from './utils/uriHelpers';
import { debounce }                  from './utils/debounce';
import { notifyDocumentOpen }        from './LspDocumentManager';


// ─────────────────────────────────────────────────────────────────────────────
// §1  Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers all Monaco language providers for the language configured in
 * `state` and starts tracking model changes.
 *
 * Which providers are registered is controlled by `options`:
 *   - `options.completion     !== false` → Completion (default: on)
 *   - `options.hover          !== false` → Hover       (default: on)
 *   - `options.signatureHelp  !== false` → Signature   (default: on)
 *   - Go-to Definition is always registered (no opt-out flag).
 *
 * Every `IDisposable` returned by Monaco is stored in `state.disposables` so
 * that `teardownProviders` can clean everything up in one pass.
 */
export function registerProviders(state: LspState, options: LspOptions): void {
  if (options.completion    !== false) registerCompletion(state);
  if (options.hover         !== false) registerHover(state);
  if (options.signatureHelp !== false) registerSignatureHelp(state);
  registerDefinition(state);
  bindModelTracking(state);
}

/**
 * Disposes every provider and model-change listener registered by
 * `registerProviders`, then clears all LSP diagnostic markers from every
 * open model.
 *
 * Safe to call multiple times – subsequent calls are no-ops because
 * `state.disposables` is reset to an empty array on first call.
 */
export function teardownProviders(state: LspState): void {
  state.disposables.forEach(d => d.dispose());
  state.disposables = [];

  for (const model of monaco.editor.getModels()) {
    monaco.editor.setModelMarkers(model, 'lsp', []);
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// §2  Completion  –  textDocument/completion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers an LSP-backed completion-item provider.
 *
 * Trigger characters
 * ──────────────────
 * Only structural characters (`.`, `:`, `/`, `#`, `@`, `<`, `>`) are used as
 * trigger characters.  Characters like `(`, `"`, `'`, `,`, and ` ` were
 * intentionally excluded because they caused spurious suggestion popups inside
 * function calls and string literals (e.g. typing `print("|")` no longer
 * fires an unwanted completion request).
 *
 * JIT sync
 * ────────
 * Immediately before sending `textDocument/completion`, the latest document
 * content is pushed to the server via a `textDocument/didChange` notification.
 * This prevents stale-content mismatches when the debounced model tracker
 * hasn't fired yet (e.g. the user typed a trigger character very quickly).
 *
 * Snippet detection
 * ─────────────────
 * If the server returns `insertTextFormat === 2` on a completion item, Monaco
 * is told to treat the insert text as a snippet
 * (`InsertAsSnippet`).  Items without that flag are inserted as plain text.
 */
function registerCompletion(state: LspState): void {
  state.disposables.push(
    monaco.languages.registerCompletionItemProvider(state.languageId, {
      triggerCharacters: ['.', ':', '/', '#', '@', '<', '>'],

      provideCompletionItems: async (model, position, context) => {
        if (!state.initialized) return { suggestions: [] };

        try {
          // JIT sync: push current content before asking for completions
          sendNotify(state, 'textDocument/didChange', {
            textDocument:   { uri: getDocUri(model, state), version: model.getVersionId() },
            contentChanges: [{ text: model.getValue() }],
          });

          // Map Monaco trigger kind → LSP trigger kind
          let triggerKind = 1; // Invoked
          if (context.triggerKind === monaco.languages.CompletionTriggerKind.TriggerCharacter)
            triggerKind = 2;
          else if (context.triggerKind === monaco.languages.CompletionTriggerKind.TriggerForIncompleteCompletions)
            triggerKind = 3;

          const result: any = await sendRequest(state, 'textDocument/completion', {
            textDocument: { uri: getDocUri(model, state) },
            position:     { line: position.lineNumber - 1, character: position.column - 1 },
            context:      { triggerKind, triggerCharacter: context.triggerCharacter },
          });

          const items = Array.isArray(result) ? result : result?.items ?? [];
          if (!items.length) return { suggestions: [], incomplete: false };

          return {
            incomplete:  result?.isIncomplete === true,
            suggestions: items.map((item: any) => {
              // Prefer the range from textEdit; fall back to the current word boundary
              let range: monaco.IRange | undefined;
              const te = item.textEdit;
              if (te) {
                const r = te.range ?? te.replace;
                if (r) {
                  range = {
                    startLineNumber: r.start.line + 1, startColumn: r.start.character + 1,
                    endLineNumber:   r.end.line   + 1, endColumn:   r.end.character   + 1,
                  };
                }
              }
              if (!range) {
                const w = model.getWordUntilPosition(position);
                range = {
                  startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
                  startColumn:     w.startColumn,       endColumn:     w.endColumn,
                };
              }

              return {
                label:         item.label.trim(),
                kind:          completionKind(item.kind),
                detail:        item.detail ?? '',
                documentation: typeof item.documentation === 'string'
                  ? item.documentation
                  : item.documentation?.value ?? '',
                insertText:    item.textEdit?.newText ?? item.insertText ?? item.label,
                range,
                // Only set InsertAsSnippet when the server explicitly requests it
                insertTextRules: item.insertTextFormat === 2
                  ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                  : undefined,
              };
            }),
          };
        } catch {
          return { suggestions: [] };
        }
      },
    })
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// §3  Hover  –  textDocument/hover
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers an LSP-backed hover provider.
 *
 * The server response's `contents` field may be a single item or an array;
 * both forms are normalised to an array of `{ value: string }` objects that
 * Monaco's hover widget can render as Markdown.
 *
 * Returns `null` (no hover) when:
 *   - The LSP connection is not yet initialised.
 *   - The server returns an empty / missing `contents` field.
 *   - The request throws (e.g. timeout or transport error).
 */
function registerHover(state: LspState): void {
  state.disposables.push(
    monaco.languages.registerHoverProvider(state.languageId, {
      provideHover: async (model, position) => {
        if (!state.initialized) return null;

        try {
          const result: any = await sendRequest(state, 'textDocument/hover', {
            textDocument: { uri: getDocUri(model, state) },
            position:     { line: position.lineNumber - 1, character: position.column - 1 },
          });

          if (!result?.contents) return null;

          const contents = Array.isArray(result.contents)
            ? result.contents
            : [result.contents];

          return {
            contents: contents.map((c: any) => ({
              value: typeof c === 'string' ? c : c.value ?? '',
            })),
          };
        } catch {
          return null;
        }
      },
    })
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// §4  Signature Help  –  textDocument/signatureHelp
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers an LSP-backed signature-help provider.
 *
 * Trigger / retrigger characters
 * ───────────────────────────────
 * `(` and `,` open the signature widget; `,` and ` ` retrigger it when
 * navigating between parameters.
 *
 * JIT sync
 * ────────
 * Same as the completion provider: the latest document text is force-pushed to
 * the server immediately before the request so the server always sees the most
 * recent content, regardless of debounce state.
 *
 * Context forwarding
 * ──────────────────
 * When Monaco supplies an `activeSignatureHelp` context (e.g. the widget is
 * already open), the full signature state is forwarded to the server so it can
 * maintain the active-signature index correctly across retriggers.
 *
 * Returns `null` when the server returns no signatures or the request fails.
 */
function registerSignatureHelp(state: LspState): void {
  state.disposables.push(
    monaco.languages.registerSignatureHelpProvider(state.languageId, {
      signatureHelpTriggerCharacters:   ['(', ','],
      signatureHelpRetriggerCharacters: [',', ' '],

      provideSignatureHelp: async (model, position, _token, context) => {
        if (!state.initialized) return null;

        try {
          // JIT sync: push current content before requesting signature help
          sendNotify(state, 'textDocument/didChange', {
            textDocument:   { uri: getDocUri(model, state), version: model.getVersionId() },
            contentChanges: [{ text: model.getValue() }],
          });

          // Build the LSP context object from Monaco's context
          let lspContext: any;
          if (context) {
            lspContext = {
              triggerKind:
                context.triggerKind === monaco.languages.SignatureHelpTriggerKind.TriggerCharacter ? 2
                : context.triggerKind === monaco.languages.SignatureHelpTriggerKind.ContentChange  ? 3
                : 1,
              isRetrigger:      context.isRetrigger,
              triggerCharacter: context.triggerCharacter,
            };

            // Forward the currently displayed signature so the server can
            // preserve the active-signature index across retriggers
            if (context.activeSignatureHelp) {
              lspContext.activeSignatureHelp = {
                signatures: context.activeSignatureHelp.signatures.map(s => ({
                  label:           s.label,
                  documentation:   s.documentation,
                  parameters:      s.parameters.map(p => ({
                    label:         p.label,
                    documentation: p.documentation,
                  })),
                  activeParameter: s.activeParameter,
                })),
                activeSignature: context.activeSignatureHelp.activeSignature,
                activeParameter: context.activeSignatureHelp.activeParameter,
              };
            }
          }

          const result: any = await sendRequest(state, 'textDocument/signatureHelp', {
            textDocument: { uri: getDocUri(model, state) },
            position:     { line: position.lineNumber - 1, character: position.column - 1 },
            context:      lspContext,
          });

          if (!result?.signatures?.length) return null;

          const activeSignature = result.activeSignature ?? 0;
          const activeParameter =
            result.activeParameter ?? result.signatures[activeSignature]?.activeParameter ?? 0;

          return {
            value: {
              signatures: result.signatures.map((s: any) => ({
                label:         s.label,
                documentation: typeof s.documentation === 'string'
                  ? s.documentation
                  : s.documentation?.value ?? '',
                parameters: (s.parameters ?? []).map((p: any) => ({
                  label:         p.label,
                  documentation: typeof p.documentation === 'string'
                    ? p.documentation
                    : p.documentation?.value ?? '',
                })),
                activeParameter: s.activeParameter,
              })),
              activeSignature,
              activeParameter,
            },
            dispose: () => {},
          };
        } catch {
          return null;
        }
      },
    })
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// §5  Go-to Definition  –  textDocument/definition
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registers an LSP-backed go-to-definition provider.
 *
 * The server may return a single `Location` or an array of `Location` objects;
 * both are normalised to an array.  Each LSP URI is converted to a Monaco URI
 * via `fromLspUri` so cross-file navigation works correctly even when the
 * server uses `file://` URIs with different casing or encoding.
 *
 * Line/column numbers are converted from 0-based (LSP) to 1-based (Monaco).
 *
 * Returns `null` when the server returns no result or the request fails.
 */
function registerDefinition(state: LspState): void {
  state.disposables.push(
    monaco.languages.registerDefinitionProvider(state.languageId, {
      provideDefinition: async (model, position) => {
        if (!state.initialized) return null;

        try {
          const result: any = await sendRequest(state, 'textDocument/definition', {
            textDocument: { uri: getDocUri(model, state) },
            position:     { line: position.lineNumber - 1, character: position.column - 1 },
          });

          if (!result) return null;

          const locations = Array.isArray(result) ? result : [result];
          return locations.map((loc: any) => ({
            uri:   monaco.Uri.parse(fromLspUri(loc.uri)),
            range: {
              startLineNumber: (loc.range?.start?.line      ?? 0) + 1,
              startColumn:     (loc.range?.start?.character ?? 0) + 1,
              endLineNumber:   (loc.range?.end?.line        ?? 0) + 1,
              endColumn:       (loc.range?.end?.character   ?? 0) + 1,
            },
          }));
        } catch {
          return null;
        }
      },
    })
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// §6  Model Change Tracking  –  debounced textDocument/didChange
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribes to content-change events for every Monaco model whose language
 * matches `state.languageId`.
 *
 * Debounce strategy
 * ─────────────────
 * A separate 400 ms debounce instance is created per model so that typing in
 * one file does not delay change notifications for another file that happens
 * to be open at the same time.
 *
 * New models
 * ──────────
 * `monaco.editor.onDidCreateModel` is used to bind the same change listener
 * to models created after this function runs (e.g. when the user opens a new
 * file).  If the LSP connection is already initialised at that point, a
 * `textDocument/didOpen` notification is also sent immediately so the server
 * registers the document.
 *
 * Note: the JIT sync inside the completion and signature-help providers
 * ensures the server always has the latest content even when the debounce
 * timer has not fired yet.
 */
function bindModelTracking(state: LspState): void {
  const bindModel = (model: monaco.editor.ITextModel): void => {
    if (model.getLanguageId() !== state.languageId) return;

    // Each model gets its own debounce instance to avoid cross-file delays
    const sendDidChange = debounce(() => {
      if (!state.initialized) return;
      sendNotify(state, 'textDocument/didChange', {
        textDocument:   { uri: getDocUri(model, state), version: model.getVersionId() },
        contentChanges: [{ text: model.getValue() }],
      });
    }, 400);

    state.disposables.push(
      model.onDidChangeContent(() => {
        if (!state.initialized) return;
        sendDidChange();
      })
    );
  };

  // Bind existing models
  monaco.editor.getModels().forEach(bindModel);

  // Bind models created after this point (e.g. user opens a new file)
  state.disposables.push(
    monaco.editor.onDidCreateModel(model => {
      bindModel(model);
      if (state.initialized && model.getLanguageId() === state.languageId) {
        notifyDocumentOpen(state, model);
      }
    })
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// §7  Helpers  –  LSP completion kind → Monaco completion kind
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps an LSP `CompletionItemKind` number to the corresponding Monaco enum
 * value.
 *
 * LSP kinds not present in the map (e.g. deprecated or rarely-used entries)
 * fall back to `CompletionItemKind.Text`.
 *
 * Reference: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#completionItemKind
 */
function completionKind(kind?: number): monaco.languages.CompletionItemKind {
  const K = monaco.languages.CompletionItemKind;

  const map: Record<number, monaco.languages.CompletionItemKind> = {
    1:  K.Text,          2:  K.Method,       3:  K.Function,
    4:  K.Constructor,   5:  K.Field,        6:  K.Variable,
    7:  K.Class,         8:  K.Interface,    9:  K.Module,
    10: K.Property,      12: K.Value,        14: K.Keyword,
    17: K.File,          18: K.Reference,    22: K.Struct,
    23: K.Event,         25: K.TypeParameter,
  };

  return map[kind ?? 1] ?? K.Text;
}