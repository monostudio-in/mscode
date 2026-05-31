import { IDisposable } from "../../../base/common/lifecycle.js";
import { ISocket } from "../../../base/parts/ipc/common/ipc.net.js";
import { RemoteConnectionType, RemoteConnection } from "./remoteAuthorityResolver.js";
import { ISocketFactory } from "@codingame/monaco-vscode-remote-agent-service-override/vscode/vs/platform/remote/common/remoteSocketFactoryService";
export declare const IRemoteSocketFactoryService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRemoteSocketFactoryService>;
export interface IRemoteSocketFactoryService {
    readonly _serviceBrand: undefined;
    /**
    * Register a socket factory for the given message passing type
    * @param type passing type to register for
    * @param factory function that returns the socket factory, or undefined if
    * it can't handle the data.
    */
    register<T extends RemoteConnectionType>(type: T, factory: ISocketFactory<T>): IDisposable;
    connect(connectTo: RemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
