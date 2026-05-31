
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IAiEmbeddingVectorService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/aiEmbeddingVector/common/aiEmbeddingVectorService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

let MainThreadAiEmbeddingVector = class MainThreadAiEmbeddingVector extends Disposable {
    constructor(context, _AiEmbeddingVectorService) {
        super();
        this._AiEmbeddingVectorService = _AiEmbeddingVectorService;
        this._registrations = this._register(( new DisposableMap()));
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostAiEmbeddingVector));
    }
    $registerAiEmbeddingVectorProvider(model, handle) {
        const provider = {
            provideAiEmbeddingVector: (strings, token) => {
                return this._proxy.$provideAiEmbeddingVector(handle, strings, token);
            }
        };
        this._registrations.set(
            handle,
            this._AiEmbeddingVectorService.registerAiEmbeddingVectorProvider(model, provider)
        );
    }
    $unregisterAiEmbeddingVectorProvider(handle) {
        this._registrations.deleteAndDispose(handle);
    }
};
MainThreadAiEmbeddingVector = __decorate([
    extHostNamedCustomer(MainContext.MainThreadAiEmbeddingVector),
    ( __param(1, IAiEmbeddingVectorService))
], MainThreadAiEmbeddingVector);

export { MainThreadAiEmbeddingVector };
