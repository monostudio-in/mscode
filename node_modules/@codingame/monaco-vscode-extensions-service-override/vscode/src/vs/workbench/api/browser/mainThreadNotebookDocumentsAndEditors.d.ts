import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { INotebookEditorService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/services/notebookEditorService.service";
import { INotebookService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookService.service";
import { IEditorGroupsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService.service";
import { IEditorService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service";
export declare class MainThreadNotebooksAndEditors {
    private readonly _notebookService;
    private readonly _notebookEditorService;
    private readonly _editorService;
    private readonly _editorGroupService;
    private readonly _logService;
    private readonly _proxy;
    private readonly _disposables;
    private readonly _editorListeners;
    private _currentState?;
    private readonly _mainThreadNotebooks;
    private readonly _mainThreadEditors;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _notebookService: INotebookService, _notebookEditorService: INotebookEditorService, _editorService: IEditorService, _editorGroupService: IEditorGroupsService, _logService: ILogService);
    dispose(): void;
    private _handleEditorAdd;
    private _handleEditorRemove;
    private _updateState;
    private _onDelta;
    private static _isDeltaEmpty;
    private static _asModelAddData;
    private _asEditorAddData;
}
