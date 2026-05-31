import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ICellViewModel } from "../notebookBrowser.js";
import { OutlineEntry } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/browser/viewModel/OutlineEntry";
export declare const INotebookOutlineEntryFactory: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookOutlineEntryFactory>;
export interface INotebookOutlineEntryFactory {
    readonly _serviceBrand: undefined;
    getOutlineEntries(cell: ICellViewModel, index: number): OutlineEntry[];
    cacheSymbols(cell: ICellViewModel, cancelToken: CancellationToken): Promise<void>;
}
