
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { dispose } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IDecorationsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/decorations/common/decorations.service';
import { CancellationToken } from '@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation';
import { DeferredPromise } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';
import { CancellationError } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';

class DecorationRequestsQueue {
    constructor(_proxy, _handle) {
        this._proxy = _proxy;
        this._handle = _handle;
        this._idPool = 0;
        this._requests = ( new Map());
        this._resolver = ( new Map());
    }
    enqueue(uri, token) {
        const id = ++this._idPool;
        const defer = ( new DeferredPromise());
        this._requests.set(id, {
            id,
            uri
        });
        this._resolver.set(id, defer);
        this._processQueue();
        const sub = token.onCancellationRequested(() => {
            this._requests.delete(id);
            this._resolver.delete(id);
            defer.error(( new CancellationError()));
        });
        return defer.p.finally(() => sub.dispose());
    }
    _processQueue() {
        if (this._timer !== undefined) {
            return;
        }
        this._timer = setTimeout(() => {
            const requests = this._requests;
            const resolver = this._resolver;
            this._proxy.$provideDecorations(this._handle, [...( requests.values())], CancellationToken.None).then(data => {
                for (const [id, defer] of resolver) {
                    defer.complete(data[id]);
                }
            });
            this._requests = ( new Map());
            this._resolver = ( new Map());
            this._timer = undefined;
        }, 0);
    }
}
let MainThreadDecorations = class MainThreadDecorations {
    constructor(context, _decorationsService) {
        this._decorationsService = _decorationsService;
        this._provider = ( new Map());
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostDecorations));
    }
    dispose() {
        this._provider.forEach(value => dispose(value));
        this._provider.clear();
    }
    $registerDecorationProvider(handle, label) {
        const emitter = ( new Emitter());
        const queue = ( new DecorationRequestsQueue(this._proxy, handle));
        const registration = this._decorationsService.registerDecorationsProvider({
            label,
            onDidChange: emitter.event,
            provideDecorations: async (uri, token) => {
                const data = await queue.enqueue(uri, token);
                if (!data) {
                    return undefined;
                }
                const [bubble, tooltip, letter, themeColor] = data;
                return {
                    weight: 10,
                    bubble: bubble ?? false,
                    color: themeColor?.id,
                    tooltip,
                    letter
                };
            }
        });
        this._provider.set(handle, [emitter, registration]);
    }
    $onDidChange(handle, resources) {
        const provider = this._provider.get(handle);
        if (provider) {
            const [emitter] = provider;
            emitter.fire(resources && ( resources.map(r => URI.revive(r))));
        }
    }
    $unregisterDecorationProvider(handle) {
        const provider = this._provider.get(handle);
        if (provider) {
            dispose(provider);
            this._provider.delete(handle);
        }
    }
};
MainThreadDecorations = __decorate([extHostNamedCustomer(MainContext.MainThreadDecorations), ( __param(1, IDecorationsService))], MainThreadDecorations);

export { MainThreadDecorations };
