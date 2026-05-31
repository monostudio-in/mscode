import { Event } from "../../../../base/common/event.js";
import { IProviderQuery, IExtensionQuery, IMcpServerQuery } from "./authenticationQuery.js";
/**
* Main authentication query service interface
*/
export declare const IAuthenticationQueryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationQueryService>;
export interface IAuthenticationQueryService {
    readonly _serviceBrand: undefined;
    /**
    * Fires when authentication preferences change
    */
    readonly onDidChangePreferences: Event<{
        readonly providerId: string;
        readonly entityType: "extension" | "mcpServer";
        readonly entityIds: string[];
    }>;
    /**
    * Fires when authentication access permissions change
    */
    readonly onDidChangeAccess: Event<{
        readonly providerId: string;
        readonly accountName: string;
    }>;
    /**
    * Get operations for a specific authentication provider
    * @param providerId The authentication provider id
    * @returns A provider query interface
    */
    provider(providerId: string): IProviderQuery;
    /**
    * Get operations for a specific extension across all providers
    * @param extensionId The extension id
    * @returns An extension query interface
    */
    extension(extensionId: string): IExtensionQuery;
    /**
    * Get operations for a specific MCP server across all providers
    * @param mcpServerId The MCP server id
    * @returns An MCP server query interface
    */
    mcpServer(mcpServerId: string): IMcpServerQuery;
    /**
    * Get all available provider IDs
    * @returns Array of provider IDs
    */
    getProviderIds(): string[];
    /**
    * Clear all authentication data (for testing/debugging purposes)
    * @param confirmation Must be 'CLEAR_ALL_AUTH_DATA' to confirm
    * @param includeInternal Whether to include internal providers (defaults to true for complete clearing)
    */
    clearAllData(confirmation: "CLEAR_ALL_AUTH_DATA", includeInternal?: boolean): Promise<void>;
}
