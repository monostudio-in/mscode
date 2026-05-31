
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { INotebookRendererMessagingService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookRendererMessagingService.service';

let MainThreadNotebookRenderers = class MainThreadNotebookRenderers extends Disposable {
    constructor(extHostContext, messaging) {
        super();
        this.messaging = messaging;
        this.proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostNotebookRenderers));
        this._register(messaging.onShouldPostMessage(e => {
            this.proxy.$postRendererMessage(e.editorId, e.rendererId, e.message);
        }));
    }
    $postMessage(editorId, rendererId, message) {
        return this.messaging.receiveMessage(editorId, rendererId, message);
    }
};
MainThreadNotebookRenderers = __decorate([
    extHostNamedCustomer(MainContext.MainThreadNotebookRenderers),
    ( __param(1, INotebookRendererMessagingService))
], MainThreadNotebookRenderers);

export { MainThreadNotebookRenderers };
