
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { DisposableStore, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { registerSingleton, InstantiationType } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/extensions';
import { createDecorator } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

const IEmbeddingsService = ( createDecorator("embeddingsService"));
class EmbeddingsService {
    constructor() {
        this._onDidChange = ( new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.providers = ( new Map());
    }
    get allProviders() {
        return ( this.providers.keys());
    }
    registerProvider(id, provider) {
        this.providers.set(id, provider);
        this._onDidChange.fire();
        return {
            dispose: () => {
                this.providers.delete(id);
                this._onDidChange.fire();
            }
        };
    }
    computeEmbeddings(id, input, token) {
        const provider = this.providers.get(id);
        if (provider) {
            return provider.provideEmbeddings(input, token);
        } else {
            return Promise.reject(( new Error(`No embeddings provider registered with id: ${id}`)));
        }
    }
}
registerSingleton(IEmbeddingsService, EmbeddingsService, InstantiationType.Delayed);
let MainThreadEmbeddings = class MainThreadEmbeddings {
    constructor(context, embeddingsService) {
        this.embeddingsService = embeddingsService;
        this._store = ( new DisposableStore());
        this._providers = this._store.add(( new DisposableMap()));
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostEmbeddings));
        this._store.add(embeddingsService.onDidChange((() => {
            this._proxy.$acceptEmbeddingModels(Array.from(embeddingsService.allProviders));
        })));
    }
    dispose() {
        this._store.dispose();
    }
    $registerEmbeddingProvider(handle, identifier) {
        const registration = this.embeddingsService.registerProvider(identifier, {
            provideEmbeddings: (input, token) => {
                return this._proxy.$provideEmbeddings(handle, input, token);
            }
        });
        this._providers.set(handle, registration);
    }
    $unregisterEmbeddingProvider(handle) {
        this._providers.deleteAndDispose(handle);
    }
    $computeEmbeddings(embeddingsModel, input, token) {
        return this.embeddingsService.computeEmbeddings(embeddingsModel, input, token);
    }
};
MainThreadEmbeddings = __decorate([extHostNamedCustomer(MainContext.MainThreadEmbeddings), ( __param(1, IEmbeddingsService))], MainThreadEmbeddings);

export { MainThreadEmbeddings };
