import type { Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
/**
 * CDP error codes following JSON-RPC 2.0 conventions
 */
export declare const CDPErrorCode: {
    /** Method not found */
    readonly MethodNotFound: -32601;
    /** Invalid params */
    readonly InvalidParams: -32602;
    /** Internal error */
    readonly InternalError: -32603;
    /** Server error (generic) */
    readonly ServerError: -32000;
};
/**
 * Base CDP error class with error code
 */
export declare class CDPError extends Error {
    readonly code: number;
    constructor(message: string, code: number);
}
/**
 * Error thrown when a CDP method is not found
 */
export declare class CDPMethodNotFoundError extends CDPError {
    constructor(method: string);
}
/**
 * Error thrown when CDP params are invalid
 */
export declare class CDPInvalidParamsError extends CDPError {
    constructor(message: string);
}
/**
 * Error thrown for internal CDP errors
 */
export declare class CDPInternalError extends CDPError {
    constructor(message: string);
}
/**
 * Error thrown for generic CDP server errors
 */
export declare class CDPServerError extends CDPError {
    constructor(message: string);
}
/**
 * CDP message types
 */
export interface CDPRequest {
    id: number;
    method: string;
    params?: unknown;
    sessionId?: string;
}
export interface CDPResponse {
    id: number;
    result?: unknown;
    error?: {
        code: number;
        message: string;
    };
    sessionId?: string;
}
export interface CDPEvent {
    method: string;
    params: unknown;
    sessionId?: string;
}
export interface CDPTargetInfo {
    targetId: string;
    type: string;
    title: string;
    url: string;
    attached: boolean;
    canAccessOpener: boolean;
    browserContextId?: string;
}
export interface CDPBrowserVersion {
    protocolVersion: string;
    product: string;
    revision: string;
    userAgent: string;
    jsVersion: string;
}
export interface CDPWindowBounds {
    left: number;
    top: number;
    width: number;
    height: number;
    windowState: string;
}
/**
 * A debuggable CDP target (e.g., a browser view).
 * Targets can be attached to by CDP clients.
 */
export interface ICDPTarget extends IDisposable {
    /** Get target info for CDP protocol. */
    targetInfo: CDPTargetInfo;
    /** Fired when target info changes. */
    readonly onTargetInfoChanged: Event<CDPTargetInfo>;
    /** Attach to receive events and send commands. Dispose to detach. */
    attach(): Promise<ICDPConnection>;
    /** All active sessions on this target. */
    readonly sessions: ReadonlyMap<string, ICDPConnection>;
    /** Fired when a new session is created on this target. */
    readonly onSessionCreated: Event<{
        session: ICDPConnection;
        waitingForDebugger: boolean;
    }>;
    /** Can be called to notify the target that a new session has been created for it. */
    notifySessionCreated(session: ICDPConnection, waitingForDebugger: boolean): void;
    /** Fired when this target is closed or disposed. */
    readonly onClose: Event<void>;
}
/**
 * Service interface for managing CDP targets and browser contexts.
 */
export interface ICDPBrowserTarget extends ICDPTarget {
    /** Get browser version info for CDP Browser.getVersion */
    getVersion(): CDPBrowserVersion;
    /** Get the window ID and bounds for a target */
    getWindowForTarget(target: ICDPTarget): {
        windowId: number;
        bounds: CDPWindowBounds;
    };
    /** Create a new target in the specified browser context */
    createTarget(url: string, browserContextId?: string, windowId?: number): Promise<ICDPTarget>;
    /** Activate a target (bring to foreground) */
    activateTarget(target: ICDPTarget): Promise<void>;
    /** Close a target */
    closeTarget(target: ICDPTarget): Promise<boolean>;
    /** Get all browser context IDs */
    getBrowserContexts(): string[];
    /** Create a new isolated browser context */
    createBrowserContext(): Promise<string>;
    /** Dispose a browser context and all its targets */
    disposeBrowserContext(browserContextId: string): Promise<void>;
}
/**
 * A bidirectional CDP connection that can send commands and receive events.
 * Returned by ICDPTarget.attach() for low-level connections, and also
 * implemented by CDPBrowserProxy for the full protocol-aware connection.
 */
export interface ICDPConnection extends IDisposable {
    /** Optional parent session ID of this connection, if created via a specific session */
    readonly parentSessionId?: string;
    /** The session ID for this connection */
    readonly sessionId: string;
    /** The target ID this session is attached to */
    readonly targetId: string;
    /** Event fired when the connection receives a CDP event */
    readonly onEvent: Event<CDPEvent>;
    /** Event fired when the connection is closed */
    readonly onClose: Event<void>;
    /**
     * Send a CDP command and await the result.
     * @param method The CDP method to call
     * @param params Optional parameters for the method
     * @param sessionId Optional session ID for targeting a specific session
     * @returns Promise resolving to the result or rejecting with a CDPError
     */
    sendCommand(method: string, params?: unknown, sessionId?: string): Promise<unknown>;
}
