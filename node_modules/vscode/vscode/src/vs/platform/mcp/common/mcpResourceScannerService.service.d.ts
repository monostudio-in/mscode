import { URI } from "../../../base/common/uri.js";
import { IInstallableMcpServer } from "./mcpManagement.js";
import { McpResourceTarget, IScannedMcpServers } from "@codingame/monaco-vscode-mcp-service-override/vscode/vs/platform/mcp/common/mcpResourceScannerService";
export declare const IMcpResourceScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMcpResourceScannerService>;
export interface IMcpResourceScannerService {
    readonly _serviceBrand: undefined;
    scanMcpServers(mcpResource: URI, target?: McpResourceTarget): Promise<IScannedMcpServers>;
    addMcpServers(servers: IInstallableMcpServer[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    updateSandboxConfig(updateFn: (data: IScannedMcpServers) => IScannedMcpServers, mcpResource: URI, target?: McpResourceTarget): Promise<void>;
    removeMcpServers(serverNames: string[], mcpResource: URI, target?: McpResourceTarget): Promise<void>;
}
