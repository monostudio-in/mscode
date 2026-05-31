
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable, DisposableMap } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { TextEdit } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/languages';
import { ICodeMapperService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/common/editing/chatCodeMapperService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { NotebookDto } from './mainThreadNotebookDto.js';

var MainThreadChatCodemapper_1;
let MainThreadChatCodemapper = class MainThreadChatCodemapper extends Disposable {
    static {
        MainThreadChatCodemapper_1 = this;
    }
    static {
        this._requestHandlePool = 0;
    }
    constructor(extHostContext, codeMapperService) {
        super();
        this.codeMapperService = codeMapperService;
        this.providers = this._register(( new DisposableMap()));
        this._responseMap = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostCodeMapper));
    }
    $registerCodeMapperProvider(handle, displayName) {
        const impl = {
            displayName,
            mapCode: async (uiRequest, response, token) => {
                const requestId = String(MainThreadChatCodemapper_1._requestHandlePool++);
                this._responseMap.set(requestId, response);
                const extHostRequest = {
                    requestId,
                    codeBlocks: uiRequest.codeBlocks,
                    chatRequestId: uiRequest.chatRequestId,
                    chatRequestModel: uiRequest.chatRequestModel,
                    chatSessionResource: uiRequest.chatSessionResource,
                    location: uiRequest.location
                };
                try {
                    return await this._proxy.$mapCode(handle, extHostRequest, token).then(result => result ?? undefined);
                } finally {
                    this._responseMap.delete(requestId);
                }
            }
        };
        const disposable = this.codeMapperService.registerCodeMapperProvider(handle, impl);
        this.providers.set(handle, disposable);
    }
    $unregisterCodeMapperProvider(handle) {
        this.providers.deleteAndDispose(handle);
    }
    $handleProgress(requestId, data) {
        const response = this._responseMap.get(requestId);
        if (response) {
            const edits = data.edits;
            const resource = URI.revive(data.uri);
            if (!edits.length) {
                response.textEdit(resource, []);
            } else if (edits.every(TextEdit.isTextEdit)) {
                response.textEdit(resource, edits);
            } else {
                response.notebookEdit(resource, ( edits.map(NotebookDto.fromCellEditOperationDto)));
            }
        }
        return Promise.resolve();
    }
};
MainThreadChatCodemapper = MainThreadChatCodemapper_1 = __decorate([extHostNamedCustomer(MainContext.MainThreadCodeMapper), ( __param(1, ICodeMapperService))], MainThreadChatCodemapper);

export { MainThreadChatCodemapper };
