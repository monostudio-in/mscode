import { IOutputDto, IOutputItemDto } from "./notebookCommon.js";
import { INotebookCellExecution } from "./notebookExecutionStateService.js";
export declare enum CellExecutionUpdateType {
    Output = 1,
    OutputItems = 2,
    ExecutionState = 3
}
export interface ICellExecuteOutputEdit {
    editType: CellExecutionUpdateType.Output;
    cellHandle: number;
    append?: boolean;
    outputs: IOutputDto[];
}
export interface ICellExecuteOutputItemEdit {
    editType: CellExecutionUpdateType.OutputItems;
    append?: boolean;
    outputId: string;
    items: IOutputItemDto[];
}
export interface ICellExecutionParticipant {
    onWillExecuteCell(executions: INotebookCellExecution[]): Promise<void>;
}
