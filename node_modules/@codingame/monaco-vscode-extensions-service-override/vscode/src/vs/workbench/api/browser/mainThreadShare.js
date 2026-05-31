
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { CancellationToken } from '@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation';
import { dispose } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IShareService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/share/common/share.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

let MainThreadShare = class MainThreadShare {
    constructor(extHostContext, shareService) {
        this.shareService = shareService;
        this.providers = ( new Map());
        this.providerDisposables = ( new Map());
        this.proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostShare));
    }
    $registerShareProvider(handle, selector, id, label, priority) {
        const provider = {
            id,
            label,
            selector,
            priority,
            provideShare: async item => {
                const result = await this.proxy.$provideShare(handle, item, CancellationToken.None);
                return typeof result === "string" ? result : URI.revive(result);
            }
        };
        this.providers.set(handle, provider);
        const disposable = this.shareService.registerShareProvider(provider);
        this.providerDisposables.set(handle, disposable);
    }
    $unregisterShareProvider(handle) {
        this.providers.delete(handle);
        this.providerDisposables.delete(handle);
    }
    dispose() {
        this.providers.clear();
        dispose(( this.providerDisposables.values()));
        this.providerDisposables.clear();
    }
};
MainThreadShare = __decorate([extHostNamedCustomer(MainContext.MainThreadShare), ( __param(1, IShareService))], MainThreadShare);

export { MainThreadShare };
