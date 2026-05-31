import { IReference } from "../../../../../../base/common/lifecycle.js";
import { IModifiedFileEntry } from "../../../../chat/common/editing/chatEditingService.js";
import { NotebookTextModel } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/common/model/notebookTextModel";
export declare const INotebookOriginalModelReferenceFactory: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookOriginalModelReferenceFactory>;
export interface INotebookOriginalModelReferenceFactory {
    readonly _serviceBrand: undefined;
    getOrCreate(fileEntry: IModifiedFileEntry, viewType: string): Promise<IReference<NotebookTextModel>>;
}
