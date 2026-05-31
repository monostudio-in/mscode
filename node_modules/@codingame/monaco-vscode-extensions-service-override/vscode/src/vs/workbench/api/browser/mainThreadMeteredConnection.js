
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IMeteredConnectionService } from '@codingame/monaco-vscode-api/vscode/vs/platform/meteredConnection/common/meteredConnection.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

let MainThreadMeteredConnection = class MainThreadMeteredConnection extends Disposable {
    constructor(extHostContext, meteredConnectionService) {
        super();
        this.meteredConnectionService = meteredConnectionService;
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostMeteredConnection));
        this._proxy.$initializeIsConnectionMetered(this.meteredConnectionService.isConnectionMetered);
        this._register(
            this.meteredConnectionService.onDidChangeIsConnectionMetered(isMetered => {
                this._proxy.$onDidChangeIsConnectionMetered(isMetered);
            })
        );
    }
};
MainThreadMeteredConnection = __decorate([
    extHostNamedCustomer(MainContext.MainThreadMeteredConnection),
    ( __param(1, IMeteredConnectionService))
], MainThreadMeteredConnection);

export { MainThreadMeteredConnection };
