import { ILogService } from "../../../platform/log/common/log.service.js";
import { ExtHostNotebookEditorsShape, INotebookEditorPropertiesChangeData, INotebookEditorViewColumnInfo } from "./extHost.protocol.js";
import { ExtHostNotebookController } from "./extHostNotebook.js";
import type * as vscode from "vscode";
export declare class ExtHostNotebookEditors implements ExtHostNotebookEditorsShape {
    private readonly _logService;
    private readonly _notebooksAndEditors;
    private readonly _onDidChangeNotebookEditorSelection;
    private readonly _onDidChangeNotebookEditorVisibleRanges;
    readonly onDidChangeNotebookEditorSelection: import("../../../base/common/event.js").Event<vscode.NotebookEditorSelectionChangeEvent>;
    readonly onDidChangeNotebookEditorVisibleRanges: import("../../../base/common/event.js").Event<vscode.NotebookEditorVisibleRangesChangeEvent>;
    constructor(_logService: ILogService, _notebooksAndEditors: ExtHostNotebookController);
    $acceptEditorPropertiesChanged(id: string, data: INotebookEditorPropertiesChangeData): void;
    $acceptEditorViewColumns(data: INotebookEditorViewColumnInfo): void;
}
