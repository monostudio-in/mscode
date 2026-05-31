import { IStringDictionary } from "../../../base/common/collections.js";
export interface IMcpDevModeConfig {
    /** Pattern or list of glob patterns to watch relative to the workspace folder. */
    watch?: string | string[];
    /** Whether to debug the MCP server when it's started. */
    debug?: {
        type: "node";
    } | {
        type: "debugpy";
        debugpyPath?: string;
    };
}
export interface IMcpSandboxConfiguration {
    network?: {
        allowedDomains?: string[];
        deniedDomains?: string[];
    };
    filesystem?: {
        denyRead?: string[];
        allowWrite?: string[];
        denyWrite?: string[];
    };
}
export declare enum McpServerVariableType {
    PROMPT = "promptString",
    PICK = "pickString"
}
export interface IMcpServerVariable {
    readonly id: string;
    readonly type: McpServerVariableType;
    readonly description: string;
    readonly password: boolean;
    readonly default?: string;
    readonly options?: readonly string[];
    readonly serverName?: string;
}
export declare enum McpServerType {
    LOCAL = "stdio",
    REMOTE = "http"
}
export interface ICommonMcpServerConfiguration {
    readonly type: McpServerType;
    readonly version?: string;
    readonly gallery?: boolean | string;
}
export interface IMcpStdioServerConfiguration extends ICommonMcpServerConfiguration {
    readonly type: McpServerType.LOCAL;
    readonly command: string;
    readonly args?: readonly string[];
    readonly env?: Record<string, string | number | null>;
    readonly envFile?: string;
    readonly cwd?: string;
    readonly sandboxEnabled?: boolean;
    readonly dev?: IMcpDevModeConfig;
}
export interface IMcpRemoteServerOAuthConfiguration {
    readonly clientId?: string;
}
export interface IMcpRemoteServerConfiguration extends ICommonMcpServerConfiguration {
    readonly type: McpServerType.REMOTE;
    readonly url: string;
    readonly headers?: Record<string, string>;
    readonly oauth?: IMcpRemoteServerOAuthConfiguration;
    readonly dev?: IMcpDevModeConfig;
}
export type IMcpServerConfiguration = IMcpStdioServerConfiguration | IMcpRemoteServerConfiguration;
export interface IMcpServersConfiguration {
    servers?: IStringDictionary<IMcpServerConfiguration>;
    inputs?: IMcpServerVariable[];
}
