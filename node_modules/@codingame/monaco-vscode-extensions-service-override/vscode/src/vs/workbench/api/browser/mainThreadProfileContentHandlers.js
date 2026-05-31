
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { revive } from '@codingame/monaco-vscode-api/vscode/vs/base/common/marshalling';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IUserDataProfileImportExportService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/userDataProfile/common/userDataProfile.service';

let MainThreadProfileContentHandlers = class MainThreadProfileContentHandlers extends Disposable {
    constructor(context, userDataProfileImportExportService) {
        super();
        this.userDataProfileImportExportService = userDataProfileImportExportService;
        this.registeredHandlers = this._register(( new DisposableMap()));
        this.proxy = ( context.getProxy(ExtHostContext.ExtHostProfileContentHandlers));
    }
    async $registerProfileContentHandler(id, name, description, extensionId) {
        this.registeredHandlers.set(
            id,
            this.userDataProfileImportExportService.registerProfileContentHandler(id, {
                name,
                description,
                extensionId,
                saveProfile: async (name, content, token) => {
                    const result = await this.proxy.$saveProfile(id, name, content, token);
                    return result ? revive(result) : null;
                },
                readProfile: async (uri, token) => {
                    return this.proxy.$readProfile(id, uri, token);
                }
            })
        );
    }
    async $unregisterProfileContentHandler(id) {
        this.registeredHandlers.deleteAndDispose(id);
    }
};
MainThreadProfileContentHandlers = __decorate([
    extHostNamedCustomer(MainContext.MainThreadProfileContentHandlers),
    ( __param(1, IUserDataProfileImportExportService))
], MainThreadProfileContentHandlers);

export { MainThreadProfileContentHandlers };
