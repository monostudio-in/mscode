import { IReference } from "../../../../../base/common/lifecycle.js";
import { INotebookEditor } from "../notebookBrowser.js";
import { NotebookCellOutlineDataSource } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSource";
export declare const INotebookCellOutlineDataSourceFactory: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookCellOutlineDataSourceFactory>;
export interface INotebookCellOutlineDataSourceFactory {
    getOrCreate(editor: INotebookEditor): IReference<NotebookCellOutlineDataSource>;
}
