import { IAuthenticationMcpUsage } from "@codingame/monaco-vscode-mcp-service-override/vscode/vs/workbench/services/authentication/browser/authenticationMcpUsageService";
export declare const IAuthenticationMcpUsageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationMcpUsageService>;
export interface IAuthenticationMcpUsageService {
    readonly _serviceBrand: undefined;
    /**
    * Initializes the cache of MCP servers that use authentication. Ideally used in a contribution that can be run eventually after the workspace is loaded.
    */
    initializeUsageCache(): Promise<void>;
    /**
    * Checks if an MCP server uses authentication
    * @param mcpServerId The id of the MCP server to check
    */
    hasUsedAuth(mcpServerId: string): Promise<boolean>;
    /**
    * Reads the usages for an account
    * @param providerId The id of the authentication provider to get usages for
    * @param accountName The name of the account to get usages for
    */
    readAccountUsages(providerId: string, accountName: string): IAuthenticationMcpUsage[];
    /**
    *
    * @param providerId The id of the authentication provider to get usages for
    * @param accountName The name of the account to get usages for
    */
    removeAccountUsage(providerId: string, accountName: string): void;
    /**
    * Adds a usage for an account
    * @param providerId The id of the authentication provider to get usages for
    * @param accountName The name of the account to get usages for
    * @param mcpServerId The id of the MCP server to add a usage for
    * @param mcpServerName The name of the MCP server to add a usage for
    */
    addAccountUsage(providerId: string, accountName: string, scopes: ReadonlyArray<string>, mcpServerId: string, mcpServerName: string): void;
}
