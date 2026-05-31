
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { CancellationToken } from '@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation';
import { Disposable, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IAiRelatedInformationService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

let MainThreadAiRelatedInformation = class MainThreadAiRelatedInformation extends Disposable {
    constructor(context, _aiRelatedInformationService) {
        super();
        this._aiRelatedInformationService = _aiRelatedInformationService;
        this._registrations = this._register(( new DisposableMap()));
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostAiRelatedInformation));
    }
    $getAiRelatedInformation(query, types) {
        return this._aiRelatedInformationService.getRelatedInformation(query, types, CancellationToken.None);
    }
    $registerAiRelatedInformationProvider(handle, type) {
        const provider = {
            provideAiRelatedInformation: (query, token) => {
                return this._proxy.$provideAiRelatedInformation(handle, query, token);
            }
        };
        this._registrations.set(
            handle,
            this._aiRelatedInformationService.registerAiRelatedInformationProvider(type, provider)
        );
    }
    $unregisterAiRelatedInformationProvider(handle) {
        this._registrations.deleteAndDispose(handle);
    }
};
MainThreadAiRelatedInformation = __decorate([
    extHostNamedCustomer(MainContext.MainThreadAiRelatedInformation),
    ( __param(1, IAiRelatedInformationService))
], MainThreadAiRelatedInformation);

export { MainThreadAiRelatedInformation };
