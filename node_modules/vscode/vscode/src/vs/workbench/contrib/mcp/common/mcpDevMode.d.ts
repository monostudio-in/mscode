import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IDebugService } from "../../debug/common/debug.service.js";
import { IMcpDevModeDebugging } from "@codingame/monaco-vscode-mcp-service-override/vscode/vs/workbench/contrib/mcp/common/mcpDevMode.service";
import { IMcpRegistry } from "./mcpRegistryTypes.service.js";
import { IMcpServer, McpServerDefinition, McpServerLaunch } from "./mcpTypes.js";
export declare class McpDevModeServerAttache extends Disposable {
    constructor(server: IMcpServer, fwdRef: {
        lastModeDebugged: boolean;
    }, registry: IMcpRegistry, fileService: IFileService, workspaceContextService: IWorkspaceContextService);
}
export declare class McpDevModeDebugging implements IMcpDevModeDebugging {
    private readonly _debugService;
    private readonly _commandService;
    readonly _serviceBrand: undefined;
    constructor(_debugService: IDebugService, _commandService: ICommandService);
    transform(definition: McpServerDefinition, launch: McpServerLaunch): Promise<McpServerLaunch>;
    protected ensureListeningOnPort(port: number): Promise<void>;
    protected getDebugPort(): Promise<number>;
}
