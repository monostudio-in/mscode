
import { coalesce } from '../../../base/common/arrays.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import { TextEditorDecorationType } from './extHostTextEditor.js';
import { ViewColumn, Range, Selection, TextEditorLineNumbersStyle } from './extHostTypeConverters.js';
import { TextEditorSelectionChangeKind, TextEditorChangeKind } from './extHostTypes.js';

class ExtHostEditors extends Disposable {
    constructor(mainContext, _extHostDocumentsAndEditors) {
        super();
        this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
        this._onDidChangeTextEditorSelection = this._register(( new Emitter()));
        this._onDidChangeTextEditorOptions = this._register(( new Emitter()));
        this._onDidChangeTextEditorVisibleRanges = this._register(( new Emitter()));
        this._onDidChangeTextEditorViewColumn = this._register(( new Emitter()));
        this._onDidChangeTextEditorDiffInformation = this._register(( new Emitter()));
        this._onDidChangeActiveTextEditor = this._register(( new Emitter()));
        this._onDidChangeVisibleTextEditors = this._register(( new Emitter()));
        this.onDidChangeTextEditorSelection = this._onDidChangeTextEditorSelection.event;
        this.onDidChangeTextEditorOptions = this._onDidChangeTextEditorOptions.event;
        this.onDidChangeTextEditorVisibleRanges = this._onDidChangeTextEditorVisibleRanges.event;
        this.onDidChangeTextEditorViewColumn = this._onDidChangeTextEditorViewColumn.event;
        this.onDidChangeTextEditorDiffInformation = this._onDidChangeTextEditorDiffInformation.event;
        this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
        this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadTextEditors));
        this._register(
            this._extHostDocumentsAndEditors.onDidChangeVisibleTextEditors(e => this._onDidChangeVisibleTextEditors.fire(e))
        );
        this._register(
            this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor(e => this._onDidChangeActiveTextEditor.fire(e))
        );
    }
    getActiveTextEditor() {
        return this._extHostDocumentsAndEditors.activeEditor();
    }
    getVisibleTextEditors(internal) {
        const editors = this._extHostDocumentsAndEditors.allEditors();
        return internal ? editors : ( editors.map(editor => editor.value));
    }
    async showTextDocument(document, columnOrOptions, preserveFocus) {
        let options;
        if (typeof columnOrOptions === "number") {
            options = {
                position: ViewColumn.from(columnOrOptions),
                preserveFocus
            };
        } else if (typeof columnOrOptions === "object") {
            options = {
                position: ViewColumn.from(columnOrOptions.viewColumn),
                preserveFocus: columnOrOptions.preserveFocus,
                selection: typeof columnOrOptions.selection === "object" ? Range.from(columnOrOptions.selection) : undefined,
                pinned: typeof columnOrOptions.preview === "boolean" ? !columnOrOptions.preview : undefined
            };
        } else {
            options = {
                preserveFocus: false
            };
        }
        const editorId = await this._proxy.$tryShowTextDocument(document.uri, options);
        const editor = editorId && this._extHostDocumentsAndEditors.getEditor(editorId);
        if (editor) {
            return editor.value;
        }
        if (editorId) {
            throw ( new Error(`Could NOT open editor for "${( document.uri.toString())}" because another editor opened in the meantime.`));
        } else {
            throw ( new Error(`Could NOT open editor for "${( document.uri.toString())}".`));
        }
    }
    createTextEditorDecorationType(extension, options) {
        return ( new TextEditorDecorationType(this._proxy, extension, options)).value;
    }
    $acceptEditorPropertiesChanged(id, data) {
        const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
        if (!textEditor) {
            throw ( new Error("unknown text editor"));
        }
        if (data.options) {
            textEditor._acceptOptions(data.options);
        }
        if (data.selections) {
            const selections = ( data.selections.selections.map(Selection.to));
            textEditor._acceptSelections(selections);
        }
        if (data.visibleRanges) {
            const visibleRanges = coalesce(( data.visibleRanges.map(Range.to)));
            textEditor._acceptVisibleRanges(visibleRanges);
        }
        if (data.options) {
            this._onDidChangeTextEditorOptions.fire({
                textEditor: textEditor.value,
                options: {
                    ...data.options,
                    lineNumbers: TextEditorLineNumbersStyle.to(data.options.lineNumbers)
                }
            });
        }
        if (data.selections) {
            const kind = TextEditorSelectionChangeKind.fromValue(data.selections.source);
            const selections = ( data.selections.selections.map(Selection.to));
            this._onDidChangeTextEditorSelection.fire({
                textEditor: textEditor.value,
                selections,
                kind
            });
        }
        if (data.visibleRanges) {
            const visibleRanges = coalesce(( data.visibleRanges.map(Range.to)));
            this._onDidChangeTextEditorVisibleRanges.fire({
                textEditor: textEditor.value,
                visibleRanges
            });
        }
    }
    $acceptEditorPositionData(data) {
        for (const id in data) {
            const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
            if (!textEditor) {
                throw ( new Error("Unknown text editor"));
            }
            const viewColumn = ViewColumn.to(data[id]);
            if (textEditor.value.viewColumn !== viewColumn) {
                textEditor._acceptViewColumn(viewColumn);
                this._onDidChangeTextEditorViewColumn.fire({
                    textEditor: textEditor.value,
                    viewColumn
                });
            }
        }
    }
    $acceptEditorDiffInformation(id, diffInformation) {
        const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
        if (!textEditor) {
            throw ( new Error("unknown text editor"));
        }
        if (!diffInformation) {
            textEditor._acceptDiffInformation(undefined);
            this._onDidChangeTextEditorDiffInformation.fire({
                textEditor: textEditor.value,
                diffInformation: undefined
            });
            return;
        }
        const that = this;
        const result = ( diffInformation.map(diff => {
            const original = URI.revive(diff.original);
            const modified = URI.revive(diff.modified);
            const changes = ( diff.changes.map(change => {
                const [
                    originalStartLineNumber,
                    originalEndLineNumberExclusive,
                    modifiedStartLineNumber,
                    modifiedEndLineNumberExclusive
                ] = change;
                let kind;
                if (originalStartLineNumber === originalEndLineNumberExclusive) {
                    kind = TextEditorChangeKind.Addition;
                } else if (modifiedStartLineNumber === modifiedEndLineNumberExclusive) {
                    kind = TextEditorChangeKind.Deletion;
                } else {
                    kind = TextEditorChangeKind.Modification;
                }
                return {
                    original: {
                        startLineNumber: originalStartLineNumber,
                        endLineNumberExclusive: originalEndLineNumberExclusive
                    },
                    modified: {
                        startLineNumber: modifiedStartLineNumber,
                        endLineNumberExclusive: modifiedEndLineNumberExclusive
                    },
                    kind
                };
            }));
            return ( Object.freeze({
                documentVersion: diff.documentVersion,
                original,
                modified,
                changes,
                get isStale() {
                    const document = that._extHostDocumentsAndEditors.getDocument(modified);
                    return document?.version !== diff.documentVersion;
                }
            }));
        }));
        textEditor._acceptDiffInformation(result);
        this._onDidChangeTextEditorDiffInformation.fire({
            textEditor: textEditor.value,
            diffInformation: result
        });
    }
    getDiffInformation(id) {
        return Promise.resolve(this._proxy.$getDiffInformation(id));
    }
}

export { ExtHostEditors };
