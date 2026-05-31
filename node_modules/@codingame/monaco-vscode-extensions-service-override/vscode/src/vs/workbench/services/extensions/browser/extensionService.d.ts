import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { IDialogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/dialogs/common/dialogs.service";
import { ExtensionKind } from "@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment";
import { ExtensionIdentifier, IExtensionDescription } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { INotificationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { ResolverResult } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver";
import { IRemoteAuthorityResolverService } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver.service";
import { IRemoteExtensionsScannerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteExtensionsScanner.service";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { IWorkspaceTrustManagementService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspaceTrust.service";
import { IBrowserWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service";
import { IWebExtensionsScannerService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensionManagement/common/extensionManagement.service";
import { IWorkbenchExtensionEnablementService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensionManagement/common/extensionManagement.service";
import { IWorkbenchExtensionManagementService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensionManagement/common/extensionManagement.service";
import { IWebWorkerExtensionHostDataProvider } from "./webWorkerExtensionHost.js";
import { AbstractExtensionService, IExtensionHostFactory, ResolvedExtensions } from "../common/abstractExtensionService.js";
import { ExtensionDescriptionRegistrySnapshot } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionDescriptionRegistry";
import { ExtensionHostKind, ExtensionRunningPreference, IExtensionHostKindPicker } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostKind";
import { IExtensionManifestPropertiesService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionManifestPropertiesService.service";
import { ExtensionRunningLocation } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionRunningLocation";
import { ExtensionRunningLocationTracker } from "../common/extensionRunningLocationTracker.js";
import { IExtensionHost } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
import { ExtensionsProposedApi } from "../common/extensionsProposedApi.js";
import { ILifecycleService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/lifecycle/common/lifecycle.service";
import { IRemoteAgentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/remote/common/remoteAgentService.service";
import { IRemoteExplorerService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/remote/common/remoteExplorerService.service";
import { IUserDataInitializationService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/userData/browser/userDataInit.service";
import { IUserDataProfileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/userDataProfile/common/userDataProfile.service";
export declare class ExtensionService extends AbstractExtensionService implements IExtensionService {
    private readonly _browserEnvironmentService;
    private readonly _webExtensionsScannerService;
    private readonly _userDataInitializationService;
    private readonly _userDataProfileService;
    private readonly _workspaceTrustManagementService;
    private readonly _remoteExplorerService;
    constructor(options: {
        hasLocalProcess: boolean;
        allowRemoteExtensionsInLocalWebWorker: boolean;
    }, extensionsProposedApi: ExtensionsProposedApi, extensionHostFactory: IExtensionHostFactory, extensionHostKindPicker: IExtensionHostKindPicker, instantiationService: IInstantiationService, notificationService: INotificationService, _browserEnvironmentService: IBrowserWorkbenchEnvironmentService, telemetryService: ITelemetryService, extensionEnablementService: IWorkbenchExtensionEnablementService, fileService: IFileService, productService: IProductService, extensionManagementService: IWorkbenchExtensionManagementService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, _webExtensionsScannerService: IWebExtensionsScannerService, logService: ILogService, remoteAgentService: IRemoteAgentService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, lifecycleService: ILifecycleService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _userDataInitializationService: IUserDataInitializationService, _userDataProfileService: IUserDataProfileService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _remoteExplorerService: IRemoteExplorerService, dialogService: IDialogService);
    private _initFetchFileSystem;
    protected _initialize(): Promise<void>;
    private _scanWebExtensionsPromise;
    protected _scanWebExtensions(): Promise<IExtensionDescription[]>;
    private _resolveExtensionsDefault;
    protected _resolveExtensions(): AsyncIterable<ResolvedExtensions>;
    private _doResolveExtensions;
    protected _onExtensionHostExit(code: number): Promise<void>;
    protected _resolveAuthority(remoteAuthority: string): Promise<ResolverResult>;
}
export declare class BrowserExtensionHostFactory implements IExtensionHostFactory {
    private readonly _extensionsProposedApi;
    private readonly _scanWebExtensions;
    private readonly _getExtensionRegistrySnapshotWhenReady;
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _remoteAgentService: IRemoteAgentService;
    protected readonly _remoteAuthorityResolverService: IRemoteAuthorityResolverService;
    protected readonly _extensionEnablementService: IWorkbenchExtensionEnablementService;
    private readonly _logService;
    constructor(_extensionsProposedApi: ExtensionsProposedApi, _scanWebExtensions: () => Promise<IExtensionDescription[]>, _getExtensionRegistrySnapshotWhenReady: () => Promise<ExtensionDescriptionRegistrySnapshot>, _instantiationService: IInstantiationService, _remoteAgentService: IRemoteAgentService, _remoteAuthorityResolverService: IRemoteAuthorityResolverService, _extensionEnablementService: IWorkbenchExtensionEnablementService, _logService: ILogService);
    createExtensionHost(runningLocations: ExtensionRunningLocationTracker, runningLocation: ExtensionRunningLocation, isInitialStart: boolean): IExtensionHost | null;
    protected _createLocalExtensionHostDataProvider(runningLocations: ExtensionRunningLocationTracker, desiredRunningLocation: ExtensionRunningLocation, isInitialStart: boolean): IWebWorkerExtensionHostDataProvider;
    private _createRemoteExtensionHostDataProvider;
}
export declare class BrowserExtensionHostKindPicker implements IExtensionHostKindPicker {
    private readonly _logService;
    constructor(_logService: ILogService);
    pickExtensionHostKind(extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
    static pickRunningLocation(extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
}
export declare class BrowserExtensionService extends ExtensionService {
    constructor(instantiationService: IInstantiationService, notificationService: INotificationService, browserEnvironmentService: IBrowserWorkbenchEnvironmentService, telemetryService: ITelemetryService, extensionEnablementService: IWorkbenchExtensionEnablementService, fileService: IFileService, productService: IProductService, extensionManagementService: IWorkbenchExtensionManagementService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, webExtensionsScannerService: IWebExtensionsScannerService, logService: ILogService, remoteAgentService: IRemoteAgentService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, lifecycleService: ILifecycleService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, userDataInitializationService: IUserDataInitializationService, userDataProfileService: IUserDataProfileService, workspaceTrustManagementService: IWorkspaceTrustManagementService, remoteExplorerService: IRemoteExplorerService, dialogService: IDialogService);
}
