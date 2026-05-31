
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { extHostCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IRemoteAuthorityResolverService } from '@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver.service';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service';

let MainThreadRemoteConnectionData = class MainThreadRemoteConnectionData extends Disposable {
    constructor(extHostContext, _environmentService, remoteAuthorityResolverService) {
        super();
        this._environmentService = _environmentService;
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostExtensionService));
        const remoteAuthority = this._environmentService.remoteAuthority;
        if (remoteAuthority) {
            this._register(remoteAuthorityResolverService.onDidChangeConnectionData(() => {
                const connectionData = remoteAuthorityResolverService.getConnectionData(remoteAuthority);
                if (connectionData) {
                    this._proxy.$updateRemoteConnectionData(connectionData);
                }
            }));
        }
    }
};
MainThreadRemoteConnectionData = __decorate([extHostCustomer, ( __param(1, IWorkbenchEnvironmentService)), ( __param(2, IRemoteAuthorityResolverService))], MainThreadRemoteConnectionData);

export { MainThreadRemoteConnectionData };
