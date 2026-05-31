import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstallableMcpServer, IGalleryMcpServer, InstallOptions, ILocalMcpServer } from "../../../../platform/mcp/common/mcpManagement.js";
import { IMcpManagementService } from "../../../../platform/mcp/common/mcpManagement.service.js";
import { InstallWorkbenchMcpServerEvent, IWorkbenchMcpServerInstallResult, UninstallWorkbenchMcpServerEvent, DidUninstallWorkbenchMcpServerEvent, IWorkbenchLocalMcpServer, IWorkbencMcpServerInstallOptions } from "./mcpWorkbenchManagementService.js";
export declare const IWorkbenchMcpManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchMcpManagementService>;
export interface IWorkbenchMcpManagementService extends IMcpManagementService {
    readonly _serviceBrand: undefined;
    readonly onInstallMcpServerInCurrentProfile: Event<InstallWorkbenchMcpServerEvent>;
    readonly onDidInstallMcpServersInCurrentProfile: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    readonly onDidUpdateMcpServersInCurrentProfile: Event<readonly IWorkbenchMcpServerInstallResult[]>;
    readonly onUninstallMcpServerInCurrentProfile: Event<UninstallWorkbenchMcpServerEvent>;
    readonly onDidUninstallMcpServerInCurrentProfile: Event<DidUninstallWorkbenchMcpServerEvent>;
    readonly onDidChangeProfile: Event<void>;
    getInstalled(): Promise<IWorkbenchLocalMcpServer[]>;
    install(server: IInstallableMcpServer | URI, options?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchLocalMcpServer>;
    installFromGallery(server: IGalleryMcpServer, options?: InstallOptions): Promise<IWorkbenchLocalMcpServer>;
    updateMetadata(local: ILocalMcpServer, server: IGalleryMcpServer, profileLocation?: URI): Promise<IWorkbenchLocalMcpServer>;
}
