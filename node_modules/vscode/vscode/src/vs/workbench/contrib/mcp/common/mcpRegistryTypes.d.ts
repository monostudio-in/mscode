import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../base/common/observable.js";
import { ILogger, LogLevel } from "../../../../platform/log/common/log.js";
import { McpTaskManager } from "./mcpTaskManager.js";
import { McpCollectionDefinition, McpCollectionReference, McpConnectionState, McpDefinitionReference, McpServerDefinition, McpServerLaunch, McpStartServerInteraction } from "./mcpTypes.js";
import { MCP } from "./modelContextProtocol.js";
/** Message transport to a single MCP server. */
export interface IMcpMessageTransport extends IDisposable {
    readonly state: IObservable<McpConnectionState>;
    readonly onDidLog: Event<{
        level: LogLevel;
        message: string;
    }>;
    readonly onDidReceiveMessage: Event<MCP.JSONRPCMessage>;
    send(message: MCP.JSONRPCMessage): void;
    stop(): void;
}
export interface IMcpHostDelegate {
    /** Priority for this delegate, delegates are tested in descending priority order */
    readonly priority: number;
    waitForInitialProviderPromises(): Promise<void>;
    canStart(collectionDefinition: McpCollectionDefinition, serverDefinition: McpServerDefinition): boolean;
    substituteVariables(serverDefinition: McpServerDefinition, launch: McpServerLaunch): Promise<McpServerLaunch>;
    start(collectionDefinition: McpCollectionDefinition, serverDefinition: McpServerDefinition, resolvedLaunch: McpServerLaunch, options?: {
        errorOnUserInteraction?: boolean;
    }): IMcpMessageTransport;
}
export interface IMcpResolveConnectionOptions {
    logger: ILogger;
    interaction?: McpStartServerInteraction;
    collectionRef: McpCollectionReference;
    definitionRef: McpDefinitionReference;
    /** A reference (on the server) to its last nonce where trust was given. */
    trustNonceBearer: {
        trustedAtNonce: string | undefined;
    };
    /**
     * When to trigger the trust prompt.
     * - only-new: only prompt for servers that are not previously explicitly untrusted (default)
     * - all-untrusted: prompt for all servers that are not trusted
     * - never: don't prompt, fail silently when trying to start an untrusted server
     */
    promptType?: "only-new" | "all-untrusted" | "never";
    /**
     * Automatically trust if changed. This should ONLY be set for afforances that
     * ensure the user sees the config before it gets started (e.g. code lenses)
     */
    autoTrustChanges?: boolean;
    /** If set, try to launch with debugging when dev mode is configured */
    debug?: boolean;
    /** If true, throw an error if any user interaction would be required during startup. */
    errorOnUserInteraction?: boolean;
    /** Shared task manager for server-side MCP tasks (survives reconnections) */
    taskManager: McpTaskManager;
}
