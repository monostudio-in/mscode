import { URI } from "../../../../base/common/uri.js";
import { INotebookDocument } from "./notebookDocumentService.js";
export declare const INotebookDocumentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookDocumentService>;
export interface INotebookDocumentService {
    readonly _serviceBrand: undefined;
    getNotebook(uri: URI): INotebookDocument | undefined;
    addNotebookDocument(document: INotebookDocument): void;
    removeNotebookDocument(document: INotebookDocument): void;
}
