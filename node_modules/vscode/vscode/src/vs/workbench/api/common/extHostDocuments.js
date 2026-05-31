
import { Emitter } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import { setWordDefinitionFor } from './extHostDocumentData.js';
import { Range } from './extHostTypeConverters.js';
import { assertReturnsDefined } from '../../../base/common/types.js';
import { deepFreeze } from '../../../base/common/objects.js';
import { TextDocumentChangeReason } from './extHostTypes.js';

class ExtHostDocuments {
    constructor(mainContext, documentsAndEditors) {
        this._toDispose = ( new DisposableStore());
        this._onDidAddDocument = this._toDispose.add(( new Emitter()));
        this._onDidRemoveDocument = this._toDispose.add(( new Emitter()));
        this._onDidChangeDocument = this._toDispose.add(( new Emitter()));
        this._onDidChangeDocumentWithReason = this._toDispose.add(( new Emitter()));
        this._onDidSaveDocument = this._toDispose.add(( new Emitter()));
        this.onDidAddDocument = this._onDidAddDocument.event;
        this.onDidRemoveDocument = this._onDidRemoveDocument.event;
        this.onDidChangeDocument = this._onDidChangeDocument.event;
        this.onDidChangeDocumentWithReason = this._onDidChangeDocumentWithReason.event;
        this.onDidSaveDocument = this._onDidSaveDocument.event;
        this._documentLoader = ( new Map());
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadDocuments));
        this._documentsAndEditors = documentsAndEditors;
        this._documentsAndEditors.onDidRemoveDocuments(documents => {
            for (const data of documents) {
                this._onDidRemoveDocument.fire(data.document);
            }
        }, undefined, this._toDispose);
        this._documentsAndEditors.onDidAddDocuments(documents => {
            for (const data of documents) {
                this._onDidAddDocument.fire(data.document);
            }
        }, undefined, this._toDispose);
    }
    dispose() {
        this._toDispose.dispose();
    }
    getAllDocumentData() {
        return [...this._documentsAndEditors.allDocuments()];
    }
    getDocumentData(resource) {
        if (!resource) {
            return undefined;
        }
        const data = this._documentsAndEditors.getDocument(resource);
        if (data) {
            return data;
        }
        return undefined;
    }
    getDocument(resource) {
        const data = this.getDocumentData(resource);
        if (!data?.document) {
            throw ( new Error(`Unable to retrieve document from URI '${resource}'`));
        }
        return data.document;
    }
    ensureDocumentData(uri, options) {
        const cached = this._documentsAndEditors.getDocument(uri);
        if (cached && (!options?.encoding || cached.document.encoding === options.encoding)) {
            return Promise.resolve(cached);
        }
        let promise = this._documentLoader.get(( uri.toString()));
        if (!promise) {
            promise = this._proxy.$tryOpenDocument(uri, options).then(uriData => {
                this._documentLoader.delete(( uri.toString()));
                const canonicalUri = URI.revive(uriData);
                return assertReturnsDefined(this._documentsAndEditors.getDocument(canonicalUri));
            }, err => {
                this._documentLoader.delete(( uri.toString()));
                return Promise.reject(err);
            });
            this._documentLoader.set(( uri.toString()), promise);
        } else {
            if (options?.encoding) {
                promise = promise.then(data => {
                    if (data.document.encoding !== options.encoding) {
                        return this.ensureDocumentData(uri, options);
                    }
                    return data;
                });
            }
        }
        return promise;
    }
    createDocumentData(options) {
        return this._proxy.$tryCreateDocument(options).then(data => URI.revive(data));
    }
    $acceptModelLanguageChanged(uriComponents, newLanguageId) {
        const uri = URI.revive(uriComponents);
        const data = this._documentsAndEditors.getDocument(uri);
        if (!data) {
            throw ( new Error("unknown document"));
        }
        this._onDidRemoveDocument.fire(data.document);
        data._acceptLanguageId(newLanguageId);
        this._onDidAddDocument.fire(data.document);
    }
    $acceptModelSaved(uriComponents) {
        const uri = URI.revive(uriComponents);
        const data = this._documentsAndEditors.getDocument(uri);
        if (!data) {
            throw ( new Error("unknown document"));
        }
        this.$acceptDirtyStateChanged(uriComponents, false);
        this._onDidSaveDocument.fire(data.document);
    }
    $acceptDirtyStateChanged(uriComponents, isDirty) {
        const uri = URI.revive(uriComponents);
        const data = this._documentsAndEditors.getDocument(uri);
        if (!data) {
            throw ( new Error("unknown document"));
        }
        data._acceptIsDirty(isDirty);
        this._onDidChangeDocument.fire({
            document: data.document,
            contentChanges: [],
            reason: undefined
        });
        this._onDidChangeDocumentWithReason.fire({
            document: data.document,
            contentChanges: [],
            reason: undefined,
            detailedReason: undefined
        });
    }
    $acceptEncodingChanged(uriComponents, encoding) {
        const uri = URI.revive(uriComponents);
        const data = this._documentsAndEditors.getDocument(uri);
        if (!data) {
            throw ( new Error("unknown document"));
        }
        data._acceptEncoding(encoding);
        this._onDidChangeDocument.fire({
            document: data.document,
            contentChanges: [],
            reason: undefined
        });
        this._onDidChangeDocumentWithReason.fire({
            document: data.document,
            contentChanges: [],
            reason: undefined,
            detailedReason: undefined
        });
    }
    $acceptModelChanged(uriComponents, events, isDirty) {
        const uri = URI.revive(uriComponents);
        const data = this._documentsAndEditors.getDocument(uri);
        if (!data) {
            throw ( new Error("unknown document"));
        }
        data._acceptIsDirty(isDirty);
        data.onEvents(events);
        let reason = undefined;
        if (events.isUndoing) {
            reason = TextDocumentChangeReason.Undo;
        } else if (events.isRedoing) {
            reason = TextDocumentChangeReason.Redo;
        }
        this._onDidChangeDocument.fire(deepFreeze({
            document: data.document,
            contentChanges: ( events.changes.map(change => {
                return {
                    range: Range.to(change.range),
                    rangeOffset: change.rangeOffset,
                    rangeLength: change.rangeLength,
                    text: change.text
                };
            })),
            reason
        }));
        this._onDidChangeDocumentWithReason.fire(deepFreeze({
            document: data.document,
            contentChanges: ( events.changes.map(change => {
                return {
                    range: Range.to(change.range),
                    rangeOffset: change.rangeOffset,
                    rangeLength: change.rangeLength,
                    text: change.text
                };
            })),
            reason,
            detailedReason: events.detailedReason ? {
                source: events.detailedReason.source,
                metadata: events.detailedReason
            } : undefined
        }));
    }
    setWordDefinitionFor(languageId, wordDefinition) {
        setWordDefinitionFor(languageId, wordDefinition);
    }
}

export { ExtHostDocuments };
