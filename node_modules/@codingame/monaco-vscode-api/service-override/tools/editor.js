
import { __decorate, __param } from '../../external/tslib/tslib.es6.js';
import { StandaloneServices } from '../../vscode/src/vs/editor/standalone/browser/standaloneServices.js';
import { ICodeEditorService } from '../../vscode/src/vs/editor/browser/services/codeEditorService.service.js';
import { isPreferredGroup, SIDE_GROUP } from '../../vscode/src/vs/workbench/services/editor/common/editorService.js';
import { IEditorService } from '../../vscode/src/vs/workbench/services/editor/common/editorService.service.js';
import { isEditorInput, isResourceEditorInput, GroupModelChangeKind, EditorCloseContext } from '../../vscode/src/vs/workbench/common/editor.js';
import { Event, Emitter } from '../../vscode/src/vs/base/common/event.js';
import '../../vscode/src/vs/base/common/resources.js';
import { applyTextEditorOptions } from '../../vscode/src/vs/workbench/common/editor/editorOptions.js';
import { ScrollType } from '../../vscode/src/vs/editor/common/editorCommon.js';
import { DEFAULT_EDITOR_MIN_DIMENSIONS, DEFAULT_EDITOR_MAX_DIMENSIONS } from '../../vscode/src/vs/workbench/browser/parts/editor/editor.js';
import { ITextModelService } from '../../vscode/src/vs/editor/common/services/resolverService.service.js';
import { StandaloneEditor, StandaloneCodeEditor } from '../../vscode/src/vs/editor/standalone/browser/standaloneCodeEditor.js';
import { Disposable } from '../../vscode/src/vs/base/common/lifecycle.js';
import { EditorService } from '../../vscode/src/vs/workbench/services/editor/browser/editorService.js';
import '../../vscode/src/vs/workbench/services/editor/common/editorGroupsService.js';
import { IEditorGroupsService } from '../../vscode/src/vs/workbench/services/editor/common/editorGroupsService.service.js';
import { IInstantiationService } from '../../vscode/src/vs/platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../vscode/src/vs/platform/configuration/common/configuration.service.js';
import { IWorkspaceTrustRequestService } from '../../vscode/src/vs/platform/workspace/common/workspaceTrust.service.js';
import { IEditorResolverService } from '../../vscode/src/vs/workbench/services/editor/common/editorResolverService.service.js';
import { IUriIdentityService } from '../../vscode/src/vs/platform/uriIdentity/common/uriIdentity.service.js';
import { IWorkspaceContextService } from '../../vscode/src/vs/platform/workspace/common/workspace.service.js';
import { IFileService } from '../../vscode/src/vs/platform/files/common/files.service.js';
import { ITextEditorService } from '../../vscode/src/vs/workbench/services/textfile/common/textEditorService.service.js';
import { IHostService } from '../../vscode/src/vs/workbench/services/host/browser/host.service.js';
import { TextResourceEditorInput } from '../../vscode/src/vs/workbench/common/editor/textResourceEditorInput.js';
import { IContextKeyService } from '../../vscode/src/vs/platform/contextkey/common/contextkey.service.js';
import '../../vscode/src/vs/base/common/charCode.js';
import '../../vscode/src/vs/base/common/marshallingIds.js';
import '../../vscode/src/vs/base/common/path.js';
import '../../vscode/src/vs/base/common/platform.js';
import { mainWindow } from '../../vscode/src/vs/base/browser/window.js';
import { unsupported } from '../../tools.js';

var StandaloneEditorGroup_1;
class EmptyEditorGroup {
    constructor() {
        this.selectedEditors = [];
        this.isSelected = () => false;
        this.setSelection = unsupported;
        this.isTransient = () => false;
        this.windowId = mainWindow.vscodeWindowId;
        this.createEditorActions = unsupported;
        this.onDidFocus = Event.None;
        this.onDidOpenEditorFail = Event.None;
        this.whenRestored = Promise.resolve();
        this.disposed = false;
        this.setActive = unsupported;
        this.notifyIndexChanged = unsupported;
        this.relayout = unsupported;
        this.dispose = unsupported;
        this.toJSON = unsupported;
        this.minimumWidth = 0;
        this.maximumWidth = Number.POSITIVE_INFINITY;
        this.minimumHeight = 0;
        this.maximumHeight = Number.POSITIVE_INFINITY;
        this.onDidChange = Event.None;
        this.layout = unsupported;
        this.onDidModelChange = Event.None;
        this.onWillDispose = Event.None;
        this.onDidActiveEditorChange = Event.None;
        this.onWillCloseEditor = Event.None;
        this.onDidCloseEditor = Event.None;
        this.onWillMoveEditor = Event.None;
        this.onWillOpenEditor = Event.None;
        this.id = 0;
        this.index = 0;
        this.label = 'main';
        this.ariaLabel = 'main';
        this.activeEditorPane = undefined;
        this.activeEditor = null;
        this.previewEditor = null;
        this.count = 0;
        this.isEmpty = false;
        this.isLocked = false;
        this.stickyCount = 0;
        this.editors = [];
        this.getEditors = () => [];
        this.findEditors = () => [];
        this.getEditorByIndex = () => undefined;
        this.getIndexOfEditor = unsupported;
        this.openEditor = unsupported;
        this.openEditors = unsupported;
        this.isPinned = () => false;
        this.isSticky = () => false;
        this.isActive = () => false;
        this.contains = () => false;
        this.moveEditor = unsupported;
        this.moveEditors = unsupported;
        this.copyEditor = unsupported;
        this.copyEditors = unsupported;
        this.closeEditor = unsupported;
        this.closeEditors = unsupported;
        this.closeAllEditors = unsupported;
        this.replaceEditors = unsupported;
        this.pinEditor = () => { };
        this.stickEditor = () => { };
        this.unstickEditor = () => { };
        this.lock = () => { };
        this.isFirst = unsupported;
        this.isLast = unsupported;
    }
    get groupsView() {
        return unsupported();
    }
    notifyLabelChanged() { }
    get titleHeight() {
        return unsupported();
    }
    get element() {
        return unsupported();
    }
    get scopedContextKeyService() {
        return StandaloneServices.get(IContextKeyService);
    }
    focus() {
    }
}
const fakeActiveGroup = new EmptyEditorGroup();
class SimpleEditorPane {
    constructor(input, editor) {
        this.input = input;
        this.editor = editor;
        this.onDidChangeControl = Event.None;
        this.onDidChangeSizeConstraints = Event.None;
        this.onDidFocus = Event.None;
        this.onDidBlur = Event.None;
        this.options = undefined;
        this.group = fakeActiveGroup;
        this.scopedContextKeyService = undefined;
        this.getViewState = unsupported;
        this.isVisible = unsupported;
        this.hasFocus = unsupported;
        this.getId = unsupported;
        this.getTitle = unsupported;
        this.focus = unsupported;
    }
    get minimumWidth() {
        return DEFAULT_EDITOR_MIN_DIMENSIONS.width;
    }
    get maximumWidth() {
        return DEFAULT_EDITOR_MAX_DIMENSIONS.width;
    }
    get minimumHeight() {
        return DEFAULT_EDITOR_MIN_DIMENSIONS.height;
    }
    get maximumHeight() {
        return DEFAULT_EDITOR_MAX_DIMENSIONS.height;
    }
    getControl() {
        return this.editor;
    }
}
function wrapOpenEditor(textModelService, defaultBehavior, fallbackBahavior) {
    async function openEditor(editor, optionsOrPreferredGroup, preferredGroup) {
        const options = isEditorInput(editor)
            ? optionsOrPreferredGroup
            : editor.options;
        if (isPreferredGroup(optionsOrPreferredGroup)) {
            preferredGroup = optionsOrPreferredGroup;
        }
        const resource = isResourceEditorInput(editor) || isEditorInput(editor) ? editor.resource : undefined;
        if (resource == null || !textModelService.canHandleResource(resource)) {
            return await defaultBehavior(editor, optionsOrPreferredGroup, preferredGroup);
        }
        let modelEditor;
        const codeEditors = StandaloneServices.get(ICodeEditorService).listCodeEditors();
        modelEditor = codeEditors.find((editor) => editor instanceof StandaloneEditor &&
            editor.getModel() != null &&
            editor.getModel().uri.toString() === resource.toString());
        if (modelEditor == null) {
            const defaultBehaviorResult = await defaultBehavior(
            editor,
            optionsOrPreferredGroup, preferredGroup);
            if (defaultBehaviorResult != null) {
                return defaultBehaviorResult;
            }
            const modelRef = await textModelService.createModelReference(resource);
            modelEditor = await fallbackBahavior?.(modelRef, options, preferredGroup === SIDE_GROUP);
            if (modelEditor == null) {
                modelRef.dispose();
                return undefined;
            }
        }
        if (options != null) {
            applyTextEditorOptions(options, modelEditor, ScrollType.Immediate);
        }
        if (!(options?.preserveFocus ?? false)) {
            modelEditor.focus();
            modelEditor.getContainerDomNode().scrollIntoView();
        }
        return new SimpleEditorPane(isEditorInput(editor) ? editor : undefined, modelEditor);
    }
    return openEditor;
}
let MonacoEditorService = class MonacoEditorService extends EditorService {
    constructor(_openEditorFallback, _isEditorPartVisible, _editorGroupService, instantiationService, fileService, configurationService, contextService, uriIdentityService, editorResolverService, workspaceTrustRequestService, hostService, textEditorService, textModelService) {
        super(undefined, _editorGroupService, instantiationService, fileService, configurationService, contextService, uriIdentityService, editorResolverService, workspaceTrustRequestService, hostService, textEditorService);
        this._isEditorPartVisible = _isEditorPartVisible;
        this.openEditor = wrapOpenEditor(textModelService, this.openEditor.bind(this), _openEditorFallback);
    }
    get activeTextEditorControl() {
        const focusedCodeEditor = StandaloneServices.get(ICodeEditorService).getFocusedCodeEditor();
        if (focusedCodeEditor != null && focusedCodeEditor instanceof StandaloneCodeEditor) {
            return focusedCodeEditor;
        }
        return super.activeTextEditorControl;
    }
    async openEditor(editor, optionsOrPreferredGroup, preferredGroup) {
        if (!this._isEditorPartVisible()) {
            return undefined;
        }
        return await super.openEditor(editor, optionsOrPreferredGroup, preferredGroup);
    }
};
MonacoEditorService = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IInstantiationService),
    __param(4, IFileService),
    __param(5, IConfigurationService),
    __param(6, IWorkspaceContextService),
    __param(7, IUriIdentityService),
    __param(8, IEditorResolverService),
    __param(9, IWorkspaceTrustRequestService),
    __param(10, IHostService),
    __param(11, ITextEditorService),
    __param(12, ITextModelService)
], MonacoEditorService);
class StandaloneEditorPane {
    constructor(editor, input, group) {
        this.editor = editor;
        this.input = input;
        this.group = group;
        this.onDidChangeControl = Event.None;
        this.options = undefined;
        this.minimumWidth = 0;
        this.maximumWidth = Number.POSITIVE_INFINITY;
        this.minimumHeight = 0;
        this.maximumHeight = Number.POSITIVE_INFINITY;
        this.onDidChangeSizeConstraints = Event.None;
        this.scopedContextKeyService = undefined;
        this.onDidFocus = this.editor.onDidFocusEditorWidget;
        this.onDidBlur = this.editor.onDidBlurEditorWidget;
    }
    getControl() {
        return this.editor;
    }
    getViewState() {
        return undefined;
    }
    isVisible() {
        return true;
    }
    hasFocus() {
        return this.editor.hasWidgetFocus();
    }
    getId() {
        return this.editor.getId();
    }
    getTitle() {
        return undefined;
    }
    focus() {
        this.editor.focus();
    }
}
let StandaloneEditorGroup = StandaloneEditorGroup_1 = class StandaloneEditorGroup extends Disposable {
    constructor(editor, openEditorFallback, instantiationService, scopedContextKeyService, editorService, textModelService) {
        super();
        this.editor = editor;
        this.openEditorFallback = openEditorFallback;
        this.scopedContextKeyService = scopedContextKeyService;
        this.editorService = editorService;
        this.textModelService = textModelService;
        this.active = false;
        this.selectedEditors = [];
        this.isSelected = () => false;
        this.setSelection = unsupported;
        this.isTransient = () => false;
        this.windowId = mainWindow.vscodeWindowId;
        this.onDidFocus = this.editor.onDidFocusEditorWidget;
        this.onDidOpenEditorFail = Event.None;
        this.whenRestored = Promise.resolve();
        this.disposed = false;
        this.notifyIndexChanged = unsupported;
        this.relayout = unsupported;
        this.toJSON = unsupported;
        this.minimumWidth = 0;
        this.maximumWidth = Number.POSITIVE_INFINITY;
        this.minimumHeight = 0;
        this.maximumHeight = Number.POSITIVE_INFINITY;
        this.onDidChange = this.editor.onDidLayoutChange;
        this.layout = () => this.editor.layout();
        this._onDidModelChange = new Emitter();
        this.onDidModelChange = this._onDidModelChange.event;
        this.onWillDispose = this.editor.onDidDispose;
        this._onDidActiveEditorChange = new Emitter();
        this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
        this.onWillCloseEditor = Event.None;
        this._onDidCloseEditor = new Emitter();
        this.onDidCloseEditor = this._onDidCloseEditor.event;
        this.onWillMoveEditor = Event.None;
        this._onWillOpenEditor = new Emitter();
        this.onWillOpenEditor = this._onWillOpenEditor.event;
        this.id = --StandaloneEditorGroup_1.idCounter;
        this.index = -1;
        this.label = `standalone editor ${-this.id}`;
        this.ariaLabel = `standalone editor ${-this.id}`;
        this.previewEditor = null;
        this.isLocked = true;
        this.stickyCount = 0;
        this.getEditors = () => this.editors;
        this.findEditors = (resource) => this.pane != null && resource.toString() === this.pane.input.resource.toString()
            ? [this.pane.input]
            : [];
        this.getEditorByIndex = (index) => this.pane != null && index === 0 ? this.pane.input : undefined;
        this.getIndexOfEditor = (editorInput) => this.pane != null && this.pane.input === editorInput ? 0 : -1;
        this.openEditor = async (editor, options) => {
            if (editor.isDisposed()) {
                return undefined;
            }
            if (editor instanceof TextResourceEditorInput) {
                if (editor.resource.toString() === this.pane?.input.resource.toString()) {
                    this.focus();
                    return this.pane;
                }
                if (this.openEditorFallback != null) {
                    const modelRef = await this.textModelService.createModelReference(editor.resource);
                    const modelEditor = await this.openEditorFallback(modelRef, options, false);
                    if (modelEditor == null) {
                        modelRef.dispose();
                        return undefined;
                    }
                    return new SimpleEditorPane(editor, modelEditor);
                }
            }
            return undefined;
        };
        this.openEditors = async (editors) => {
            if (editors.length === 1) {
                return await this.openEditor(editors[0].editor);
            }
            return undefined;
        };
        this.isPinned = () => false;
        this.isSticky = () => false;
        this.isActive = () => this.editor.hasWidgetFocus();
        this.contains = (candidate) => {
            return this.pane != null && this.pane.input === candidate;
        };
        this.moveEditor = unsupported;
        this.moveEditors = unsupported;
        this.copyEditor = unsupported;
        this.copyEditors = unsupported;
        this.closeEditor = unsupported;
        this.closeEditors = unsupported;
        this.closeAllEditors = unsupported;
        this.replaceEditors = unsupported;
        this.pinEditor = () => { };
        this.stickEditor = () => { };
        this.unstickEditor = () => { };
        this.lock = () => { };
        this.isFirst = unsupported;
        this.isLast = unsupported;
        const onNewModel = (uri) => {
            const editorInput = instantiationService.createInstance(TextResourceEditorInput, uri, undefined, undefined, undefined, undefined);
            this._onWillOpenEditor.fire({
                editor: editorInput,
                groupId: this.id
            });
            this.pane = new StandaloneEditorPane(editor, editorInput, this);
            this._onDidModelChange.fire({
                kind: GroupModelChangeKind.EDITOR_OPEN,
                editor: editorInput,
                editorIndex: 0
            });
            this._onDidActiveEditorChange.fire({
                editor: editorInput
            });
        };
        const onRemovedModel = (uri) => {
            if (this.pane != null && this.pane.input.resource.toString() === uri.toString()) {
                const pane = this.pane;
                this.pane = undefined;
                this._onDidModelChange.fire({
                    kind: GroupModelChangeKind.EDITOR_CLOSE,
                    editorIndex: 0
                });
                this._onDidActiveEditorChange.fire({
                    editor: undefined
                });
                this._onDidCloseEditor.fire({
                    context: EditorCloseContext.UNKNOWN,
                    editor: pane.input,
                    groupId: this.id,
                    index: 0,
                    sticky: false
                });
            }
        };
        editor.onDidChangeModel((e) => {
            if (e.oldModelUrl != null) {
                onRemovedModel(e.oldModelUrl);
            }
            if (e.newModelUrl != null) {
                onNewModel(e.newModelUrl);
            }
        });
        this._register({
            dispose: () => {
                const model = editor.getModel();
                if (model != null) {
                    onRemovedModel(model.uri);
                }
            }
        });
        const currentModel = editor.getModel();
        if (currentModel != null) {
            const editorInput = instantiationService.createInstance(TextResourceEditorInput, currentModel.uri, undefined, undefined, undefined, undefined);
            this.pane = new StandaloneEditorPane(editor, editorInput, this);
        }
    }
    get groupsView() {
        return unsupported();
    }
    notifyLabelChanged() { }
    createEditorActions() {
        return {
            actions: {
                primary: [],
                secondary: []
            },
            onDidChange: Event.None
        };
    }
    get titleHeight() {
        return unsupported();
    }
    setActive(isActive) {
        this.active = isActive;
    }
    get element() {
        return this.editor.getContainerDomNode();
    }
    get activeEditorPane() {
        return this.pane;
    }
    get activeEditor() {
        return this.pane?.input ?? null;
    }
    get count() {
        return this.pane != null ? 1 : 0;
    }
    get isEmpty() {
        return this.pane == null;
    }
    get editors() {
        return this.pane != null ? [this.pane.input] : [];
    }
    focus() {
        this.editor.focus();
        this.editor.getContainerDomNode().scrollIntoView();
    }
};
StandaloneEditorGroup.idCounter = 0;
StandaloneEditorGroup = StandaloneEditorGroup_1 = __decorate([
    __param(2, IInstantiationService),
    __param(3, IContextKeyService),
    __param(4, IEditorService),
    __param(5, ITextModelService)
], StandaloneEditorGroup);
let MonacoDelegateEditorGroupsService = class MonacoDelegateEditorGroupsService extends Disposable {
    constructor(delegate, emptyDelegate, openEditorFallback, instantiationService) {
        super();
        this.delegate = delegate;
        this.openEditorFallback = openEditorFallback;
        this.instantiationService = instantiationService;
        this._serviceBrand = undefined;
        this.additionalGroups = [];
        this.activeGroupOverride = undefined;
        this.createModalEditorPart = unsupported;
        this.onDidCreateAuxiliaryEditorPart = this.delegate.onDidCreateAuxiliaryEditorPart;
        this.onDidChangeGroupMaximized = this.delegate.onDidChangeGroupMaximized;
        this._onDidChangeActiveGroup = new Emitter();
        this.onDidChangeActiveGroup = Event.any(this._onDidChangeActiveGroup.event, this.delegate.onDidChangeActiveGroup);
        this._onDidAddGroup = new Emitter();
        this.onDidAddGroup = Event.any(this._onDidAddGroup.event, this.delegate.onDidAddGroup);
        this._onDidRemoveGroup = new Emitter();
        this.onDidRemoveGroup = Event.any(this._onDidRemoveGroup.event, this.delegate.onDidRemoveGroup);
        this.onDidMoveGroup = this.delegate.onDidMoveGroup;
        this.onDidActivateGroup = this.delegate.onDidActivateGroup;
        this.onDidChangeGroupIndex = this.delegate.onDidChangeGroupIndex;
        this.onDidChangeGroupLocked = this.delegate.onDidChangeGroupLocked;
        this.getLayout = () => {
            return this.delegate.getLayout();
        };
        this.getGroups = (order) => {
            return [...this.delegate.getGroups(order), ...this.additionalGroups];
        };
        this.getGroup = (identifier) => {
            return (this.delegate.getGroup(identifier) ??
                this.additionalGroups.find((group) => group.id === identifier));
        };
        this.activateGroup = (...args) => {
            return this.delegate.activateGroup(...args);
        };
        this.getSize = (...args) => {
            return this.delegate.getSize(...args);
        };
        this.setSize = (...args) => {
            return this.delegate.setSize(...args);
        };
        this.arrangeGroups = (...args) => {
            return this.delegate.arrangeGroups(...args);
        };
        this.applyLayout = (...args) => {
            return this.delegate.applyLayout(...args);
        };
        this.setGroupOrientation = (...args) => {
            return this.delegate.setGroupOrientation(...args);
        };
        this.findGroup = (...args) => {
            return this.delegate.findGroup(...args);
        };
        this.addGroup = (...args) => {
            return this.delegate.addGroup(...args);
        };
        this.removeGroup = (...args) => {
            return this.delegate.removeGroup(...args);
        };
        this.moveGroup = (...args) => {
            return this.delegate.moveGroup(...args);
        };
        this.mergeGroup = (...args) => {
            return this.delegate.mergeGroup(...args);
        };
        this.mergeAllGroups = (...args) => {
            return this.delegate.mergeAllGroups(...args);
        };
        this.copyGroup = (...args) => {
            return this.delegate.copyGroup(...args);
        };
        this.onDidChangeEditorPartOptions = this.delegate.onDidChangeEditorPartOptions;
        this.enforcePartOptions = (...args) => {
            return this.delegate.enforcePartOptions(...args);
        };
        setTimeout(() => {
            const codeEditorService = StandaloneServices.get(ICodeEditorService);
            const handleCodeEditor = (editor) => {
                if (editor instanceof StandaloneEditor) {
                    let timeout;
                    const updateActiveGroup = (editor) => {
                        const newActiveGroup = editor != null
                            ? this.additionalGroups.find((group) => group.editor === editor)
                            : undefined;
                        if (this.activeGroupOverride !== newActiveGroup) {
                            this.activeGroupOverride = newActiveGroup;
                            this._onDidChangeActiveGroup.fire(this.activeGroup);
                        }
                    };
                    const removeActiveGroup = (editor) => {
                        if (!emptyDelegate &&
                            this.activeGroupOverride ===
                                this.additionalGroups.find((group) => group.editor === editor)) {
                            updateActiveGroup(undefined);
                        }
                    };
                    const onEditorFocused = () => {
                        if (timeout != null)
                            window.clearTimeout(timeout);
                        updateActiveGroup(editor);
                    };
                    const onEditorBlurred = () => {
                        if (timeout != null)
                            window.clearTimeout(timeout);
                        timeout = window.setTimeout(() => {
                            timeout = undefined;
                            removeActiveGroup(editor);
                        }, 100);
                    };
                    editor.onDidDispose(() => {
                        removeActiveGroup(editor);
                    });
                    editor.onDidFocusEditorText(onEditorFocused);
                    editor.onDidFocusEditorWidget(onEditorFocused);
                    editor.onDidBlurEditorText(onEditorBlurred);
                    editor.onDidBlurEditorWidget(onEditorBlurred);
                    if (editor.hasWidgetFocus()) {
                        onEditorFocused();
                    }
                    const newGroup = instantiationService.createInstance(StandaloneEditorGroup, editor, this.openEditorFallback);
                    this.additionalGroups.push(newGroup);
                    this._onDidAddGroup.fire(newGroup);
                }
            };
            const handleCodeEditorRemoved = (editor) => {
                if (editor instanceof StandaloneEditor) {
                    const removedGroup = this.additionalGroups.find((group) => group.editor === editor);
                    if (removedGroup != null) {
                        removedGroup.dispose();
                        if (this.activeGroupOverride === removedGroup) {
                            this.activeGroupOverride = undefined;
                            this._onDidChangeActiveGroup.fire(this.activeGroup);
                        }
                        this.additionalGroups = this.additionalGroups.filter((group) => group !== removedGroup);
                        this._onDidRemoveGroup.fire(removedGroup);
                    }
                }
            };
            this._register(codeEditorService.onCodeEditorAdd(handleCodeEditor));
            this._register(codeEditorService.onCodeEditorRemove(handleCodeEditorRemoved));
            codeEditorService.listCodeEditors().forEach(handleCodeEditor);
        });
    }
    getScopedInstantiationService() {
        return this.instantiationService;
    }
    registerContextKeyProvider(provider) {
        return this.delegate.registerContextKeyProvider(provider);
    }
    saveWorkingSet(name) {
        return this.delegate.saveWorkingSet(name);
    }
    getWorkingSets() {
        return this.delegate.getWorkingSets();
    }
    applyWorkingSet(workingSet) {
        return this.delegate.applyWorkingSet(workingSet);
    }
    deleteWorkingSet(workingSet) {
        return this.delegate.deleteWorkingSet(workingSet);
    }
    get isReady() {
        return this.delegate.isReady;
    }
    get whenReady() {
        return this.delegate.whenReady;
    }
    get whenRestored() {
        return this.delegate.whenRestored;
    }
    get hasRestorableState() {
        return this.delegate.hasRestorableState;
    }
    get parts() {
        return this.delegate.parts;
    }
    createAuxiliaryEditorPart(options) {
        return this.delegate.createAuxiliaryEditorPart(options);
    }
    get mainPart() {
        return this.delegate.mainPart;
    }
    getPart(container) {
        return this.delegate.getPart(container);
    }
    toggleMaximizeGroup(group) {
        return this.delegate.toggleMaximizeGroup(group);
    }
    toggleExpandGroup(group) {
        return this.delegate.toggleExpandGroup(group);
    }
    createEditorDropTarget(container, delegate) {
        return this.delegate.createEditorDropTarget(container, delegate);
    }
    get groups() {
        return [...this.additionalGroups, ...this.delegate.groups];
    }
    get activeGroup() {
        return this.activeGroupOverride ?? this.delegate.activeGroup;
    }
    get sideGroup() {
        return this.delegate.sideGroup;
    }
    get count() {
        return this.delegate.count + this.additionalGroups.length;
    }
    get orientation() {
        return this.delegate.orientation;
    }
    get partOptions() {
        return this.delegate.partOptions;
    }
};
MonacoDelegateEditorGroupsService = __decorate([
    __param(3, IInstantiationService)
], MonacoDelegateEditorGroupsService);

export { MonacoDelegateEditorGroupsService, MonacoEditorService, fakeActiveGroup, wrapOpenEditor };
