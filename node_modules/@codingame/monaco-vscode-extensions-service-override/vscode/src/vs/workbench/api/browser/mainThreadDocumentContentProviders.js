
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { onUnexpectedError } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';
import { DisposableMap, dispose } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { EditOperation } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/core/editOperation';
import { Range } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/core/range';
import { IEditorWorkerService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/services/editorWorker.service';
import { IModelService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/services/model.service';
import { ILanguageService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/language.service';
import { ITextModelService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/services/resolverService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { CancellationTokenSource } from '@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation';

let MainThreadDocumentContentProviders = class MainThreadDocumentContentProviders {
    constructor(
        extHostContext,
        _textModelResolverService,
        _languageService,
        _modelService,
        _editorWorkerService
    ) {
        this._textModelResolverService = _textModelResolverService;
        this._languageService = _languageService;
        this._modelService = _modelService;
        this._editorWorkerService = _editorWorkerService;
        this._resourceContentProvider = ( new DisposableMap());
        this._pendingUpdate = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostDocumentContentProviders));
    }
    dispose() {
        this._resourceContentProvider.dispose();
        dispose(( this._pendingUpdate.values()));
    }
    $registerTextContentProvider(handle, scheme) {
        const registration = this._textModelResolverService.registerTextModelContentProvider(scheme, {
            provideTextContent: uri => {
                return this._proxy.$provideTextDocumentContent(handle, uri).then(value => {
                    if (typeof value === "string") {
                        const firstLineText = value.substr(0, 1 + value.search(/\r?\n/));
                        const languageSelection = this._languageService.createByFilepathOrFirstLine(uri, firstLineText);
                        return this._modelService.createModel(value, languageSelection, uri);
                    }
                    return null;
                });
            }
        });
        this._resourceContentProvider.set(handle, registration);
    }
    $unregisterTextContentProvider(handle) {
        this._resourceContentProvider.deleteAndDispose(handle);
    }
    async $onVirtualDocumentChange(uri, value) {
        const model = this._modelService.getModel(URI.revive(uri));
        if (!model) {
            return;
        }
        const pending = this._pendingUpdate.get(model.id);
        pending?.cancel();
        const myToken = ( new CancellationTokenSource());
        this._pendingUpdate.set(model.id, myToken);
        try {
            const edits = await this._editorWorkerService.computeMoreMinimalEdits(model.uri, [{
                text: value,
                range: model.getFullModelRange()
            }]);
            this._pendingUpdate.delete(model.id);
            if (myToken.token.isCancellationRequested) {
                return;
            }
            if (model.isDisposed()) {
                return;
            }
            if (edits && edits.length > 0) {
                model.applyEdits(( edits.map(edit => EditOperation.replace(Range.lift(edit.range), edit.text))));
            }
        } catch (error) {
            onUnexpectedError(error);
        }
    }
};
MainThreadDocumentContentProviders = __decorate([
    extHostNamedCustomer(MainContext.MainThreadDocumentContentProviders),
    ( __param(1, ITextModelService)),
    ( __param(2, ILanguageService)),
    ( __param(3, IModelService)),
    ( __param(4, IEditorWorkerService))
], MainThreadDocumentContentProviders);

export { MainThreadDocumentContentProviders };
