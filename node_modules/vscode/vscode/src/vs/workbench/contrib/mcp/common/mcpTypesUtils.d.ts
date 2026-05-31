import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IReader } from "../../../../base/common/observable.js";
import { ILogger } from "../../../../platform/log/common/log.js";
import { ToolDataSource } from "../../chat/common/tools/languageModelToolsService.js";
import { IMcpServer, IMcpServerStartOpts } from "./mcpTypes.js";
import { IMcpService } from "./mcpTypes.service.js";
import { MCP } from "./modelContextProtocol.js";
/**
 * Waits up to `timeout` for a server passing the filter to be discovered,
 * and then starts it.
 */
export declare function startServerByFilter(mcpService: IMcpService, filter: (s: IMcpServer) => boolean, timeout?: number): Promise<void>;
/**
 * Starts a server (if needed) and waits for its tools to be live. Returns
 * true/false whether this happened successfully.
 */
export declare function startServerAndWaitForLiveTools(server: IMcpServer, opts?: IMcpServerStartOpts, token?: CancellationToken): Promise<boolean>;
export declare function mcpServerToSourceData(server: IMcpServer, reader?: IReader): ToolDataSource;
/**
 * Validates whether the given HTTP or HTTPS resource is allowed for the specified MCP server.
 *
 * @param resource The URI of the resource to validate.
 * @param server The MCP server instance to validate against, or undefined.
 * @returns True if the resource request is valid for the server, false otherwise.
 */
export declare function canLoadMcpNetworkResourceDirectly(resource: URL, server: IMcpServer | undefined): boolean;
export declare function isTaskResult(obj: MCP.Result | MCP.CreateTaskResult): obj is MCP.CreateTaskResult;
export declare function findMcpServer(mcpService: IMcpService, filter: (s: IMcpServer) => boolean, token?: CancellationToken): Promise<IMcpServer | undefined>;
export declare function translateMcpLogMessage(logger: ILogger, params: MCP.LoggingMessageNotificationParams, prefix?: string): void;
