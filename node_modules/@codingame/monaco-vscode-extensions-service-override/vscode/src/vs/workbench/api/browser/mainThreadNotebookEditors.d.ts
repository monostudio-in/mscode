import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { INotebookEditor } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookEditorService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/browser/services/notebookEditorService.service";
import { ICellRange } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookRange";
import { IEditorGroupsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorGroupsService.service";
import { IEditorService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { INotebookDocumentShowOptions, MainThreadNotebookEditorsShape, NotebookEditorRevealType } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadNotebookEditors implements MainThreadNotebookEditorsShape {
    private readonly _editorService;
    private readonly _notebookEditorService;
    private readonly _editorGroupService;
    private readonly _configurationService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _mainThreadEditors;
    private _currentViewColumnInfo?;
    constructor(extHostContext: IExtHostContext, _editorService: IEditorService, _notebookEditorService: INotebookEditorService, _editorGroupService: IEditorGroupsService, _configurationService: IConfigurationService);
    dispose(): void;
    handleEditorsAdded(editors: readonly INotebookEditor[]): void;
    handleEditorsRemoved(editorIds: readonly string[]): void;
    private _updateEditorViewColumns;
    $tryShowNotebookDocument(resource: UriComponents, viewType: string, options: INotebookDocumentShowOptions): Promise<string>;
    $tryRevealRange(id: string, range: ICellRange, revealType: NotebookEditorRevealType): Promise<void>;
    $trySetSelections(id: string, ranges: ICellRange[]): void;
}
