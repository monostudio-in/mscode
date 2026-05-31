import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IAddressProvider } from "../../remote/common/remoteAgentConnection.js";
import { TunnelPrivacy } from "../../remote/common/remoteAuthorityResolver.js";
import { RemoteTunnel, ITunnelProvider, TunnelProviderFeatures } from "./tunnel.js";
export declare const ITunnelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ITunnelService>;
export interface ITunnelService {
    readonly _serviceBrand: undefined;
    readonly tunnels: Promise<readonly RemoteTunnel[]>;
    readonly canChangePrivacy: boolean;
    readonly privacyOptions: TunnelPrivacy[];
    readonly onTunnelOpened: Event<RemoteTunnel>;
    readonly onTunnelClosed: Event<{
        host: string;
        port: number;
    }>;
    readonly canElevate: boolean;
    readonly canChangeProtocol: boolean;
    readonly hasTunnelProvider: boolean;
    readonly onAddedTunnelProvider: Event<void>;
    canTunnel(uri: URI): boolean;
    openTunnel(addressProvider: IAddressProvider | undefined, remoteHost: string | undefined, remotePort: number, localHost?: string, localPort?: number, elevateIfNeeded?: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
    getExistingTunnel(remoteHost: string, remotePort: number): Promise<RemoteTunnel | string | undefined>;
    setEnvironmentTunnel(remoteHost: string, remotePort: number, localAddress: string, privacy: string, protocol: string): void;
    closeTunnel(remoteHost: string, remotePort: number): Promise<void>;
    setTunnelProvider(provider: ITunnelProvider | undefined): IDisposable;
    setTunnelFeatures(features: TunnelProviderFeatures): void;
    isPortPrivileged(port: number): boolean;
}
export declare const ISharedTunnelsService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISharedTunnelsService>;
export interface ISharedTunnelsService {
    readonly _serviceBrand: undefined;
    openTunnel(authority: string, addressProvider: IAddressProvider | undefined, remoteHost: string | undefined, remotePort: number, localHost: string, localPort?: number, elevateIfNeeded?: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
}
