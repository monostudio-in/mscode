import { Event } from "../../../../base/common/event.js";
import { IReference } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { NotebookTextModel } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { IResolvedNotebookEditorModel, NotebookEditorModelCreationOptions } from "./notebookCommon.js";
import { INotebookConflictEvent, IUntitledNotebookResource } from "./notebookEditorModelResolverService.js";
export declare const INotebookEditorModelResolverService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookEditorModelResolverService>;
export interface INotebookEditorModelResolverService {
    readonly _serviceBrand: undefined;
    readonly onDidSaveNotebook: Event<URI>;
    readonly onDidChangeDirty: Event<IResolvedNotebookEditorModel>;
    readonly onWillFailWithConflict: Event<INotebookConflictEvent>;
    isDirty(resource: URI): boolean;
    createUntitledNotebookTextModel(viewType: string): Promise<NotebookTextModel>;
    resolve(resource: URI, viewType?: string, creationOptions?: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
    resolve(resource: IUntitledNotebookResource, viewType: string, creationOtions?: NotebookEditorModelCreationOptions): Promise<IReference<IResolvedNotebookEditorModel>>;
}
