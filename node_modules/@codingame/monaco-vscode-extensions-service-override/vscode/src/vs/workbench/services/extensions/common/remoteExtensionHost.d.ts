import { Event } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IMessagePassingProtocol } from "@codingame/monaco-vscode-api/vscode/vs/base/parts/ipc/common/ipc";
import { IExtensionHostDebugService } from "@codingame/monaco-vscode-api/vscode/vs/platform/debug/common/extensionHostDebug.service";
import { ILabelService } from "@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service";
import { ILoggerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { IRemoteConnectionData } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver";
import { IRemoteAuthorityResolverService } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver.service";
import { IRemoteSocketFactoryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteSocketFactoryService.service";
import { ISignService } from "@codingame/monaco-vscode-api/vscode/vs/platform/sign/common/sign.service";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
import { IDefaultLogLevelsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/log/common/defaultLogLevels.service";
import { RemoteRunningLocation } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionRunningLocation";
import { ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions";
export interface IRemoteExtensionHostInitData {
    readonly connectionData: IRemoteConnectionData | null;
    readonly pid: number;
    readonly appRoot: URI;
    readonly extensionHostLogsPath: URI;
    readonly globalStorageHome: URI;
    readonly workspaceStorageHome: URI;
    readonly extensions: ExtensionHostExtensions;
}
export interface IRemoteExtensionHostDataProvider {
    readonly remoteAuthority: string;
    getInitData(): Promise<IRemoteExtensionHostInitData>;
}
export declare class RemoteExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: RemoteRunningLocation;
    private readonly _initDataProvider;
    private readonly remoteSocketFactoryService;
    private readonly _contextService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly _logService;
    protected readonly _loggerService: ILoggerService;
    private readonly _labelService;
    private readonly remoteAuthorityResolverService;
    private readonly _extensionHostDebugService;
    private readonly _productService;
    private readonly _signService;
    private readonly _defaultLogLevelsService;
    readonly pid: null;
    readonly remoteAuthority: string;
    readonly startup = ExtensionHostStartup.EagerAutoStart;
    extensions: ExtensionHostExtensions | null;
    private _onExit;
    readonly onExit: Event<[
        number,
        string | null
    ]>;
    private _protocol;
    private _hasLostConnection;
    private _terminating;
    private _hasDisconnected;
    private readonly _isExtensionDevHost;
    constructor(runningLocation: RemoteRunningLocation, _initDataProvider: IRemoteExtensionHostDataProvider, remoteSocketFactoryService: IRemoteSocketFactoryService, _contextService: IWorkspaceContextService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _logService: ILogService, _loggerService: ILoggerService, _labelService: ILabelService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _extensionHostDebugService: IExtensionHostDebugService, _productService: IProductService, _signService: ISignService, _defaultLogLevelsService: IDefaultLogLevelsService);
    start(): Promise<IMessagePassingProtocol>;
    private _onExtHostConnectionLost;
    private _createExtHostInitData;
    getInspectPort(): undefined;
    enableInspectPort(): Promise<boolean>;
    disconnect(): Promise<void>;
    dispose(): void;
}
