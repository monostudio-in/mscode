
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { WorkspaceEdit } from './extHostTypeConverters.js';
import { SerializableObjectWithBuffers } from '../../services/extensions/common/proxyIdentifier.js';

let ExtHostBulkEdits = class ExtHostBulkEdits {
    constructor(extHostRpc, extHostDocumentsAndEditors) {
        this._proxy = ( extHostRpc.getProxy(MainContext.MainThreadBulkEdits));
        this._versionInformationProvider = {
            getTextDocumentVersion: uri => extHostDocumentsAndEditors.getDocument(uri)?.version,
            getNotebookDocumentVersion: () => undefined
        };
    }
    applyWorkspaceEdit(edit, extension, metadata) {
        const dto = ( new SerializableObjectWithBuffers(WorkspaceEdit.from(edit, this._versionInformationProvider)));
        return this._proxy.$tryApplyWorkspaceEdit(dto, undefined, metadata?.isRefactoring ?? false);
    }
};
ExtHostBulkEdits = ( __decorate([( __param(0, IExtHostRpcService))], ExtHostBulkEdits));

export { ExtHostBulkEdits };
