
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { decodeBase64 } from '@codingame/monaco-vscode-api/vscode/vs/base/common/buffer';
import { revive } from '@codingame/monaco-vscode-api/vscode/vs/base/common/marshalling';
import { ResourceTextEdit, ResourceFileEdit } from '@codingame/monaco-vscode-api/vscode/vs/editor/browser/services/bulkEditService';
import { IBulkEditService } from '@codingame/monaco-vscode-api/vscode/vs/editor/browser/services/bulkEditService.service';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { IUriIdentityService } from '@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { ResourceNotebookCellEdit } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/bulkEdit/browser/bulkCellEdits';
import { CellEditType } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookCommon';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

let MainThreadBulkEdits = class MainThreadBulkEdits {
    constructor(_extHostContext, _bulkEditService, _logService, _uriIdentService) {
        this._bulkEditService = _bulkEditService;
        this._logService = _logService;
        this._uriIdentService = _uriIdentService;
    }
    dispose() {}
    $tryApplyWorkspaceEdit(dto, undoRedoGroupId, isRefactoring) {
        const edits = reviveWorkspaceEditDto(dto.value, this._uriIdentService);
        return this._bulkEditService.apply(edits, {
            undoRedoGroupId,
            respectAutoSaveConfig: isRefactoring
        }).then(res => res.isApplied, err => {
            this._logService.warn(`IGNORING workspace edit: ${err}`);
            return false;
        });
    }
};
MainThreadBulkEdits = __decorate([extHostNamedCustomer(MainContext.MainThreadBulkEdits), ( __param(1, IBulkEditService)), ( __param(2, ILogService)), ( __param(3, IUriIdentityService))], MainThreadBulkEdits);
function reviveWorkspaceEditDto(data, uriIdentityService, resolveDataTransferFile) {
    if (!data || !data.edits) {
        return data;
    }
    const result = revive(data);
    for (const edit of result.edits) {
        if (ResourceTextEdit.is(edit)) {
            edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
        }
        if (ResourceFileEdit.is(edit)) {
            if (edit.options) {
                const inContents = edit.options?.contents;
                if (inContents) {
                    if (inContents.type === "base64") {
                        edit.options.contents = Promise.resolve(decodeBase64(inContents.value));
                    } else {
                        if (resolveDataTransferFile) {
                            edit.options.contents = resolveDataTransferFile(inContents.id);
                        } else {
                            throw ( new Error("Could not revive data transfer file"));
                        }
                    }
                }
            }
            edit.newResource = edit.newResource && uriIdentityService.asCanonicalUri(edit.newResource);
            edit.oldResource = edit.oldResource && uriIdentityService.asCanonicalUri(edit.oldResource);
        }
        if (ResourceNotebookCellEdit.is(edit)) {
            edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            const cellEdit = edit.cellEdit;
            if (cellEdit.editType === CellEditType.Replace) {
                edit.cellEdit = {
                    ...cellEdit,
                    cells: ( cellEdit.cells.map(cell => ({
                        ...cell,
                        outputs: ( cell.outputs.map(output => ({
                            ...output,
                            outputs: ( output.items.map(item => {
                                return {
                                    mime: item.mime,
                                    data: item.valueBytes
                                };
                            }))
                        })))
                    })))
                };
            }
        }
    }
    return data;
}

export { MainThreadBulkEdits, reviveWorkspaceEditDto };
