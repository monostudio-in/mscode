import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IURITransformer } from "../../../base/common/uriIpc.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { ILogService } from "../../log/common/log.service.js";
import { RemoteAgentConnectionContext } from "../../remote/common/remoteAgentEnvironment.js";
import { DidUninstallMcpServerEvent, IGalleryMcpServer, ILocalMcpServer, IInstallableMcpServer, InstallMcpServerEvent, InstallMcpServerResult, InstallOptions, UninstallMcpServerEvent, UninstallOptions } from "./mcpManagement.js";
import { IAllowedMcpServersService } from "./mcpManagement.service.js";
import { IMcpManagementService } from "./mcpManagement.service.js";
import { AbstractMcpManagementService } from "./mcpManagementService.js";
export declare class McpManagementChannel<TContext = RemoteAgentConnectionContext | string> implements IServerChannel<TContext> {
    private service;
    private getUriTransformer;
    readonly onInstallMcpServer: Event<InstallMcpServerEvent>;
    readonly onDidInstallMcpServers: Event<readonly InstallMcpServerResult[]>;
    readonly onDidUpdateMcpServers: Event<readonly InstallMcpServerResult[]>;
    readonly onUninstallMcpServer: Event<UninstallMcpServerEvent>;
    readonly onDidUninstallMcpServer: Event<DidUninstallMcpServerEvent>;
    constructor(service: IMcpManagementService, getUriTransformer: (requestContext: TContext) => IURITransformer | null);
    listen<T>(context: TContext, event: string): Event<T>;
    call<T>(context: TContext, command: string, args?: unknown): Promise<T>;
}
export declare class McpManagementChannelClient extends AbstractMcpManagementService implements IMcpManagementService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private readonly _onInstallMcpServer;
    get onInstallMcpServer(): Event<InstallMcpServerEvent>;
    private readonly _onDidInstallMcpServers;
    get onDidInstallMcpServers(): Event<readonly InstallMcpServerResult[]>;
    private readonly _onUninstallMcpServer;
    get onUninstallMcpServer(): Event<UninstallMcpServerEvent>;
    private readonly _onDidUninstallMcpServer;
    get onDidUninstallMcpServer(): Event<DidUninstallMcpServerEvent>;
    private readonly _onDidUpdateMcpServers;
    get onDidUpdateMcpServers(): Event<InstallMcpServerResult[]>;
    constructor(channel: IChannel, allowedMcpServersService: IAllowedMcpServersService, logService: ILogService);
    install(server: IInstallableMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    installFromGallery(extension: IGalleryMcpServer, installOptions?: InstallOptions): Promise<ILocalMcpServer>;
    uninstall(extension: ILocalMcpServer, options?: UninstallOptions): Promise<void>;
    getInstalled(mcpResource?: URI): Promise<ILocalMcpServer[]>;
    updateMetadata(local: ILocalMcpServer, gallery: IGalleryMcpServer, mcpResource?: URI): Promise<ILocalMcpServer>;
}
