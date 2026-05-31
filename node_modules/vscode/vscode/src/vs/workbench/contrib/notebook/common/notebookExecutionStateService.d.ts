import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { NotebookCellExecutionState, NotebookExecutionState } from "./notebookCommon.js";
import { CellExecutionUpdateType, ICellExecuteOutputEdit, ICellExecuteOutputItemEdit } from "./notebookExecutionService.js";
export type ICellExecuteUpdate = ICellExecuteOutputEdit | ICellExecuteOutputItemEdit | ICellExecutionStateUpdate;
export interface ICellExecutionStateUpdate {
    editType: CellExecutionUpdateType.ExecutionState;
    executionOrder?: number;
    runStartTime?: number;
    didPause?: boolean;
    isPaused?: boolean;
}
export interface ICellErrorStackFrame {
    /**
     * The location of this stack frame. This should be provided as a URI if the
     * location of the call frame can be accessed by the editor.
     */
    readonly uri?: UriComponents;
    readonly location?: IRange;
    /**
     * The name of the stack frame, typically a method or function name.
     */
    readonly label: string;
}
export interface ICellExecutionError {
    name: string;
    message: string;
    stack: string | ICellErrorStackFrame[] | undefined;
    uri: UriComponents;
    location: IRange | undefined;
}
export interface ICellExecutionComplete {
    runEndTime?: number;
    lastRunSuccess?: boolean;
    error?: ICellExecutionError;
}
export declare enum NotebookExecutionType {
    cell = 0,
    notebook = 1
}
export interface ICellExecutionStateChangedEvent {
    type: NotebookExecutionType.cell;
    notebook: URI;
    cellHandle: number;
    changed?: INotebookCellExecution;
    affectsCell(cell: URI): boolean;
    affectsNotebook(notebook: URI): boolean;
}
export interface IExecutionStateChangedEvent {
    type: NotebookExecutionType.notebook;
    notebook: URI;
    changed?: INotebookExecution;
    affectsNotebook(notebook: URI): boolean;
}
export interface INotebookFailStateChangedEvent {
    visible: boolean;
    notebook: URI;
}
export interface IFailedCellInfo {
    cellHandle: number;
    disposable: IDisposable;
    visible: boolean;
}
export interface INotebookCellExecution {
    readonly notebook: URI;
    readonly cellHandle: number;
    readonly state: NotebookCellExecutionState;
    readonly didPause: boolean;
    readonly isPaused: boolean;
    confirm(): void;
    update(updates: ICellExecuteUpdate[]): void;
    complete(complete: ICellExecutionComplete): void;
}
export interface INotebookExecution {
    readonly notebook: URI;
    readonly state: NotebookExecutionState;
    confirm(): void;
    begin(): void;
    complete(): void;
}
