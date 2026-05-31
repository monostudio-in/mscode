import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { WebviewInput } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webviewPanel/browser/webviewEditorInput";
import { IWebviewWorkbenchService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService.service";
import { IEditorGroupsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService.service";
import { IEditorService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import * as extHostProtocol from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { MainThreadWebviews } from "./mainThreadWebviews.js";
export declare class MainThreadWebviewPanels extends Disposable implements extHostProtocol.MainThreadWebviewPanelsShape {
    private readonly _mainThreadWebviews;
    private readonly _configurationService;
    private readonly _editorGroupService;
    private readonly _editorService;
    private readonly _webviewWorkbenchService;
    private readonly webviewPanelViewType;
    private readonly _proxy;
    private readonly _webviewInputs;
    private readonly _revivers;
    private readonly webviewOriginStore;
    constructor(context: IExtHostContext, _mainThreadWebviews: MainThreadWebviews, _configurationService: IConfigurationService, _editorGroupService: IEditorGroupsService, _editorService: IEditorService, extensionService: IExtensionService, storageService: IStorageService, _webviewWorkbenchService: IWebviewWorkbenchService);
    get webviewInputs(): Iterable<WebviewInput>;
    addWebviewInput(handle: extHostProtocol.WebviewHandle, input: WebviewInput, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $createWebviewPanel(extensionData: extHostProtocol.WebviewExtensionDescription, handle: extHostProtocol.WebviewHandle, viewType: string, initData: extHostProtocol.IWebviewInitData, showOptions: extHostProtocol.WebviewPanelShowOptions): void;
    $disposeWebview(handle: extHostProtocol.WebviewHandle): void;
    $setTitle(handle: extHostProtocol.WebviewHandle, value: string): void;
    $setIconPath(handle: extHostProtocol.WebviewHandle, value: extHostProtocol.IWebviewIconPath | undefined): void;
    $reveal(handle: extHostProtocol.WebviewHandle, showOptions: extHostProtocol.WebviewPanelShowOptions): void;
    private getTargetGroupFromShowOptions;
    $registerSerializer(viewType: string, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $unregisterSerializer(viewType: string): void;
    private updateWebviewViewStates;
    private tryGetWebviewInput;
}
