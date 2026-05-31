import { VSBuffer } from "@codingame/monaco-vscode-api/vscode/vs/base/common/buffer";
import { IBulkEditService } from "@codingame/monaco-vscode-api/vscode/vs/editor/browser/services/bulkEditService.service";
import { WorkspaceEdit } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IUriIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service";
import { IWorkspaceEditDto, MainThreadBulkEditsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { SerializableObjectWithBuffers } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/proxyIdentifier";
export declare class MainThreadBulkEdits implements MainThreadBulkEditsShape {
    private readonly _bulkEditService;
    private readonly _logService;
    private readonly _uriIdentService;
    constructor(_extHostContext: IExtHostContext, _bulkEditService: IBulkEditService, _logService: ILogService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    $tryApplyWorkspaceEdit(dto: SerializableObjectWithBuffers<IWorkspaceEditDto>, undoRedoGroupId?: number, isRefactoring?: boolean): Promise<boolean>;
}
export declare function reviveWorkspaceEditDto(data: IWorkspaceEditDto, uriIdentityService: IUriIdentityService, resolveDataTransferFile?: (id: string) => Promise<VSBuffer>): WorkspaceEdit;
export declare function reviveWorkspaceEditDto(data: IWorkspaceEditDto | undefined, uriIdentityService: IUriIdentityService, resolveDataTransferFile?: (id: string) => Promise<VSBuffer>): WorkspaceEdit | undefined;
