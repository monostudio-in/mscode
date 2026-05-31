import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICellViewModel } from "./notebookBrowser.js";
import { NotebookEditorWidget } from "./notebookEditorWidget.js";
import { INotebookCellList } from "./view/notebookRenderingCommon.js";
import { INotebookLoggingService } from "../common/notebookLoggingService.service.js";
export declare class NotebookCellLayoutManager extends Disposable {
    private notebookWidget;
    private _list;
    private loggingService;
    private _pendingLayouts;
    private _layoutDisposables;
    private readonly _layoutStack;
    private _isDisposed;
    constructor(notebookWidget: NotebookEditorWidget, _list: INotebookCellList, loggingService: INotebookLoggingService);
    private checkStackDepth;
    layoutNotebookCell(cell: ICellViewModel, height: number): Promise<void>;
    dispose(): void;
}
