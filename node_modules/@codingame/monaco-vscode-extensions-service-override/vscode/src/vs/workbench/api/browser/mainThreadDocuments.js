
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { toErrorMessage } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errorMessage';
import { dispose, Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { Schemas } from '@codingame/monaco-vscode-api/vscode/vs/base/common/network';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { shouldSynchronizeModel } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/model';
import { IModelService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/services/model.service';
import { ITextModelService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/services/resolverService.service';
import { FileOperation } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files';
import { IFileService } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service';
import { ExtHostContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { TextFileResolveReason, EncodingMode } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/textfile/common/textfiles';
import { ITextFileService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/textfile/common/textfiles.service';
import { IWorkbenchEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service';
import { extUri, toLocalResource } from '@codingame/monaco-vscode-api/vscode/vs/base/common/resources';
import { IWorkingCopyFileService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/workingCopy/common/workingCopyFileService.service';
import { IUriIdentityService } from '@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service';
import { Emitter, Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { IPathService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/path/common/pathService.service';
import { ResourceMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/map';
import { onUnexpectedError, ErrorNoTelemetry } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';

class BoundModelReferenceCollection {
    constructor(
        _extUri,
        _maxAge = 1000 * 60 * 3,
        _maxLength = 1024 * 1024 * 80,
        _maxSize = 50
    ) {
        this._extUri = _extUri;
        this._maxAge = _maxAge;
        this._maxLength = _maxLength;
        this._maxSize = _maxSize;
        this._data = ( new Array());
        this._length = 0;
    }
    dispose() {
        this._data = dispose(this._data);
    }
    remove(uri) {
        for (const entry of [...this._data] ) {
            if (this._extUri.isEqualOrParent(entry.uri, uri)) {
                entry.dispose();
            }
        }
    }
    add(uri, ref, length = 0) {
        const dispose = () => {
            const idx = this._data.indexOf(entry);
            if (idx >= 0) {
                this._length -= length;
                ref.dispose();
                clearTimeout(handle);
                this._data.splice(idx, 1);
            }
        };
        const handle = setTimeout(dispose, this._maxAge);
        const entry = {
            uri,
            length,
            dispose
        };
        this._data.push(entry);
        this._length += length;
        this._cleanup();
    }
    _cleanup() {
        while (this._length > this._maxLength) {
            this._data[0].dispose();
        }
        const extraSize = Math.ceil(this._maxSize * 1.2);
        if (this._data.length >= extraSize) {
            dispose(this._data.slice(0, extraSize - this._maxSize));
        }
    }
}
class ModelTracker extends Disposable {
    constructor(_model, _onIsCaughtUpWithContentChanges, _proxy, _textFileService) {
        super();
        this._model = _model;
        this._onIsCaughtUpWithContentChanges = _onIsCaughtUpWithContentChanges;
        this._proxy = _proxy;
        this._textFileService = _textFileService;
        this._knownVersionId = this._model.getVersionId();
        this._store.add(this._model.onDidChangeContent(e => {
            this._knownVersionId = e.versionId;
            if (e.detailedReasonsChangeLengths.length !== 1) {
                onUnexpectedError(( new Error(`Unexpected reasons: ${( e.detailedReasons.map(r => ( r.toString())))}`)));
            }
            const evt = {
                changes: e.changes,
                isEolChange: e.isEolChange,
                isUndoing: e.isUndoing,
                isRedoing: e.isRedoing,
                isFlush: e.isFlush,
                eol: e.eol,
                versionId: e.versionId,
                detailedReason: e.detailedReasons[0].metadata
            };
            this._proxy.$acceptModelChanged(this._model.uri, evt, this._textFileService.isDirty(this._model.uri));
            if (this.isCaughtUpWithContentChanges()) {
                this._onIsCaughtUpWithContentChanges.fire(this._model.uri);
            }
        }));
    }
    isCaughtUpWithContentChanges() {
        return (this._model.getVersionId() === this._knownVersionId);
    }
}
let MainThreadDocuments = class MainThreadDocuments extends Disposable {
    constructor(
        extHostContext,
        _modelService,
        _textFileService,
        _fileService,
        _textModelResolverService,
        _environmentService,
        _uriIdentityService,
        workingCopyFileService,
        _pathService
    ) {
        super();
        this._modelService = _modelService;
        this._textFileService = _textFileService;
        this._fileService = _fileService;
        this._textModelResolverService = _textModelResolverService;
        this._environmentService = _environmentService;
        this._uriIdentityService = _uriIdentityService;
        this._pathService = _pathService;
        this._onIsCaughtUpWithContentChanges = this._store.add(( new Emitter()));
        this.onIsCaughtUpWithContentChanges = this._onIsCaughtUpWithContentChanges.event;
        this._modelTrackers = ( new ResourceMap());
        this._modelReferenceCollection = this._store.add(( new BoundModelReferenceCollection(_uriIdentityService.extUri)));
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostDocuments));
        this._store.add(_modelService.onModelLanguageChanged(this._onModelModeChanged, this));
        this._store.add(_textFileService.files.onDidSave(e => {
            if (this._shouldHandleFileEvent(e.model.resource)) {
                this._proxy.$acceptModelSaved(e.model.resource);
            }
        }));
        this._store.add(_textFileService.files.onDidChangeDirty(m => {
            if (this._shouldHandleFileEvent(m.resource)) {
                this._proxy.$acceptDirtyStateChanged(m.resource, m.isDirty());
            }
        }));
        this._store.add(Event.any(
            _textFileService.files.onDidChangeEncoding,
            _textFileService.untitled.onDidChangeEncoding
        )(m => {
            if (this._shouldHandleFileEvent(m.resource)) {
                const encoding = m.getEncoding();
                if (encoding) {
                    this._proxy.$acceptEncodingChanged(m.resource, encoding);
                }
            }
        }));
        this._store.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
            const isMove = e.operation === FileOperation.MOVE;
            if (isMove || e.operation === FileOperation.DELETE) {
                for (const pair of e.files) {
                    const removed = isMove ? pair.source : pair.target;
                    if (removed) {
                        this._modelReferenceCollection.remove(removed);
                    }
                }
            }
        }));
    }
    dispose() {
        dispose(( this._modelTrackers.values()));
        this._modelTrackers.clear();
        super.dispose();
    }
    isCaughtUpWithContentChanges(resource) {
        const tracker = this._modelTrackers.get(resource);
        if (tracker) {
            return tracker.isCaughtUpWithContentChanges();
        }
        return true;
    }
    _shouldHandleFileEvent(resource) {
        const model = this._modelService.getModel(resource);
        return !!model && shouldSynchronizeModel(model);
    }
    handleModelAdded(model) {
        if (!shouldSynchronizeModel(model)) {
            return;
        }
        this._modelTrackers.set(model.uri, ( new ModelTracker(
            model,
            this._onIsCaughtUpWithContentChanges,
            this._proxy,
            this._textFileService
        )));
    }
    _onModelModeChanged(event) {
        const {
            model
        } = event;
        if (!( this._modelTrackers.has(model.uri))) {
            return;
        }
        this._proxy.$acceptModelLanguageChanged(model.uri, model.getLanguageId());
    }
    handleModelRemoved(modelUrl) {
        if (!( this._modelTrackers.has(modelUrl))) {
            return;
        }
        this._modelTrackers.get(modelUrl).dispose();
        this._modelTrackers.delete(modelUrl);
    }
    async $trySaveDocument(uri) {
        const target = await this._textFileService.save(URI.revive(uri));
        return Boolean(target);
    }
    async $tryOpenDocument(uriData, options) {
        const inputUri = URI.revive(uriData);
        if (!inputUri.scheme || !(inputUri.fsPath || inputUri.authority)) {
            throw ( new ErrorNoTelemetry(`Invalid uri. Scheme and authority or path must be set.`));
        }
        const canonicalUri = this._uriIdentityService.asCanonicalUri(inputUri);
        let promise;
        switch (canonicalUri.scheme) {
        case Schemas.untitled:
            promise = this._handleUntitledScheme(canonicalUri, options);
            break;
        case Schemas.file:
        default:
            promise = this._handleAsResourceInput(canonicalUri, options);
            break;
        }
        let documentUri;
        try {
            documentUri = await promise;
        } catch (err) {
            throw ( new ErrorNoTelemetry(`cannot open ${( canonicalUri.toString())}. Detail: ${toErrorMessage(err)}`));
        }
        if (!documentUri) {
            throw ( new ErrorNoTelemetry(`cannot open ${( canonicalUri.toString())}`));
        } else if (!extUri.isEqual(documentUri, canonicalUri)) {
            throw ( new ErrorNoTelemetry(`cannot open ${( canonicalUri.toString())}. Detail: Actual document opened as ${( documentUri.toString())}`));
        } else if (!( this._modelTrackers.has(canonicalUri))) {
            throw ( new ErrorNoTelemetry(`cannot open ${( canonicalUri.toString())}. Detail: Files above 50MB cannot be synchronized with extensions.`));
        } else {
            return canonicalUri;
        }
    }
    $tryCreateDocument(options) {
        return this._doCreateUntitled(undefined, options);
    }
    async _handleAsResourceInput(uri, options) {
        if (options?.encoding) {
            const model = await this._textFileService.files.resolve(uri, {
                encoding: options.encoding,
                reason: TextFileResolveReason.REFERENCE
            });
            if (model.isDirty()) {
                throw ( new ErrorNoTelemetry(
                    `Cannot re-open a dirty text document with different encoding. Save it first.`
                ));
            }
            await model.setEncoding(options.encoding, EncodingMode.Decode);
        }
        const ref = await this._textModelResolverService.createModelReference(uri);
        this._modelReferenceCollection.add(uri, ref, ref.object.textEditorModel.getValueLength());
        return ref.object.textEditorModel.uri;
    }
    async _handleUntitledScheme(uri, options) {
        const asLocalUri = toLocalResource(
            uri,
            this._environmentService.remoteAuthority,
            this._pathService.defaultUriScheme
        );
        const exists = await this._fileService.exists(asLocalUri);
        if (exists) {
            return Promise.reject(( new Error("file already exists")));
        }
        return await this._doCreateUntitled(Boolean(uri.path) ? uri : undefined, options);
    }
    async _doCreateUntitled(associatedResource, options) {
        const model = this._textFileService.untitled.create({
            associatedResource,
            languageId: options?.language,
            initialValue: options?.content,
            encoding: options?.encoding
        });
        if (options?.encoding) {
            await model.setEncoding(options.encoding);
        }
        const resource = model.resource;
        const ref = await this._textModelResolverService.createModelReference(resource);
        if (!( this._modelTrackers.has(resource))) {
            ref.dispose();
            throw ( new Error(`expected URI ${( resource.toString())} to have come to LIFE`));
        }
        this._modelReferenceCollection.add(resource, ref, ref.object.textEditorModel.getValueLength());
        Event.once(model.onDidRevert)(() => this._modelReferenceCollection.remove(resource));
        this._proxy.$acceptDirtyStateChanged(resource, true);
        return resource;
    }
};
MainThreadDocuments = ( __decorate([( __param(1, IModelService)), ( __param(2, ITextFileService)), ( __param(3, IFileService)), ( __param(4, ITextModelService)), ( __param(5, IWorkbenchEnvironmentService)), ( __param(6, IUriIdentityService)), ( __param(7, IWorkingCopyFileService)), ( __param(8, IPathService))], MainThreadDocuments));

export { BoundModelReferenceCollection, MainThreadDocuments };
