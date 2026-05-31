import { ICellViewModel, INotebookEditorDelegate } from "../../notebookBrowser.js";
import { CellContentPart } from "../cellPart.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.service.js";
import { CellViewModelStateChangeEvent } from "../../notebookViewEvents.js";
export declare class CellExecutionPart extends CellContentPart {
    private readonly _notebookEditor;
    private readonly _executionOrderLabel;
    private readonly _notebookExecutionStateService;
    private readonly kernelDisposables;
    private readonly _executionOrderContent;
    constructor(_notebookEditor: INotebookEditorDelegate, _executionOrderLabel: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    didRenderCell(element: ICellViewModel): void;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    private updateExecutionOrder;
    updateInternalLayoutNow(element: ICellViewModel): void;
    private _updatePosition;
}
