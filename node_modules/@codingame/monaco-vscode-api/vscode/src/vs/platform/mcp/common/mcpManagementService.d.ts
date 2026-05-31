import { Emitter, Event } from "../../../base/common/event.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IEnvironmentService } from "../../environment/common/environment.service.js";
import { IFileService } from "../../files/common/files.service.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.service.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.service.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.service.js";
import { DidUninstallMcpServerEvent, IGalleryMcpServer, ILocalMcpServer, IMcpServerInput, IGalleryMcpServerConfiguration, InstallMcpServerEvent, InstallMcpServerResult, RegistryType, UninstallMcpServerEvent, InstallOptions, UninstallOptions, IInstallableMcpServer, McpServerConfigurationParseResult } from "./mcpManagement.js";
import { IAllowedMcpServersService } from "./mcpManagement.service.js";
import { IMcpManagementService } from "./mcpManagement.service.js";
import { IMcpGalleryService } from "./mcpManagement.service.js";
import { IMcpSandboxConfiguration, IMcpServerVariable, IMcpServerConfiguration } from "./mcpPlatformTypes.js";
import { McpResourceTarget } from "@codingame/monaco-vscode-mcp-service-override/vscode/vs/platform/mcp/common/mcpResourceScannerService";
import { IMcpResourceScannerService } from "./mcpResourceScannerService.service.js";
export interface ILocalMcpServerInfo {
    name: string;
    version?: string;
    displayName?: string;
    galleryId?: string;
    galleryUrl?: string;
    description?: string;
    repositoryUrl?: string;
    publisher?: string;
    publisherDisplayName?: string;
    icon?: {
        dark: string;
        light: string;
    };
    codicon?: string;
    manifest?: IGalleryMcpServerConfiguration;
    readmeUrl?: URI;
    location?: URI;
    licenseUrl?: string;
}
export declare abstract class AbstractCommonMcpManagementService extends Disposable implements IMcpManagementService {
    protected readonly logService: ILogService;
    _serviceBrand: undefined;
    abstract onInstallMcpServer: Event<InstallMcpServerEvent>;
    abstract onDidInstallMcpServers: Event<readonly InstallMcpServerResult[]>;
    abstract onDidUpdateMcpServers: Event<readonly InstallMcpServerResult[]>;
    abstract onUninstallMcpServer: Event<UninstallMcpServerEvent>;
    abstract onDidUninstallMcpServer: Event<DidUninstallMcpServerEvent>;
    abstract getInstalled(mcpResource?: URI): Promise<ILocalMcpServer[]>;
    abstract install(server: IInstallableMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    abstract installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    abstract updateMetadata(local: ILocalMcpServer, server: IGalleryMcpServer, profileLocation?: URI): Promise<ILocalMcpServer>;
    abstract uninstall(server: ILocalMcpServer, options?: UninstallOptions): Promise<void>;
    abstract canInstall(server: IGalleryMcpServer | IInstallableMcpServer): true | IMarkdownString;
    constructor(logService: ILogService);
    getMcpServerConfigurationFromManifest(manifest: IGalleryMcpServerConfiguration, packageType: RegistryType): McpServerConfigurationParseResult;
    protected getCommandName(packageType: RegistryType): string;
    protected getVariables(variableInputs: Record<string, IMcpServerInput>): IMcpServerVariable[];
    private processKeyValueInputs;
    private processArguments;
}
export declare abstract class AbstractMcpResourceManagementService extends AbstractCommonMcpManagementService {
    protected readonly mcpResource: URI;
    protected readonly target: McpResourceTarget;
    protected readonly mcpGalleryService: IMcpGalleryService;
    protected readonly fileService: IFileService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly mcpResourceScannerService: IMcpResourceScannerService;
    private initializePromise;
    private readonly reloadConfigurationScheduler;
    private local;
    protected readonly _onInstallMcpServer: Emitter<InstallMcpServerEvent>;
    readonly onInstallMcpServer: Event<InstallMcpServerEvent>;
    protected readonly _onDidInstallMcpServers: Emitter<InstallMcpServerResult[]>;
    get onDidInstallMcpServers(): Event<InstallMcpServerResult[]>;
    protected readonly _onDidUpdateMcpServers: Emitter<InstallMcpServerResult[]>;
    get onDidUpdateMcpServers(): Event<InstallMcpServerResult[]>;
    protected readonly _onUninstallMcpServer: Emitter<UninstallMcpServerEvent>;
    get onUninstallMcpServer(): Event<UninstallMcpServerEvent>;
    protected _onDidUninstallMcpServer: Emitter<DidUninstallMcpServerEvent>;
    get onDidUninstallMcpServer(): Event<DidUninstallMcpServerEvent>;
    constructor(mcpResource: URI, target: McpResourceTarget, mcpGalleryService: IMcpGalleryService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService, mcpResourceScannerService: IMcpResourceScannerService);
    private initialize;
    private populateLocalServers;
    private startWatching;
    protected updateLocal(): Promise<void>;
    getInstalled(): Promise<ILocalMcpServer[]>;
    protected scanLocalServer(name: string, config: IMcpServerConfiguration, rootSandbox?: IMcpSandboxConfiguration): Promise<ILocalMcpServer>;
    install(server: IInstallableMcpServer, options?: Omit<InstallOptions, "mcpResource">): Promise<ILocalMcpServer>;
    uninstall(server: ILocalMcpServer, options?: Omit<UninstallOptions, "mcpResource">): Promise<void>;
    protected abstract getLocalServerInfo(name: string, mcpServerConfig: IMcpServerConfiguration): Promise<ILocalMcpServerInfo | undefined>;
    protected abstract installFromUri(uri: URI, options?: Omit<InstallOptions, "mcpResource">): Promise<ILocalMcpServer>;
}
export declare class McpUserResourceManagementService extends AbstractMcpResourceManagementService {
    protected readonly mcpLocation: URI;
    constructor(mcpResource: URI, mcpGalleryService: IMcpGalleryService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService, mcpResourceScannerService: IMcpResourceScannerService, environmentService: IEnvironmentService);
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    updateMetadata(local: ILocalMcpServer, gallery: IGalleryMcpServer): Promise<ILocalMcpServer>;
    protected updateMetadataFromGallery(gallery: IGalleryMcpServer): Promise<IGalleryMcpServerConfiguration>;
    protected getLocalServerInfo(name: string, mcpServerConfig: IMcpServerConfiguration): Promise<ILocalMcpServerInfo | undefined>;
    protected getLocation(name: string, version?: string): URI;
    protected installFromUri(uri: URI, options?: Omit<InstallOptions, "mcpResource">): Promise<ILocalMcpServer>;
    canInstall(): true | IMarkdownString;
}
export declare abstract class AbstractMcpManagementService extends AbstractCommonMcpManagementService implements IMcpManagementService {
    protected readonly allowedMcpServersService: IAllowedMcpServersService;
    constructor(allowedMcpServersService: IAllowedMcpServersService, logService: ILogService);
    canInstall(server: IGalleryMcpServer | IInstallableMcpServer): true | IMarkdownString;
}
export declare class McpManagementService extends AbstractMcpManagementService implements IMcpManagementService {
    private readonly userDataProfilesService;
    protected readonly instantiationService: IInstantiationService;
    private readonly _onInstallMcpServer;
    readonly onInstallMcpServer: Event<InstallMcpServerEvent>;
    private readonly _onDidInstallMcpServers;
    readonly onDidInstallMcpServers: Event<readonly InstallMcpServerResult[]>;
    private readonly _onDidUpdateMcpServers;
    readonly onDidUpdateMcpServers: Event<readonly InstallMcpServerResult[]>;
    private readonly _onUninstallMcpServer;
    readonly onUninstallMcpServer: Event<UninstallMcpServerEvent>;
    private readonly _onDidUninstallMcpServer;
    readonly onDidUninstallMcpServer: Event<DidUninstallMcpServerEvent>;
    private readonly mcpResourceManagementServices;
    constructor(allowedMcpServersService: IAllowedMcpServersService, logService: ILogService, userDataProfilesService: IUserDataProfilesService, instantiationService: IInstantiationService);
    private getMcpResourceManagementService;
    getInstalled(mcpResource?: URI): Promise<ILocalMcpServer[]>;
    install(server: IInstallableMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    uninstall(server: ILocalMcpServer, options?: UninstallOptions): Promise<void>;
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    updateMetadata(local: ILocalMcpServer, gallery: IGalleryMcpServer, mcpResource?: URI): Promise<ILocalMcpServer>;
    dispose(): void;
    protected createMcpResourceManagementService(mcpResource: URI): McpUserResourceManagementService;
}
