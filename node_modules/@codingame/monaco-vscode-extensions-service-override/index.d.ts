import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { ILifecycleService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/lifecycle/common/lifecycle.service";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { type IExtension } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { INotificationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
import { IDialogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/dialogs/common/dialogs.service";
import { IRemoteAuthorityResolverService } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver.service";
import { IRemoteExtensionsScannerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteExtensionsScanner.service";
import { IRemoteAgentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/remote/common/remoteAgentService.service";
import { IWebExtensionsScannerService, IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensionManagement/common/extensionManagement.service";
import { IExtensionManifestPropertiesService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionManifestPropertiesService.service";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { IBrowserWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service";
import type { IEditorOverrideServices } from "@codingame/monaco-vscode-api/vscode/vs/editor/standalone/browser/standaloneServices";
import { IUserDataInitializationService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/userData/browser/userDataInit.service";
import { ExtensionService } from "./vscode/src/vs/workbench/services/extensions/browser/extensionService.js";
import { ExtensionHostKind } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostKind";
import { IUserDataProfileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/userDataProfile/common/userDataProfile.service";
import { IWorkspaceTrustManagementService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspaceTrust.service";
import { IRemoteExplorerService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/remote/common/remoteExplorerService.service";
import { IExtensionResourceLoaderService } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionResourceLoader/common/extensionResourceLoader.service";
import type { LocalExtensionHost } from "vscode/localExtensionHost";
import { IBuiltinExtensionsScannerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions.service";
import { ExtensionManifestTranslator } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionsScannerService";
export interface WorkerConfig {
    url: string;
    options?: WorkerOptions;
}
declare function setLocalExtensionHost(_localExtensionHost: typeof LocalExtensionHost): void;
export declare class ExtensionServiceOverride extends ExtensionService implements IExtensionService {
    constructor(enableWorkerExtensionHost: boolean, instantiationService: IInstantiationService, notificationService: INotificationService, browserEnvironmentService: IBrowserWorkbenchEnvironmentService, telemetryService: ITelemetryService, extensionEnablementService: IWorkbenchExtensionEnablementService, fileService: IFileService, productService: IProductService, extensionManagementService: IWorkbenchExtensionManagementService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, webExtensionsScannerService: IWebExtensionsScannerService, logService: ILogService, remoteAgentService: IRemoteAgentService, remoteExtensionsScannerService: IRemoteExtensionsScannerService, lifecycleService: ILifecycleService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, userDataInitializationService: IUserDataInitializationService, userDataProfileService: IUserDataProfileService, workspaceTrustManagementService: IWorkspaceTrustManagementService, remoteExplorerService: IRemoteExplorerService, dialogService: IDialogService);
    deltaExtensions(toAdd: IExtension[], toRemove: IExtension[]): Promise<void>;
}
export declare class CustomBuiltinExtensionsScannerService extends ExtensionManifestTranslator implements IBuiltinExtensionsScannerService {
    readonly _serviceBrand: undefined;
    private readonly builtinExtensionsPromises;
    constructor(fileService: IFileService, extensionResourceLoaderService: IExtensionResourceLoaderService, logService: ILogService);
    scanBuiltinExtensions(): Promise<IExtension[]>;
}
export interface ExtensionServiceOverridesOptions {
    enableWorkerExtensionHost?: boolean;
    iframeAlternateDomain?: string;
}
export default function getServiceOverride({ enableWorkerExtensionHost, iframeAlternateDomain: _iframeAlternateDomain }?: ExtensionServiceOverridesOptions): IEditorOverrideServices;
export { ExtensionHostKind, setLocalExtensionHost };
