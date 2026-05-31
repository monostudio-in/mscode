
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { onUnexpectedError } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';
import { Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { generateUuid } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uuid';
import { IConfigurationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service';
import { IStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service';
import { DiffEditorInput } from '@codingame/monaco-vscode-api/vscode/vs/workbench/common/editor/diffEditorInput';
import { ExtensionKeyedWebviewOriginStore } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webview/browser/webview';
import { WebviewInput } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webviewPanel/browser/webviewEditorInput';
import { IWebviewWorkbenchService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService.service';
import { editorGroupToColumn } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupColumn';
import { GroupsOrder, GroupLocation, preferredSideBySideGroupDirection } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService';
import { IEditorGroupsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService.service';
import { ACTIVE_GROUP, SIDE_GROUP } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService';
import { IEditorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service';
import { IExtensionService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service';
import { ExtHostContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { reviveWebviewExtension, reviveWebviewContentOptions } from './mainThreadWebviews.js';
import { ThemeIcon } from '@codingame/monaco-vscode-api/vscode/vs/base/common/themables';

class WebviewInputStore {
    constructor() {
        this._handlesToInputs = ( new Map());
        this._inputsToHandles = ( new Map());
    }
    add(handle, input) {
        this._handlesToInputs.set(handle, input);
        this._inputsToHandles.set(input, handle);
    }
    getHandleForInput(input) {
        return this._inputsToHandles.get(input);
    }
    getInputForHandle(handle) {
        return this._handlesToInputs.get(handle);
    }
    delete(handle) {
        const input = this.getInputForHandle(handle);
        this._handlesToInputs.delete(handle);
        if (input) {
            this._inputsToHandles.delete(input);
        }
    }
    get size() {
        return this._handlesToInputs.size;
    }
    [Symbol.iterator]() {
        return ( this._handlesToInputs.values());
    }
}
class WebviewViewTypeTransformer {
    constructor(prefix) {
        this.prefix = prefix;
    }
    fromExternal(viewType) {
        return this.prefix + viewType;
    }
    toExternal(viewType) {
        return viewType.startsWith(this.prefix) ? viewType.substr(this.prefix.length) : undefined;
    }
}
let MainThreadWebviewPanels = class MainThreadWebviewPanels extends Disposable {
    constructor(
        context,
        _mainThreadWebviews,
        _configurationService,
        _editorGroupService,
        _editorService,
        extensionService,
        storageService,
        _webviewWorkbenchService
    ) {
        super();
        this._mainThreadWebviews = _mainThreadWebviews;
        this._configurationService = _configurationService;
        this._editorGroupService = _editorGroupService;
        this._editorService = _editorService;
        this._webviewWorkbenchService = _webviewWorkbenchService;
        this.webviewPanelViewType = ( new WebviewViewTypeTransformer("mainThreadWebview-"));
        this._webviewInputs = ( new WebviewInputStore());
        this._revivers = this._register(( new DisposableMap()));
        this.webviewOriginStore = ( new ExtensionKeyedWebviewOriginStore("mainThreadWebviewPanel.origins", storageService));
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostWebviewPanels));
        this._register(Event.any(
            _editorService.onDidActiveEditorChange,
            _editorService.onDidVisibleEditorsChange,
            _editorGroupService.onDidAddGroup,
            _editorGroupService.onDidRemoveGroup,
            _editorGroupService.onDidMoveGroup
        )(() => {
            this.updateWebviewViewStates(this._editorService.activeEditor);
        }));
        this._register(_webviewWorkbenchService.onDidChangeActiveWebviewEditor(input => {
            this.updateWebviewViewStates(input);
        }));
        this._register(_webviewWorkbenchService.registerResolver({
            canResolve: webview => {
                const viewType = this.webviewPanelViewType.toExternal(webview.viewType);
                if (typeof viewType === "string") {
                    extensionService.activateByEvent(`onWebviewPanel:${viewType}`);
                }
                return false;
            },
            resolveWebview: () => {
                throw ( new Error("not implemented"));
            }
        }));
    }
    get webviewInputs() {
        return this._webviewInputs;
    }
    addWebviewInput(handle, input, options) {
        this._webviewInputs.add(handle, input);
        this._mainThreadWebviews.addWebview(handle, input.webview, options);
        const disposeSub = input.webview.onDidDispose(() => {
            disposeSub.dispose();
            this._proxy.$onDidDisposeWebviewPanel(handle).finally(() => {
                this._webviewInputs.delete(handle);
            });
        });
    }
    $createWebviewPanel(extensionData, handle, viewType, initData, showOptions) {
        const targetGroup = this.getTargetGroupFromShowOptions(showOptions);
        const mainThreadShowOptions = showOptions ? {
            preserveFocus: !!showOptions.preserveFocus,
            group: targetGroup
        } : {};
        const extension = reviveWebviewExtension(extensionData);
        const origin = this.webviewOriginStore.getOrigin(viewType, extension.id);
        const webview = this._webviewWorkbenchService.openWebview({
            origin,
            providedViewType: viewType,
            title: initData.title,
            options: reviveWebviewOptions(initData.panelOptions),
            contentOptions: reviveWebviewContentOptions(initData.webviewOptions),
            extension
        }, this.webviewPanelViewType.fromExternal(viewType), initData.title, undefined, mainThreadShowOptions);
        this.addWebviewInput(handle, webview, {
            serializeBuffersForPostMessage: initData.serializeBuffersForPostMessage
        });
    }
    $disposeWebview(handle) {
        const webview = this.tryGetWebviewInput(handle);
        if (!webview) {
            return;
        }
        webview.dispose();
    }
    $setTitle(handle, value) {
        this.tryGetWebviewInput(handle)?.setWebviewTitle(value);
    }
    $setIconPath(handle, value) {
        const webview = this.tryGetWebviewInput(handle);
        if (webview) {
            webview.iconPath = reviveWebviewIcon(value);
        }
    }
    $reveal(handle, showOptions) {
        const webview = this.tryGetWebviewInput(handle);
        if (!webview || webview.isDisposed()) {
            return;
        }
        const targetGroup = this.getTargetGroupFromShowOptions(showOptions);
        this._webviewWorkbenchService.revealWebview(webview, targetGroup, !!showOptions.preserveFocus);
    }
    getTargetGroupFromShowOptions(showOptions) {
        if (typeof showOptions.viewColumn === "undefined" || showOptions.viewColumn === ACTIVE_GROUP || (this._editorGroupService.count === 1 && this._editorGroupService.activeGroup.isEmpty)) {
            return ACTIVE_GROUP;
        }
        if (showOptions.viewColumn === SIDE_GROUP) {
            return SIDE_GROUP;
        }
        if (showOptions.viewColumn >= 0) {
            const groupInColumn = this._editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE)[showOptions.viewColumn];
            if (groupInColumn) {
                return groupInColumn.id;
            }
            const newGroup = this._editorGroupService.findGroup({
                location: GroupLocation.LAST
            });
            if (newGroup) {
                const direction = preferredSideBySideGroupDirection(this._configurationService);
                return this._editorGroupService.addGroup(newGroup, direction);
            }
        }
        return ACTIVE_GROUP;
    }
    $registerSerializer(viewType, options) {
        if (( this._revivers.has(viewType))) {
            throw ( new Error(`Reviver for ${viewType} already registered`));
        }
        this._revivers.set(viewType, this._webviewWorkbenchService.registerResolver({
            canResolve: webviewInput => {
                return webviewInput.viewType === this.webviewPanelViewType.fromExternal(viewType);
            },
            resolveWebview: async webviewInput => {
                const viewType = this.webviewPanelViewType.toExternal(webviewInput.viewType);
                if (!viewType) {
                    webviewInput.webview.setHtml(
                        this._mainThreadWebviews.getWebviewResolvedFailedContent(webviewInput.viewType)
                    );
                    return;
                }
                const handle = generateUuid();
                this.addWebviewInput(handle, webviewInput, options);
                let state = undefined;
                if (webviewInput.webview.state) {
                    try {
                        state = JSON.parse(webviewInput.webview.state);
                    } catch (e) {
                        console.error("Could not load webview state", e, webviewInput.webview.state);
                    }
                }
                try {
                    await this._proxy.$deserializeWebviewPanel(handle, viewType, {
                        title: webviewInput.getTitle(),
                        state,
                        panelOptions: webviewInput.webview.options,
                        webviewOptions: webviewInput.webview.contentOptions,
                        active: webviewInput === this._editorService.activeEditor
                    }, editorGroupToColumn(this._editorGroupService, webviewInput.group || 0));
                } catch (error) {
                    onUnexpectedError(error);
                    webviewInput.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(viewType));
                }
            }
        }));
    }
    $unregisterSerializer(viewType) {
        if (!( this._revivers.has(viewType))) {
            throw ( new Error(`No reviver for ${viewType} registered`));
        }
        this._revivers.deleteAndDispose(viewType);
    }
    updateWebviewViewStates(activeEditorInput) {
        if (!this._webviewInputs.size) {
            return;
        }
        const viewStates = {};
        const updateViewStatesForInput = (group, topLevelInput, editorInput) => {
            if (!(editorInput instanceof WebviewInput)) {
                return;
            }
            editorInput.updateGroup(group.id);
            const handle = this._webviewInputs.getHandleForInput(editorInput);
            if (handle) {
                viewStates[handle] = {
                    visible: topLevelInput === group.activeEditor,
                    active: editorInput === activeEditorInput,
                    position: editorGroupToColumn(this._editorGroupService, group.id)
                };
            }
        };
        for (const group of this._editorGroupService.groups) {
            for (const input of group.editors) {
                if (input instanceof DiffEditorInput) {
                    updateViewStatesForInput(group, input, input.primary);
                    updateViewStatesForInput(group, input, input.secondary);
                } else {
                    updateViewStatesForInput(group, input, input);
                }
            }
        }
        if (( Object.keys(viewStates)).length) {
            this._proxy.$onDidChangeWebviewPanelViewStates(viewStates);
        }
    }
    tryGetWebviewInput(handle) {
        return this._webviewInputs.getInputForHandle(handle);
    }
};
MainThreadWebviewPanels = ( __decorate([( __param(2, IConfigurationService)), ( __param(3, IEditorGroupsService)), ( __param(4, IEditorService)), ( __param(5, IExtensionService)), ( __param(6, IStorageService)), ( __param(7, IWebviewWorkbenchService))], MainThreadWebviewPanels));
function reviveWebviewIcon(value) {
    if (!value) {
        return undefined;
    }
    if (ThemeIcon.isThemeIcon(value)) {
        return value;
    }
    return {
        light: URI.revive(value.light),
        dark: URI.revive(value.dark)
    };
}
function reviveWebviewOptions(panelOptions) {
    return {
        enableFindWidget: panelOptions.enableFindWidget,
        retainContextWhenHidden: panelOptions.retainContextWhenHidden
    };
}

export { MainThreadWebviewPanels };
