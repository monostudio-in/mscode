
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { illegalArgument } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';
import { DisposableStore, dispose } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { equals } from '@codingame/monaco-vscode-api/vscode/vs/base/common/objects';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { ICodeEditorService } from '@codingame/monaco-vscode-api/vscode/vs/editor/browser/services/codeEditorService.service';
import { CommandsRegistry } from '@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands';
import { isTextEditorDiffInformationEqual, EditorResolution, EditorActivation } from '@codingame/monaco-vscode-api/vscode/vs/platform/editor/common/editor';
import { ExtHostContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { editorGroupToColumn, columnToEditorGroup } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupColumn';
import { IEditorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service';
import { IEditorGroupsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService.service';
import { IEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service';
import { IWorkingCopyService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/workingCopy/common/workingCopyService.service';
import { getCodeEditor } from '@codingame/monaco-vscode-api/vscode/vs/editor/browser/editorBrowser';
import { IConfigurationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service';
import { IQuickDiffModelService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/scm/browser/quickDiffModel.service';
import '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/index';
import { IUriIdentityService } from '@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service';
import { isITextModel } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/model';
import { equals as equals$1 } from '@codingame/monaco-vscode-api/vscode/vs/base/common/arrays';
import { Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { autorun } from '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/reactions/autorun';
import { constObservable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/observables/constObservable';
import { observableFromEvent } from '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/observables/observableFromEvent';
import { derived, derivedOpts } from '@codingame/monaco-vscode-api/vscode/vs/base/common/observableInternal/observables/derived';

var MainThreadTextEditors_1;
let MainThreadTextEditors = class MainThreadTextEditors {
    static {
        MainThreadTextEditors_1 = this;
    }
    static {
        this.INSTANCE_COUNT = 0;
    }
    constructor(
        _editorLocator,
        extHostContext,
        _codeEditorService,
        _editorService,
        _editorGroupService,
        _configurationService,
        _quickDiffModelService,
        _uriIdentityService
    ) {
        this._editorLocator = _editorLocator;
        this._codeEditorService = _codeEditorService;
        this._editorService = _editorService;
        this._editorGroupService = _editorGroupService;
        this._configurationService = _configurationService;
        this._quickDiffModelService = _quickDiffModelService;
        this._uriIdentityService = _uriIdentityService;
        this._toDispose = ( new DisposableStore());
        this._instanceId = String(++MainThreadTextEditors_1.INSTANCE_COUNT);
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostEditors));
        this._textEditorsListenersMap = Object.create(null);
        this._editorPositionData = null;
        this._toDispose.add(
            this._editorService.onDidVisibleEditorsChange(() => this._updateActiveAndVisibleTextEditors())
        );
        this._toDispose.add(
            this._editorGroupService.onDidRemoveGroup(() => this._updateActiveAndVisibleTextEditors())
        );
        this._toDispose.add(
            this._editorGroupService.onDidMoveGroup(() => this._updateActiveAndVisibleTextEditors())
        );
        this._registeredDecorationTypes = Object.create(null);
    }
    dispose() {
        ( Object.keys(this._textEditorsListenersMap)).forEach(editorId => {
            dispose(this._textEditorsListenersMap[editorId]);
        });
        this._textEditorsListenersMap = Object.create(null);
        this._toDispose.dispose();
        for (const decorationType in this._registeredDecorationTypes) {
            this._codeEditorService.removeDecorationType(decorationType);
        }
        this._registeredDecorationTypes = Object.create(null);
    }
    handleTextEditorAdded(textEditor) {
        const id = textEditor.getId();
        const toDispose = [];
        toDispose.push(textEditor.onPropertiesChanged(data => {
            this._proxy.$acceptEditorPropertiesChanged(id, data);
        }));
        const diffInformationObs = this._getTextEditorDiffInformation(textEditor, toDispose);
        toDispose.push(autorun(reader => {
            const diffInformation = diffInformationObs.read(reader);
            this._proxy.$acceptEditorDiffInformation(id, diffInformation);
        }));
        this._textEditorsListenersMap[id] = toDispose;
    }
    handleTextEditorRemoved(id) {
        dispose(this._textEditorsListenersMap[id]);
        delete this._textEditorsListenersMap[id];
    }
    _updateActiveAndVisibleTextEditors() {
        const editorPositionData = this._getTextEditorPositionData();
        if (!equals(this._editorPositionData, editorPositionData)) {
            this._editorPositionData = editorPositionData;
            this._proxy.$acceptEditorPositionData(this._editorPositionData);
        }
    }
    _getTextEditorPositionData() {
        const result = Object.create(null);
        for (const editorPane of this._editorService.visibleEditorPanes) {
            const id = this._editorLocator.findTextEditorIdFor(editorPane);
            if (id) {
                result[id] = editorGroupToColumn(this._editorGroupService, editorPane.group);
            }
        }
        return result;
    }
    _getTextEditorDiffInformation(textEditor, toDispose) {
        const codeEditor = textEditor.getCodeEditor();
        if (!codeEditor) {
            return constObservable(undefined);
        }
        const [diffEditor] = this._codeEditorService.listDiffEditors().filter(
            d => d.getOriginalEditor().getId() === codeEditor.getId() || d.getModifiedEditor().getId() === codeEditor.getId()
        );
        const editorModelObs = diffEditor ? observableFromEvent(this, diffEditor.onDidChangeModel, () => diffEditor.getModel()) : observableFromEvent(this, codeEditor.onDidChangeModel, () => codeEditor.getModel());
        const editorChangesObs = derived(reader => {
            const editorModel = editorModelObs.read(reader);
            if (!editorModel) {
                return constObservable(undefined);
            }
            if (isITextModel(editorModel)) {
                const quickDiffModelRef = this._quickDiffModelService.createQuickDiffModelReference(editorModel.uri);
                if (!quickDiffModelRef) {
                    return constObservable(undefined);
                }
                toDispose.push(quickDiffModelRef);
                return observableFromEvent(this, quickDiffModelRef.object.onDidChange, () => {
                    return ( quickDiffModelRef.object.getQuickDiffResults().map(result => ({
                        original: result.original,
                        modified: result.modified,
                        changes: result.changes2
                    })));
                });
            }
            const diffAlgorithm = this._configurationService.getValue("diffEditor.diffAlgorithm");
            const quickDiffModelRef = this._quickDiffModelService.createQuickDiffModelReference(editorModel.modified.uri, {
                algorithm: diffAlgorithm
            });
            if (!quickDiffModelRef) {
                return constObservable(undefined);
            }
            toDispose.push(quickDiffModelRef);
            return observableFromEvent(
                Event.any(quickDiffModelRef.object.onDidChange, diffEditor.onDidUpdateDiff),
                () => {
                    const diffChanges = diffEditor.getDiffComputationResult()?.changes2 ?? [];
                    const diffInformation = [{
                        original: editorModel.original.uri,
                        modified: editorModel.modified.uri,
                        changes: ( diffChanges.map(change => change))
                    }];
                    const quickDiffInformation = ( quickDiffModelRef.object.getQuickDiffResults().filter(result => result.providerKind !== "primary").map(result => ({
                        original: result.original,
                        modified: result.modified,
                        changes: result.changes2
                    })));
                    return diffInformation.concat(quickDiffInformation);
                }
            );
        });
        return derivedOpts({
            owner: this,
            equalsFn: (diff1, diff2) => equals$1(
                diff1,
                diff2,
                (a, b) => isTextEditorDiffInformationEqual(this._uriIdentityService, a, b)
            )
        }, reader => {
            const editorModel = editorModelObs.read(reader);
            const editorChanges = editorChangesObs.read(reader).read(reader);
            if (!editorModel || !editorChanges) {
                return undefined;
            }
            const documentVersion = isITextModel(editorModel) ? editorModel.getVersionId() : editorModel.modified.getVersionId();
            return ( editorChanges.map(change => {
                const changes = ( change.changes.map(change => [
                    change.original.startLineNumber,
                    change.original.endLineNumberExclusive,
                    change.modified.startLineNumber,
                    change.modified.endLineNumberExclusive
                ]));
                return {
                    documentVersion,
                    original: change.original,
                    modified: change.modified,
                    changes
                };
            }));
        });
    }
    async $tryShowTextDocument(resource, options) {
        const uri = URI.revive(resource);
        const editorOptions = {
            preserveFocus: options.preserveFocus,
            pinned: options.pinned,
            selection: options.selection,
            activation: options.preserveFocus ? EditorActivation.RESTORE : undefined,
            override: EditorResolution.EXCLUSIVE_ONLY
        };
        const input = {
            resource: uri,
            options: editorOptions
        };
        const editor = await this._editorService.openEditor(
            input,
            columnToEditorGroup(this._editorGroupService, this._configurationService, options.position)
        );
        if (!editor) {
            return undefined;
        }
        const editorControl = editor.getControl();
        const codeEditor = getCodeEditor(editorControl);
        return codeEditor ? this._editorLocator.getIdOfCodeEditor(codeEditor) : undefined;
    }
    async $tryShowEditor(id, position) {
        const mainThreadEditor = this._editorLocator.getEditor(id);
        if (mainThreadEditor) {
            const model = mainThreadEditor.getModel();
            await this._editorService.openEditor({
                resource: model.uri,
                options: {
                    preserveFocus: false
                }
            }, columnToEditorGroup(this._editorGroupService, this._configurationService, position));
            return;
        }
    }
    async $tryHideEditor(id) {
        const mainThreadEditor = this._editorLocator.getEditor(id);
        if (mainThreadEditor) {
            const editorPanes = this._editorService.visibleEditorPanes;
            for (const editorPane of editorPanes) {
                if (mainThreadEditor.matches(editorPane)) {
                    await editorPane.group.closeEditor(editorPane.input);
                    return;
                }
            }
        }
    }
    $trySetSelections(id, selections) {
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(illegalArgument(`TextEditor(${id})`));
        }
        editor.setSelections(selections);
        return Promise.resolve(undefined);
    }
    $trySetDecorations(id, key, ranges) {
        key = `${this._instanceId}-${key}`;
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(illegalArgument(`TextEditor(${id})`));
        }
        editor.setDecorations(key, ranges);
        return Promise.resolve(undefined);
    }
    $trySetDecorationsFast(id, key, ranges) {
        key = `${this._instanceId}-${key}`;
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(illegalArgument(`TextEditor(${id})`));
        }
        editor.setDecorationsFast(key, ranges);
        return Promise.resolve(undefined);
    }
    $tryRevealRange(id, range, revealType) {
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(illegalArgument(`TextEditor(${id})`));
        }
        editor.revealRange(range, revealType);
        return Promise.resolve();
    }
    $trySetOptions(id, options) {
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(illegalArgument(`TextEditor(${id})`));
        }
        editor.setConfiguration(options);
        return Promise.resolve(undefined);
    }
    $tryApplyEdits(id, modelVersionId, edits, opts) {
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(illegalArgument(`TextEditor(${id})`));
        }
        return Promise.resolve(editor.applyEdits(modelVersionId, edits, opts));
    }
    $tryInsertSnippet(id, modelVersionId, template, ranges, opts) {
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(illegalArgument(`TextEditor(${id})`));
        }
        return Promise.resolve(editor.insertSnippet(modelVersionId, template, ranges, opts));
    }
    $registerTextEditorDecorationType(extensionId, key, options) {
        key = `${this._instanceId}-${key}`;
        this._registeredDecorationTypes[key] = true;
        this._codeEditorService.registerDecorationType(`exthost-api-${extensionId}`, key, options);
    }
    $removeTextEditorDecorationType(key) {
        key = `${this._instanceId}-${key}`;
        delete this._registeredDecorationTypes[key];
        this._codeEditorService.removeDecorationType(key);
    }
    $getDiffInformation(id) {
        const editor = this._editorLocator.getEditor(id);
        if (!editor) {
            return Promise.reject(( new Error("No such TextEditor")));
        }
        const codeEditor = editor.getCodeEditor();
        if (!codeEditor) {
            return Promise.reject(( new Error("No such CodeEditor")));
        }
        const codeEditorId = codeEditor.getId();
        const diffEditors = this._codeEditorService.listDiffEditors();
        const [diffEditor] = diffEditors.filter(
            d => d.getOriginalEditor().getId() === codeEditorId || d.getModifiedEditor().getId() === codeEditorId
        );
        if (diffEditor) {
            return Promise.resolve(diffEditor.getLineChanges() || []);
        }
        if (!codeEditor.hasModel()) {
            return Promise.resolve([]);
        }
        const quickDiffModelRef = this._quickDiffModelService.createQuickDiffModelReference(codeEditor.getModel().uri);
        if (!quickDiffModelRef) {
            return Promise.resolve([]);
        }
        try {
            const primaryQuickDiff = quickDiffModelRef.object.quickDiffs.find(quickDiff => quickDiff.kind === "primary");
            const primaryQuickDiffChanges = quickDiffModelRef.object.changes.filter(change => change.providerId === primaryQuickDiff?.id);
            return Promise.resolve(( primaryQuickDiffChanges.map(change => change.change)) ?? []);
        } finally {
            quickDiffModelRef.dispose();
        }
    }
};
MainThreadTextEditors = MainThreadTextEditors_1 = ( __decorate([( __param(2, ICodeEditorService)), ( __param(3, IEditorService)), ( __param(4, IEditorGroupsService)), ( __param(5, IConfigurationService)), ( __param(6, IQuickDiffModelService)), ( __param(7, IUriIdentityService))], MainThreadTextEditors));
CommandsRegistry.registerCommand("_workbench.revertAllDirty", async function(accessor) {
    const environmentService = accessor.get(IEnvironmentService);
    if (!environmentService.extensionTestsLocationURI) {
        throw ( new Error("Command is only available when running extension tests."));
    }
    const workingCopyService = accessor.get(IWorkingCopyService);
    for (const workingCopy of workingCopyService.dirtyWorkingCopies) {
        await workingCopy.revert({
            soft: true
        });
    }
});

export { MainThreadTextEditors };
