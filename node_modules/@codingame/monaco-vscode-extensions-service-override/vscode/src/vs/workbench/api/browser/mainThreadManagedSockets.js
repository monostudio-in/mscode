
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Emitter, Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable, DisposableMap, DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { SocketCloseEventType } from '@codingame/monaco-vscode-api/vscode/vs/base/parts/ipc/common/ipc.net';
import { ManagedSocket, connectManagedSocket } from '../../../platform/remote/common/managedSocket.js';
import { RemoteConnectionType } from '@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver';
import { IRemoteSocketFactoryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteSocketFactoryService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

let MainThreadManagedSockets = class MainThreadManagedSockets extends Disposable {
    constructor(extHostContext, _remoteSocketFactoryService) {
        super();
        this._remoteSocketFactoryService = _remoteSocketFactoryService;
        this._registrations = this._register(( new DisposableMap()));
        this._remoteSockets = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostManagedSockets));
    }
    async $registerSocketFactory(socketFactoryId) {
        const that = this;
        const store = ( new DisposableStore());
        const socketFactory = new (class {
            supports(connectTo) {
                return (connectTo.id === socketFactoryId);
            }
            connect(connectTo, path, query, debugLabel) {
                return ( new Promise((resolve, reject) => {
                    if (connectTo.id !== socketFactoryId) {
                        return reject(( new Error("Invalid connectTo")));
                    }
                    const factoryId = connectTo.id;
                    that._proxy.$openRemoteSocket(factoryId).then(socketId => {
                        const half = {
                            onClose: ( new Emitter()),
                            onData: ( new Emitter()),
                            onEnd: ( new Emitter())
                        };
                        that._remoteSockets.set(socketId, half);
                        MainThreadManagedSocket.connect(socketId, that._proxy, path, query, debugLabel, half).then(socket => {
                            store.add(
                                Event.once(socket.onDidDispose)(() => that._remoteSockets.delete(socketId))
                            );
                            resolve(socket);
                        }, err => {
                            that._remoteSockets.delete(socketId);
                            reject(err);
                        });
                    }).catch(reject);
                }));
            }
        })();
        store.add(
            this._remoteSocketFactoryService.register(RemoteConnectionType.Managed, socketFactory)
        );
        this._registrations.set(socketFactoryId, store);
    }
    async $unregisterSocketFactory(socketFactoryId) {
        this._registrations.deleteAndDispose(socketFactoryId);
    }
    $onDidManagedSocketHaveData(socketId, data) {
        this._remoteSockets.get(socketId)?.onData.fire(data);
    }
    $onDidManagedSocketClose(socketId, error) {
        this._remoteSockets.get(socketId)?.onClose.fire({
            type: SocketCloseEventType.NodeSocketCloseEvent,
            error: error ? ( new Error(error)) : undefined,
            hadError: !!error
        });
        this._remoteSockets.delete(socketId);
    }
    $onDidManagedSocketEnd(socketId) {
        this._remoteSockets.get(socketId)?.onEnd.fire();
    }
};
MainThreadManagedSockets = __decorate(
    [extHostNamedCustomer(MainContext.MainThreadManagedSockets), ( __param(1, IRemoteSocketFactoryService))],
    MainThreadManagedSockets
);
class MainThreadManagedSocket extends ManagedSocket {
    static connect(socketId, proxy, path, query, debugLabel, half) {
        const socket = ( new MainThreadManagedSocket(socketId, proxy, debugLabel, half));
        return connectManagedSocket(socket, path, query, debugLabel, half);
    }
    constructor(socketId, proxy, debugLabel, half) {
        super(debugLabel, half);
        this.socketId = socketId;
        this.proxy = proxy;
    }
    write(buffer) {
        this.proxy.$remoteSocketWrite(this.socketId, buffer);
    }
    closeRemote() {
        this.proxy.$remoteSocketEnd(this.socketId);
    }
    drain() {
        return this.proxy.$remoteSocketDrain(this.socketId);
    }
}

export { MainThreadManagedSocket, MainThreadManagedSockets };
