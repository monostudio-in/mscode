
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { isNonEmptyArray } from '@codingame/monaco-vscode-api/vscode/vs/base/common/arrays';
import { CancellationToken } from '@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation';
import { onUnexpectedError } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';
import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { DisposableMap, DisposableStore, toDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { ILanguageService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/language.service';
import { NotebookDto } from './mainThreadNotebookDto.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { INotebookEditorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/services/notebookEditorService.service';
import { INotebookExecutionStateService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookExecutionStateService.service';
import { INotebookKernelService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookKernelService.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { INotebookService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookService.service';
import { AsyncIterableProducer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';

class MainThreadKernel {
    get preloadUris() {
        return ( this.preloads.map(p => p.uri));
    }
    get preloadProvides() {
        return this.preloads.flatMap(p => p.provides);
    }
    constructor(data, _languageService) {
        this._languageService = _languageService;
        this._onDidChange = ( new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.id = data.id;
        this.viewType = data.notebookType;
        this.extension = data.extensionId;
        this.implementsInterrupt = data.supportsInterrupt ?? false;
        this.label = data.label;
        this.description = data.description;
        this.detail = data.detail;
        this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : _languageService.getRegisteredLanguageIds();
        this.implementsExecutionOrder = data.supportsExecutionOrder ?? false;
        this.hasVariableProvider = data.hasVariableProvider ?? false;
        this.localResourceRoot = URI.revive(data.extensionLocation);
        this.preloads = data.preloads?.map(u => ({
            uri: URI.revive(u.uri),
            provides: u.provides
        })) ?? [];
    }
    update(data) {
        const event = Object.create(null);
        if (data.label !== undefined) {
            this.label = data.label;
            event.label = true;
        }
        if (data.description !== undefined) {
            this.description = data.description;
            event.description = true;
        }
        if (data.detail !== undefined) {
            this.detail = data.detail;
            event.detail = true;
        }
        if (data.supportedLanguages !== undefined) {
            this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : this._languageService.getRegisteredLanguageIds();
            event.supportedLanguages = true;
        }
        if (data.supportsExecutionOrder !== undefined) {
            this.implementsExecutionOrder = data.supportsExecutionOrder;
            event.hasExecutionOrder = true;
        }
        if (data.supportsInterrupt !== undefined) {
            this.implementsInterrupt = data.supportsInterrupt;
            event.hasInterruptHandler = true;
        }
        if (data.hasVariableProvider !== undefined) {
            this.hasVariableProvider = data.hasVariableProvider;
            event.hasVariableProvider = true;
        }
        this._onDidChange.fire(event);
    }
}
class MainThreadKernelDetectionTask {
    constructor(notebookType) {
        this.notebookType = notebookType;
    }
}
let MainThreadNotebookKernels = class MainThreadNotebookKernels {
    constructor(
        extHostContext,
        _languageService,
        _notebookKernelService,
        _notebookExecutionStateService,
        _notebookService,
        notebookEditorService
    ) {
        this._languageService = _languageService;
        this._notebookKernelService = _notebookKernelService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._notebookService = _notebookService;
        this._editors = ( new DisposableMap());
        this._disposables = ( new DisposableStore());
        this._kernels = ( new Map());
        this._kernelDetectionTasks = ( new Map());
        this._kernelSourceActionProviders = ( new Map());
        this._kernelSourceActionProvidersEventRegistrations = ( new Map());
        this._executions = ( new Map());
        this._notebookExecutions = ( new Map());
        this.variableRequestIndex = 0;
        this.variableRequestMap = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostNotebookKernels));
        notebookEditorService.listNotebookEditors().forEach(this._onEditorAdd, this);
        notebookEditorService.onDidAddNotebookEditor(this._onEditorAdd, this, this._disposables);
        notebookEditorService.onDidRemoveNotebookEditor(this._onEditorRemove, this, this._disposables);
        this._disposables.add(toDisposable(() => {
            this._executions.forEach(e => {
                e.complete({});
            });
            this._notebookExecutions.forEach(e => e.complete());
        }));
        this._disposables.add(this._notebookKernelService.onDidChangeSelectedNotebooks(e => {
            for (const [handle, [kernel]] of this._kernels) {
                if (e.oldKernel === kernel.id) {
                    this._proxy.$acceptNotebookAssociation(handle, e.notebook, false);
                } else if (e.newKernel === kernel.id) {
                    this._proxy.$acceptNotebookAssociation(handle, e.notebook, true);
                }
            }
        }));
    }
    dispose() {
        this._disposables.dispose();
        for (const [, registration] of ( this._kernels.values())) {
            registration.dispose();
        }
        for (const [, registration] of ( this._kernelDetectionTasks.values())) {
            registration.dispose();
        }
        for (const [, registration] of ( this._kernelSourceActionProviders.values())) {
            registration.dispose();
        }
        this._editors.dispose();
    }
    _onEditorAdd(editor) {
        const ipcListener = editor.onDidReceiveMessage(e => {
            if (!editor.hasModel()) {
                return;
            }
            const {
                selected
            } = this._notebookKernelService.getMatchingKernel(editor.textModel);
            if (!selected) {
                return;
            }
            for (const [handle, candidate] of this._kernels) {
                if (candidate[0] === selected) {
                    this._proxy.$acceptKernelMessageFromRenderer(handle, editor.getId(), e.message);
                    break;
                }
            }
        });
        this._editors.set(editor, ipcListener);
    }
    _onEditorRemove(editor) {
        this._editors.deleteAndDispose(editor);
    }
    async $postMessage(handle, editorId, message) {
        const tuple = this._kernels.get(handle);
        if (!tuple) {
            throw ( new Error("kernel already disposed"));
        }
        const [kernel] = tuple;
        let didSend = false;
        for (const [editor] of this._editors) {
            if (!editor.hasModel()) {
                continue;
            }
            if (this._notebookKernelService.getMatchingKernel(editor.textModel).selected !== kernel) {
                continue;
            }
            if (editorId === undefined) {
                editor.postMessage(message);
                didSend = true;
            } else if (editor.getId() === editorId) {
                editor.postMessage(message);
                didSend = true;
                break;
            }
        }
        return didSend;
    }
    $receiveVariable(requestId, variable) {
        const emitter = this.variableRequestMap.get(requestId);
        if (emitter) {
            emitter.emitOne(variable);
        }
    }
    async $addKernel(handle, data) {
        const that = this;
        const kernel = new (class extends MainThreadKernel {
            async executeNotebookCellsRequest(uri, handles) {
                await that._proxy.$executeCells(handle, uri, handles);
            }
            async cancelNotebookCellExecution(uri, handles) {
                await that._proxy.$cancelCells(handle, uri, handles);
            }
            provideVariables(notebookUri, parentId, kind, start, token) {
                const requestId = `${handle}variables${that.variableRequestIndex++}`;
                return new AsyncIterableProducer(async emitter => {
                    that.variableRequestMap.set(requestId, emitter);
                    try {
                        await that._proxy.$provideVariables(handle, requestId, notebookUri, parentId, kind, start, token);
                    } finally {
                        that.variableRequestMap.delete(requestId);
                    }
                });
            }
        })(data, this._languageService);
        const disposables = this._disposables.add(( new DisposableStore()));
        this._kernels.set(handle, [kernel, disposables]);
        disposables.add(this._notebookKernelService.registerKernel(kernel));
    }
    $updateKernel(handle, data) {
        const tuple = this._kernels.get(handle);
        if (tuple) {
            tuple[0].update(data);
        }
    }
    $removeKernel(handle) {
        const tuple = this._kernels.get(handle);
        if (tuple) {
            tuple[1].dispose();
            this._kernels.delete(handle);
        }
    }
    $updateNotebookPriority(handle, notebook, value) {
        const tuple = this._kernels.get(handle);
        if (tuple) {
            this._notebookKernelService.updateKernelNotebookAffinity(tuple[0], URI.revive(notebook), value);
        }
    }
    $createExecution(handle, controllerId, rawUri, cellHandle) {
        const uri = URI.revive(rawUri);
        const notebook = this._notebookService.getNotebookTextModel(uri);
        if (!notebook) {
            throw ( new Error(`Notebook not found: ${( uri.toString())}`));
        }
        const kernel = this._notebookKernelService.getMatchingKernel(notebook);
        if (!kernel.selected || kernel.selected.id !== controllerId) {
            throw ( new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`));
        }
        const execution = this._notebookExecutionStateService.createCellExecution(uri, cellHandle);
        execution.confirm();
        this._executions.set(handle, execution);
    }
    $updateExecution(handle, data) {
        const updates = data.value;
        try {
            const execution = this._executions.get(handle);
            execution?.update(( updates.map(NotebookDto.fromCellExecuteUpdateDto)));
        } catch (e) {
            onUnexpectedError(e);
        }
    }
    $completeExecution(handle, data) {
        try {
            const execution = this._executions.get(handle);
            execution?.complete(NotebookDto.fromCellExecuteCompleteDto(data.value));
        } catch (e) {
            onUnexpectedError(e);
        } finally {
            this._executions.delete(handle);
        }
    }
    $createNotebookExecution(handle, controllerId, rawUri) {
        const uri = URI.revive(rawUri);
        const notebook = this._notebookService.getNotebookTextModel(uri);
        if (!notebook) {
            throw ( new Error(`Notebook not found: ${( uri.toString())}`));
        }
        const kernel = this._notebookKernelService.getMatchingKernel(notebook);
        if (!kernel.selected || kernel.selected.id !== controllerId) {
            throw ( new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`));
        }
        const execution = this._notebookExecutionStateService.createExecution(uri);
        execution.confirm();
        this._notebookExecutions.set(handle, execution);
    }
    $beginNotebookExecution(handle) {
        try {
            const execution = this._notebookExecutions.get(handle);
            execution?.begin();
        } catch (e) {
            onUnexpectedError(e);
        }
    }
    $completeNotebookExecution(handle) {
        try {
            const execution = this._notebookExecutions.get(handle);
            execution?.complete();
        } catch (e) {
            onUnexpectedError(e);
        } finally {
            this._notebookExecutions.delete(handle);
        }
    }
    async $addKernelDetectionTask(handle, notebookType) {
        const kernelDetectionTask = ( new MainThreadKernelDetectionTask(notebookType));
        const registration = this._notebookKernelService.registerNotebookKernelDetectionTask(kernelDetectionTask);
        this._kernelDetectionTasks.set(handle, [kernelDetectionTask, registration]);
    }
    $removeKernelDetectionTask(handle) {
        const tuple = this._kernelDetectionTasks.get(handle);
        if (tuple) {
            tuple[1].dispose();
            this._kernelDetectionTasks.delete(handle);
        }
    }
    async $addKernelSourceActionProvider(handle, eventHandle, notebookType) {
        const kernelSourceActionProvider = {
            viewType: notebookType,
            provideKernelSourceActions: async () => {
                const actions = await this._proxy.$provideKernelSourceActions(handle, CancellationToken.None);
                return ( actions.map(action => {
                    let documentation = action.documentation;
                    if (action.documentation && typeof action.documentation !== "string") {
                        documentation = URI.revive(action.documentation);
                    }
                    return {
                        label: action.label,
                        command: action.command,
                        description: action.description,
                        detail: action.detail,
                        documentation
                    };
                }));
            }
        };
        if (typeof eventHandle === "number") {
            const emitter = ( new Emitter());
            this._kernelSourceActionProvidersEventRegistrations.set(eventHandle, emitter);
            kernelSourceActionProvider.onDidChangeSourceActions = emitter.event;
        }
        const registration = this._notebookKernelService.registerKernelSourceActionProvider(notebookType, kernelSourceActionProvider);
        this._kernelSourceActionProviders.set(handle, [kernelSourceActionProvider, registration]);
    }
    $removeKernelSourceActionProvider(handle, eventHandle) {
        const tuple = this._kernelSourceActionProviders.get(handle);
        if (tuple) {
            tuple[1].dispose();
            this._kernelSourceActionProviders.delete(handle);
        }
        if (typeof eventHandle === "number") {
            this._kernelSourceActionProvidersEventRegistrations.delete(eventHandle);
        }
    }
    $emitNotebookKernelSourceActionsChangeEvent(eventHandle) {
        const emitter = this._kernelSourceActionProvidersEventRegistrations.get(eventHandle);
        if (emitter instanceof Emitter) {
            emitter.fire(undefined);
        }
    }
    $variablesUpdated(notebookUri) {
        this._notebookKernelService.notifyVariablesChange(URI.revive(notebookUri));
    }
};
MainThreadNotebookKernels = __decorate([
    extHostNamedCustomer(MainContext.MainThreadNotebookKernels),
    ( __param(1, ILanguageService)),
    ( __param(2, INotebookKernelService)),
    ( __param(3, INotebookExecutionStateService)),
    ( __param(4, INotebookService)),
    ( __param(5, INotebookEditorService))
], MainThreadNotebookKernels);

export { MainThreadNotebookKernels };
