import { Event } from "../../../../base/common/event.js";
import { AuthenticationSessionAccount, AuthenticationSession } from "../common/authentication.js";
export declare const IAuthenticationMcpService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationMcpService>;
export interface IAuthenticationMcpService {
    readonly _serviceBrand: undefined;
    /**
    * Fires when an account preference for a specific provider has changed for the specified MCP servers. Does not fire when:
    * * An account preference is removed
    * * A session preference is changed (because it's deprecated)
    * * A session preference is removed (because it's deprecated)
    */
    readonly onDidChangeAccountPreference: Event<{
        mcpServerIds: string[];
        providerId: string;
    }>;
    /**
    * Returns the accountName (also known as account.label) to pair with `IAuthenticationMCPServerAccessService` to get the account preference
    * @param providerId The authentication provider id
    * @param mcpServerId The MCP server id to get the preference for
    * @returns The accountName of the preference, or undefined if there is no preference set
    */
    getAccountPreference(mcpServerId: string, providerId: string): string | undefined;
    /**
    * Sets the account preference for the given provider and MCP server
    * @param providerId The authentication provider id
    * @param mcpServerId The MCP server id to set the preference for
    * @param account The account to set the preference to
    */
    updateAccountPreference(mcpServerId: string, providerId: string, account: AuthenticationSessionAccount): void;
    /**
    * Removes the account preference for the given provider and MCP server
    * @param providerId The authentication provider id
    * @param mcpServerId The MCP server id to remove the preference for
    */
    removeAccountPreference(mcpServerId: string, providerId: string): void;
    /**
    * @deprecated Sets the session preference for the given provider and MCP server
    * @param providerId
    * @param mcpServerId
    * @param session
    */
    updateSessionPreference(providerId: string, mcpServerId: string, session: AuthenticationSession): void;
    /**
    * @deprecated Gets the session preference for the given provider and MCP server
    * @param providerId
    * @param mcpServerId
    * @param scopes
    */
    getSessionPreference(providerId: string, mcpServerId: string, scopes: string[]): string | undefined;
    /**
    * @deprecated Removes the session preference for the given provider and MCP server
    * @param providerId
    * @param mcpServerId
    * @param scopes
    */
    removeSessionPreference(providerId: string, mcpServerId: string, scopes: string[]): void;
    selectSession(providerId: string, mcpServerId: string, mcpServerName: string, scopes: string[], possibleSessions: readonly AuthenticationSession[]): Promise<AuthenticationSession>;
    requestSessionAccess(providerId: string, mcpServerId: string, mcpServerName: string, scopes: string[], possibleSessions: readonly AuthenticationSession[]): void;
    requestNewSession(providerId: string, scopes: string[], mcpServerId: string, mcpServerName: string): Promise<void>;
}
