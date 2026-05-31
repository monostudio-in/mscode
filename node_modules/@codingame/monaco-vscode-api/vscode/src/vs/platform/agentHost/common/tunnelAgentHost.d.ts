/**
 * IPC channel name for the shared-process tunnel service.
 */
export declare const TUNNEL_AGENT_HOST_CHANNEL = "tunnelAgentHost";
/** Configuration key for the list of manually configured tunnel names. */
export declare const TunnelAgentHostsSettingId = "chat.remoteAgentTunnels";
/** Minimum protocol version required for agent host connections. */
export declare const TUNNEL_MIN_PROTOCOL_VERSION = 5;
/** Well-known port for the agent host on tunnel machines. */
export declare const TUNNEL_AGENT_HOST_PORT = 31546;
/** Label used to identify VS Code server launcher tunnels. */
export declare const TUNNEL_LAUNCHER_LABEL = "vscode-server-launcher";
/** Address prefix for tunnel-backed connections (e.g. `tunnel:myTunnelId`). */
export declare const TUNNEL_ADDRESS_PREFIX = "tunnel:";
/** Prefix for protocol version tags. */
export declare const PROTOCOL_VERSION_TAG_PREFIX = "protocolv";
/**
 * Parse tunnel tags to extract display name and protocol version.
 * Follows the convention from the vscode-remote-tunnels SDK: the
 * first label that is not `vscode-server-launcher`, does not start
 * with `_`, and is not a `protocolvN` tag is the display name.
 */
export declare class TunnelTags {
    readonly value: readonly string[] | undefined;
    readonly protocolVersion: number;
    readonly name: string | undefined;
    constructor(value: readonly string[] | undefined);
}
/** A recently used tunnel cached in storage. */
export interface ICachedTunnel {
    readonly tunnelId: string;
    readonly clusterId: string;
    readonly name: string;
    readonly authProvider?: "github" | "microsoft";
}
/** Information about a discovered dev tunnel with an agent host. */
export interface ITunnelInfo {
    /** The tunnel's unique identifier. */
    readonly tunnelId: string;
    /** The cluster region where the tunnel is hosted. */
    readonly clusterId: string;
    /** Display name derived from tunnel tags or tunnel name. */
    readonly name: string;
    /** All tags/labels on the tunnel. */
    readonly tags: readonly string[];
    /** Parsed protocol version from tags. */
    readonly protocolVersion: number;
    /** Number of hosts currently accepting connections (0 = offline). */
    readonly hostConnectionCount: number;
}
/**
 * Serializable result from a successful tunnel connect operation.
 * Returned over IPC from the shared process.
 */
export interface ITunnelConnectResult {
    /** Unique identifier for this connection's relay channel. */
    readonly connectionId: string;
    /** Display-friendly address (e.g. "tunnel:myTunnel"). */
    readonly address: string;
    /** Display name for the tunnel. */
    readonly name: string;
    /** Connection token derived from the tunnel ID. */
    readonly connectionToken: string;
}
/**
 * A message relayed from a remote agent host through the tunnel.
 * The shared process acts as a WebSocket proxy, forwarding JSON
 * messages bidirectionally between the tunnel and the renderer via IPC.
 */
export interface ITunnelRelayMessage {
    readonly connectionId: string;
    readonly data: string;
}
/** IPC channel name for the tunnel host service. */
export declare const TUNNEL_HOST_CHANNEL = "tunnelHost";
/** Output channel ID for the tunnel host logs. */
export declare const TUNNEL_HOST_LOG_ID = "tunnelHostService";
/** Information about an actively hosted tunnel. */
export interface ITunnelHostInfo {
    readonly tunnelName: string;
    readonly tunnelId: string;
    readonly clusterId: string;
    readonly domain: string;
}
/** Status of the tunnel host. */
export type TunnelHostStatus = {
    readonly active: false;
} | {
    readonly active: true;
    readonly info: ITunnelHostInfo;
};
