import * as vscode from "vscode";
import { Event } from "../../../base/common/event.js";
import { Disposable, DisposableMap, IDisposable } from "../../../base/common/lifecycle.js";
import { IAuthorizationProtectedResourceMetadata, IAuthorizationServerMetadata } from "../../../base/common/oauth.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { LogLevel } from "../../../platform/log/common/log.js";
import { ILogService } from "../../../platform/log/common/log.service.js";
import { McpServerDefinition, McpServerLaunch, McpServerTransportHTTP } from "../../contrib/mcp/common/mcpTypes.js";
import { ExtHostMcpShape, IAuthMetadataSource, IStartMcpOptions, MainThreadMcpShape } from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IExtHostVariableResolverProvider } from "./extHostVariableResolverService.js";
import { IExtHostWorkspace } from "./extHostWorkspace.js";
export declare const IExtHostMpcService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostMpcService>;
export interface IExtHostMpcService extends ExtHostMcpShape {
    registerMcpConfigurationProvider(extension: IExtensionDescription, id: string, provider: vscode.McpServerDefinitionProvider): IDisposable;
    /** Event that fires when the set of MCP server definitions changes. */
    readonly onDidChangeMcpServerDefinitions: Event<void>;
    /** Returns all MCP server definitions known to the editor. */
    readonly mcpServerDefinitions: readonly vscode.McpServerDefinition[];
    /** Starts an MCP gateway that exposes MCP servers via HTTP endpoints. */
    startMcpGateway(chatSessionResource?: URI): Promise<vscode.McpGateway | undefined>;
}
export declare class ExtHostMcpService extends Disposable implements IExtHostMpcService {
    protected readonly _logService: ILogService;
    private readonly _extHostInitData;
    protected readonly _workspaceService: IExtHostWorkspace;
    private readonly _variableResolver;
    protected _proxy: MainThreadMcpShape;
    private readonly _initialProviderPromises;
    protected readonly _sseEventSources: DisposableMap<number, McpHTTPHandle>;
    private readonly _unresolvedMcpServers;
    private readonly _onDidChangeMcpServerDefinitions;
    readonly onDidChangeMcpServerDefinitions: Event<void>;
    private _mcpServerDefinitions;
    private readonly _activeGateways;
    constructor(extHostRpc: IExtHostRpcService, _logService: ILogService, _extHostInitData: IExtHostInitDataService, _workspaceService: IExtHostWorkspace, _variableResolver: IExtHostVariableResolverProvider);
    /** Returns all MCP server definitions known to the editor. */
    get mcpServerDefinitions(): readonly vscode.McpServerDefinition[];
    /** Called by main thread to notify that MCP server definitions have changed. */
    $onDidChangeMcpServerDefinitions(servers: McpServerDefinition.Serialized[]): void;
    $startMcp(id: number, opts: IStartMcpOptions): void;
    protected _startMcp(id: number, launch: McpServerLaunch, _defaultCwd?: URI, errorOnUserInteraction?: boolean): void;
    $substituteVariables<T>(_workspaceFolder: UriComponents | undefined, value: T): Promise<T>;
    $stopMcp(id: number): void;
    private _didClose;
    $sendMessage(id: number, message: string): void;
    $waitForInitialCollectionProviders(): Promise<void>;
    $resolveMcpLaunch(collectionId: string, label: string): Promise<McpServerLaunch.Serialized | undefined>;
    /** {@link vscode.lm.registerMcpServerDefinitionProvider} */
    registerMcpConfigurationProvider(extension: IExtensionDescription, id: string, provider: vscode.McpServerDefinitionProvider): IDisposable;
    /** {@link vscode.lm.startMcpGateway} */
    startMcpGateway(chatSessionResource?: URI): Promise<vscode.McpGateway | undefined>;
    /** Called by main thread to notify that a gateway's server set has changed. */
    $onDidChangeGatewayServers(gatewayId: string, newServers: {
        label: string;
        address: UriComponents;
    }[]): void;
}
/**
 * Implementation of both MCP HTTP Streaming as well as legacy SSE.
 *
 * The first request will POST to the endpoint, assuming HTTP streaming. If the
 * server is legacy SSE, it should return some 4xx status in that case,
 * and we'll automatically fall back to SSE and res
 */
export declare class McpHTTPHandle extends Disposable {
    private readonly _id;
    private readonly _launch;
    private readonly _proxy;
    private readonly _logService;
    private readonly _errorOnUserInteraction?;
    private readonly _requestSequencer;
    private readonly _postEndpoint;
    private _mode;
    private readonly _cts;
    private readonly _abortCtrl;
    private _authMetadata?;
    private _didSendClose;
    constructor(_id: number, _launch: McpServerTransportHTTP, _proxy: MainThreadMcpShape, _logService: ILogService, _errorOnUserInteraction?: boolean | undefined);
    send(message: string): Promise<void>;
    close(): Promise<void>;
    private _closeSession;
    private _send;
    /**
     * Sends a streamable-HTTP request.
     * 1. Posts to the endpoint
     * 2. Updates internal state as needed. Falls back to SSE if appropriate.
     * 3. If the response body is empty, JSON, or a JSON stream, handle it appropriately.
     */
    private _sendStreamableHttp;
    private _sseFallbackWithMessage;
    private _handleSuccessfulStreamableHttp;
    /**
     * Attaches the SSE backchannel that streamable HTTP servers can use
     * for async notifications. This is a "MAY" support, so if the server gives
     * us a 4xx code, we'll stop trying to connect..
     */
    private _attachStreamableBackchannel;
    /**
     * Starts a legacy SSE attachment, where the SSE response is the session lifetime.
     * Unlike `_attachStreamableBackchannel`, this fails the server if it disconnects.
     */
    private _attachSSE;
    /**
     * Sends a legacy SSE message to the server. The response is always empty and
     * is otherwise received in {@link _attachSSE}'s loop.
     */
    private _sendLegacySSE;
    /** Generic handle to pipe a response into an SSE parser. */
    private _doSSE;
    private _addAuthHeader;
    private _log;
    private _getErrText;
    /**
     * Helper method to perform fetch with authentication retry logic.
     * If the initial request returns an auth error and we don't have auth metadata,
     * it will populate the auth metadata and retry once.
     * If we already have auth metadata, check if the scopes changed and update them.
     */
    private _fetchWithAuthRetry;
    private _fetch;
    protected _fetchInternal(url: string, init?: CommonRequestInit): Promise<CommonResponse>;
}
interface MinimalRequestInit {
    method: string;
    headers: Record<string, string>;
    body?: Uint8Array<ArrayBuffer>;
}
export interface CommonRequestInit extends MinimalRequestInit {
    signal?: AbortSignal;
    redirect?: RequestRedirect;
}
export interface CommonResponse {
    status: number;
    statusText: string;
    headers: Headers;
    body?: ReadableStream | null;
    url: string;
    json(): Promise<any>;
    text(): Promise<string>;
}
/**
 * Logger callback type for AuthMetadata operations.
 */
export type AuthMetadataLogger = (level: LogLevel, message: string) => void;
/**
 * Interface for authentication metadata that can be updated when scopes change.
 */
export interface IAuthMetadata {
    readonly authorizationServer: URI;
    readonly serverMetadata: IAuthorizationServerMetadata;
    readonly resourceMetadata: IAuthorizationProtectedResourceMetadata | undefined;
    readonly scopes: string[] | undefined;
    /** Telemetry data about how auth metadata was discovered */
    readonly telemetry: IAuthMetadataSource;
    /**
     * Updates the scopes based on the WWW-Authenticate header in the response.
     * @param response The HTTP response containing potential scope challenges
     * @returns true if scopes were updated, false otherwise
     */
    update(responseHeaders: Headers): boolean;
}
/**
 * Concrete implementation of IAuthMetadata that manages OAuth authentication metadata.
 * Consumers should use {@link createAuthMetadata} to create instances.
 */
declare class AuthMetadata implements IAuthMetadata {
    readonly authorizationServer: URI;
    readonly serverMetadata: IAuthorizationServerMetadata;
    readonly resourceMetadata: IAuthorizationProtectedResourceMetadata | undefined;
    readonly telemetry: IAuthMetadataSource;
    private readonly _log;
    private _scopes;
    constructor(authorizationServer: URI, serverMetadata: IAuthorizationServerMetadata, resourceMetadata: IAuthorizationProtectedResourceMetadata | undefined, scopes: string[] | undefined, telemetry: IAuthMetadataSource, _log: AuthMetadataLogger);
    get scopes(): string[] | undefined;
    update(responseHeaders: Headers): boolean;
    private _parseScopesFromResponse;
}
/**
 * Options for creating AuthMetadata.
 */
export interface ICreateAuthMetadataOptions {
    /** Headers to include when fetching metadata from the same origin as the resource server */
    sameOriginHeaders?: Record<string, string>;
    /** Fetch function to use for HTTP requests */
    fetch: (url: string, init: MinimalRequestInit) => Promise<CommonResponse>;
    /** Logger function for diagnostic output */
    log: AuthMetadataLogger;
}
/**
 * Creates an AuthMetadata instance by discovering OAuth metadata from the server.
 *
 * This function:
 * 1. Parses the WWW-Authenticate header for resource_metadata and scope challenges
 * 2. Fetches OAuth protected resource metadata from well-known URIs or the challenge URL
 * 3. Fetches authorization server metadata
 * 4. Falls back to default metadata if discovery fails
 *
 * @param resourceUrl The resource server URL
 * @param wwwAuthenticateValue The value of the WWW-Authenticate header from the original HTTP response
 * @param options Configuration options including headers, fetch function, and logger
 * @returns A new AuthMetadata instance
 */
export declare function createAuthMetadata(resourceUrl: string, initialResponseHeaders: Headers, options: ICreateAuthMetadataOptions): Promise<AuthMetadata>;
export {};
