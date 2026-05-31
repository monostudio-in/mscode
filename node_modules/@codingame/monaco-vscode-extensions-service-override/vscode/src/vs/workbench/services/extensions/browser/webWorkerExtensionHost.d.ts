import { Event } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IMessagePassingProtocol } from "@codingame/monaco-vscode-api/vscode/vs/base/parts/ipc/common/ipc";
import { ILabelService } from "@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service";
import { ILayoutService } from "@codingame/monaco-vscode-api/vscode/vs/platform/layout/browser/layoutService.service";
import { ILoggerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
import { IUserDataProfilesService } from "@codingame/monaco-vscode-api/vscode/vs/platform/userDataProfile/common/userDataProfile.service";
import { IWebWorkerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/webWorker/browser/webWorkerService.service";
import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { IBrowserWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service";
import { IDefaultLogLevelsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/log/common/defaultLogLevels.service";
import { LocalWebWorkerRunningLocation } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionRunningLocation";
import { ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions";
export interface IWebWorkerExtensionHostInitData {
    readonly extensions: ExtensionHostExtensions;
}
export interface IWebWorkerExtensionHostDataProvider {
    getInitData(): Promise<IWebWorkerExtensionHostInitData>;
}
export declare class WebWorkerExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: LocalWebWorkerRunningLocation;
    readonly startup: ExtensionHostStartup;
    private readonly _initDataProvider;
    private readonly _telemetryService;
    private readonly _contextService;
    private readonly _labelService;
    private readonly _logService;
    private readonly _loggerService;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _productService;
    private readonly _layoutService;
    private readonly _storageService;
    private readonly _webWorkerService;
    private readonly _defaultLogLevelsService;
    readonly pid: null;
    readonly remoteAuthority: null;
    extensions: ExtensionHostExtensions | null;
    private readonly _onDidExit;
    readonly onExit: Event<[
        number,
        string | null
    ]>;
    private _isTerminating;
    private _protocolPromise;
    private _protocol;
    private readonly _extensionHostLogsLocation;
    constructor(runningLocation: LocalWebWorkerRunningLocation, startup: ExtensionHostStartup, _initDataProvider: IWebWorkerExtensionHostDataProvider, _telemetryService: ITelemetryService, _contextService: IWorkspaceContextService, _labelService: ILabelService, _logService: ILogService, _loggerService: ILoggerService, _environmentService: IBrowserWorkbenchEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _productService: IProductService, _layoutService: ILayoutService, _storageService: IStorageService, _webWorkerService: IWebWorkerService, _defaultLogLevelsService: IDefaultLogLevelsService);
    protected _getWebWorkerExtensionHostIframeSrc(): Promise<string>;
    start(): Promise<IMessagePassingProtocol>;
    private _startInsideIframe;
    private _performHandshake;
    dispose(): void;
    getInspectPort(): undefined;
    enableInspectPort(): Promise<boolean>;
    private _createExtHostInitData;
}
