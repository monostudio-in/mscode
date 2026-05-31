import { ErrorNoTelemetry } from "../../../base/common/errors.js";
export declare enum RemoteConnectionType {
    WebSocket = 0,
    Managed = 1
}
export declare class ManagedRemoteConnection {
    readonly id: number;
    readonly type = RemoteConnectionType.Managed;
    constructor(id: number);
    toString(): string;
}
export declare class WebSocketRemoteConnection {
    readonly host: string;
    readonly port: number;
    readonly type = RemoteConnectionType.WebSocket;
    constructor(host: string, port: number);
    toString(): string;
}
export type RemoteConnection = WebSocketRemoteConnection | ManagedRemoteConnection;
export type RemoteConnectionOfType<T extends RemoteConnectionType> = RemoteConnection & {
    type: T;
};
export interface ResolvedAuthority {
    readonly authority: string;
    readonly connectTo: RemoteConnection;
    readonly connectionToken: string | undefined;
}
export interface ResolvedOptions {
    readonly extensionHostEnv?: {
        [key: string]: string | null;
    };
    readonly isTrusted?: boolean;
    readonly authenticationSession?: {
        id: string;
        providerId: string;
    };
}
export interface TunnelDescription {
    remoteAddress: {
        port: number;
        host: string;
    };
    localAddress: {
        port: number;
        host: string;
    } | string;
    privacy?: string;
    protocol?: string;
}
export interface TunnelPrivacy {
    themeIcon: string;
    id: string;
    label: string;
}
export interface TunnelInformation {
    environmentTunnels?: TunnelDescription[];
    features?: {
        elevation: boolean;
        public?: boolean;
        privacyOptions: TunnelPrivacy[];
        protocol: boolean;
    };
}
export interface ResolverResult {
    authority: ResolvedAuthority;
    options?: ResolvedOptions;
    tunnelInformation?: TunnelInformation;
}
export interface IRemoteConnectionData {
    connectTo: RemoteConnection;
    connectionToken: string | undefined;
}
export declare enum RemoteAuthorityResolverErrorCode {
    Unknown = "Unknown",
    NotAvailable = "NotAvailable",
    TemporarilyNotAvailable = "TemporarilyNotAvailable",
    NoResolverFound = "NoResolverFound",
    InvalidAuthority = "InvalidAuthority"
}
export declare class RemoteAuthorityResolverError extends ErrorNoTelemetry {
    static isNotAvailable(err: any): boolean;
    static isTemporarilyNotAvailable(err: any): boolean;
    static isNoResolverFound(err: any): err is RemoteAuthorityResolverError;
    static isInvalidAuthority(err: any): boolean;
    static isHandled(err: any): boolean;
    readonly _message: string | undefined;
    readonly _code: RemoteAuthorityResolverErrorCode;
    readonly _detail: unknown;
    isHandled: boolean;
    constructor(message?: string, code?: RemoteAuthorityResolverErrorCode, detail?: unknown);
}
export declare function getRemoteAuthorityPrefix(remoteAuthority: string): string;
