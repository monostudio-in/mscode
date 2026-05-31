import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IIterativePager } from "../../../base/common/paging.js";
import { URI } from "../../../base/common/uri.js";
import { IQueryOptions, IGalleryMcpServer, type DidUninstallMcpServerEvent, type IGalleryMcpServerConfiguration, type IInstallableMcpServer, type ILocalMcpServer, type InstallMcpServerEvent, type InstallMcpServerResult, type InstallOptions, type McpServerConfigurationParseResult, type RegistryType, type UninstallMcpServerEvent, type UninstallOptions } from "./mcpManagement.js";
export declare const IMcpGalleryService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMcpGalleryService>;
export interface IMcpGalleryService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    query(options?: IQueryOptions, token?: CancellationToken): Promise<IIterativePager<IGalleryMcpServer>>;
    getMcpServersFromGallery(infos: {
        name: string;
        id?: string;
    }[]): Promise<IGalleryMcpServer[]>;
    getMcpServer(url: string): Promise<IGalleryMcpServer | undefined>;
    getReadme(extension: IGalleryMcpServer, token: CancellationToken): Promise<string>;
}
export declare const IMcpManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMcpManagementService>;
export interface IMcpManagementService {
    readonly _serviceBrand: undefined;
    readonly onInstallMcpServer: Event<InstallMcpServerEvent>;
    readonly onDidInstallMcpServers: Event<readonly InstallMcpServerResult[]>;
    readonly onDidUpdateMcpServers: Event<readonly InstallMcpServerResult[]>;
    readonly onUninstallMcpServer: Event<UninstallMcpServerEvent>;
    readonly onDidUninstallMcpServer: Event<DidUninstallMcpServerEvent>;
    getInstalled(mcpResource?: URI): Promise<ILocalMcpServer[]>;
    canInstall(server: IGalleryMcpServer | IInstallableMcpServer): true | IMarkdownString;
    install(server: IInstallableMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<ILocalMcpServer>;
    updateMetadata(local: ILocalMcpServer, server: IGalleryMcpServer, profileLocation?: URI): Promise<ILocalMcpServer>;
    uninstall(server: ILocalMcpServer, options?: UninstallOptions): Promise<void>;
    getMcpServerConfigurationFromManifest(manifest: IGalleryMcpServerConfiguration, packageType: RegistryType): McpServerConfigurationParseResult;
}
export declare const IAllowedMcpServersService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAllowedMcpServersService>;
export interface IAllowedMcpServersService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeAllowedMcpServers: Event<void>;
    isAllowed(mcpServer: IGalleryMcpServer | ILocalMcpServer | IInstallableMcpServer): true | IMarkdownString;
}
