
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { PLAINTEXT_LANGUAGE_ID } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/modesRegistry';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IInteractiveDocumentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/interactive/browser/interactiveDocumentService.service';

let MainThreadInteractive = class MainThreadInteractive {
    constructor(extHostContext, interactiveDocumentService) {
        this._disposables = ( new DisposableStore());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostInteractive));
        this._disposables.add(interactiveDocumentService.onWillAddInteractiveDocument(e => {
            this._proxy.$willAddInteractiveDocument(e.inputUri, "\n", PLAINTEXT_LANGUAGE_ID, e.notebookUri);
        }));
        this._disposables.add(interactiveDocumentService.onWillRemoveInteractiveDocument(e => {
            this._proxy.$willRemoveInteractiveDocument(e.inputUri, e.notebookUri);
        }));
    }
    dispose() {
        this._disposables.dispose();
    }
};
MainThreadInteractive = __decorate([extHostNamedCustomer(MainContext.MainThreadInteractive), ( __param(1, IInteractiveDocumentService))], MainThreadInteractive);

export { MainThreadInteractive };
