import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { ICellExecutionStateChangedEvent, IExecutionStateChangedEvent, INotebookFailStateChangedEvent, INotebookCellExecution, INotebookExecution } from "./notebookExecutionStateService.js";
export declare const INotebookExecutionStateService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookExecutionStateService>;
export interface INotebookExecutionStateService {
    _serviceBrand: undefined;
    readonly onDidChangeExecution: Event<ICellExecutionStateChangedEvent | IExecutionStateChangedEvent>;
    readonly onDidChangeLastRunFailState: Event<INotebookFailStateChangedEvent>;
    forceCancelNotebookExecutions(notebookUri: URI): void;
    getCellExecutionsForNotebook(notebook: URI): INotebookCellExecution[];
    getCellExecutionsByHandleForNotebook(notebook: URI): Map<number, INotebookCellExecution> | undefined;
    getCellExecution(cellUri: URI): INotebookCellExecution | undefined;
    createCellExecution(notebook: URI, cellHandle: number): INotebookCellExecution;
    getExecution(notebook: URI): INotebookExecution | undefined;
    createExecution(notebook: URI): INotebookExecution;
    getLastFailedCellForNotebook(notebook: URI): number | undefined;
    getLastCompletedCellForNotebook(notebook: URI): number | undefined;
}
