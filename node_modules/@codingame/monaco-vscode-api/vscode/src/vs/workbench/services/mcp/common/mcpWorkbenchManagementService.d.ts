import { ILocalMcpServer, IGalleryMcpServer, InstallOptions, InstallMcpServerEvent, UninstallMcpServerEvent, DidUninstallMcpServerEvent, InstallMcpServerResult, IInstallableMcpServer } from "../../../../platform/mcp/common/mcpManagement.js";
import { IAllowedMcpServersService } from "../../../../platform/mcp/common/mcpManagement.service.js";
import { IMcpManagementService } from "../../../../platform/mcp/common/mcpManagement.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.service.js";
import { IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.service.js";
import { URI } from "../../../../base/common/uri.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.service.js";
import { IRemoteUserDataProfilesService } from "../../userDataProfile/common/remoteUserDataProfiles.service.js";
import { AbstractMcpManagementService } from "../../../../platform/mcp/common/mcpManagementService.js";
import { IWorkbenchMcpManagementService } from "./mcpWorkbenchManagementService.service.js";
export declare const USER_CONFIG_ID = "usrlocal";
export declare const REMOTE_USER_CONFIG_ID = "usrremote";
export declare const WORKSPACE_CONFIG_ID = "workspace";
export declare const WORKSPACE_FOLDER_CONFIG_ID_PREFIX = "ws";
export interface IWorkbencMcpServerInstallOptions extends InstallOptions {
    target?: ConfigurationTarget | IWorkspaceFolder;
}
export declare enum LocalMcpServerScope {
    User = "user",
    RemoteUser = "remoteUser",
    Workspace = "workspace"
}
export interface IWorkbenchLocalMcpServer extends ILocalMcpServer {
    readonly id: string;
    readonly scope: LocalMcpServerScope;
}
export interface InstallWorkbenchMcpServerEvent extends InstallMcpServerEvent {
    readonly scope: LocalMcpServerScope;
}
export interface IWorkbenchMcpServerInstallResult extends InstallMcpServerResult {
    readonly local?: IWorkbenchLocalMcpServer;
}
export interface UninstallWorkbenchMcpServerEvent extends UninstallMcpServerEvent {
    readonly scope: LocalMcpServerScope;
}
export interface DidUninstallWorkbenchMcpServerEvent extends DidUninstallMcpServerEvent {
    readonly scope: LocalMcpServerScope;
}
export declare class WorkbenchMcpManagementService extends AbstractMcpManagementService implements IWorkbenchMcpManagementService {
    private readonly mcpManagementService;
    private readonly userDataProfileService;
    private readonly uriIdentityService;
    private readonly workspaceContextService;
    private readonly userDataProfilesService;
    private readonly remoteUserDataProfilesService;
    private _onInstallMcpServer;
    readonly onInstallMcpServer: import("../../../../base/common/event.js").Event<InstallMcpServerEvent>;
    private _onDidInstallMcpServers;
    readonly onDidInstallMcpServers: import("../../../../base/common/event.js").Event<readonly InstallMcpServerResult[]>;
    private _onDidUpdateMcpServers;
    readonly onDidUpdateMcpServers: import("../../../../base/common/event.js").Event<readonly InstallMcpServerResult[]>;
    private _onUninstallMcpServer;
    readonly onUninstallMcpServer: import("../../../../base/common/event.js").Event<UninstallMcpServerEvent>;
    private _onDidUninstallMcpServer;
    readonly onDidUninstallMcpServer: import("../../../../base/common/event.js").Event<DidUninstallMcpServerEvent>;
    private readonly _onInstallMcpServerInCurrentProfile;
    readonly onInstallMcpServerInCurrentProfile: import("../../../../base/common/event.js").Event<InstallWorkbenchMcpServerEvent>;
    private readonly _onDidInstallMcpServersInCurrentProfile;
    readonly onDidInstallMcpServersInCurrentProfile: import("../../../../base/common/event.js").Event<readonly IWorkbenchMcpServerInstallResult[]>;
    private readonly _onDidUpdateMcpServersInCurrentProfile;
    readonly onDidUpdateMcpServersInCurrentProfile: import("../../../../base/common/event.js").Event<readonly IWorkbenchMcpServerInstallResult[]>;
    private readonly _onUninstallMcpServerInCurrentProfile;
    readonly onUninstallMcpServerInCurrentProfile: import("../../../../base/common/event.js").Event<UninstallWorkbenchMcpServerEvent>;
    private readonly _onDidUninstallMcpServerInCurrentProfile;
    readonly onDidUninstallMcpServerInCurrentProfile: import("../../../../base/common/event.js").Event<DidUninstallWorkbenchMcpServerEvent>;
    private readonly _onDidChangeProfile;
    readonly onDidChangeProfile: import("../../../../base/common/event.js").Event<void>;
    private readonly workspaceMcpManagementService;
    private readonly remoteMcpManagementService;
    constructor(mcpManagementService: IMcpManagementService, allowedMcpServersService: IAllowedMcpServersService, logService: ILogService, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService, workspaceContextService: IWorkspaceContextService, remoteAgentService: IRemoteAgentService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, instantiationService: IInstantiationService);
    private createInstallMcpServerResultsFromEvent;
    private handleRemoteInstallMcpServerResultsFromEvent;
    getInstalled(): Promise<IWorkbenchLocalMcpServer[]>;
    private toWorkspaceMcpServer;
    private getConfigId;
    install(server: IInstallableMcpServer, options?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchLocalMcpServer>;
    installFromGallery(server: IGalleryMcpServer, options?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchLocalMcpServer>;
    updateMetadata(local: IWorkbenchLocalMcpServer, server: IGalleryMcpServer, profileLocation: URI): Promise<IWorkbenchLocalMcpServer>;
    uninstall(server: IWorkbenchLocalMcpServer): Promise<void>;
    private getRemoteMcpResource;
}
