import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { NotebookCellTextModel } from "./model/notebookCellTextModel.js";
import { INotebookTextModel } from "./notebookCommon.js";
import { ICellExecutionParticipant } from "./notebookExecutionService.js";
export declare const INotebookExecutionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookExecutionService>;
export interface INotebookExecutionService {
    _serviceBrand: undefined;
    executeNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>, contextKeyService: IContextKeyService): Promise<void>;
    cancelNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>): Promise<void>;
    cancelNotebookCellHandles(notebook: INotebookTextModel, cells: Iterable<number>): Promise<void>;
    registerExecutionParticipant(participant: ICellExecutionParticipant): IDisposable;
}
