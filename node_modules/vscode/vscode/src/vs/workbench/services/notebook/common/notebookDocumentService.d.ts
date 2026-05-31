import { URI } from "../../../../base/common/uri.js";
import { INotebookDocumentService } from "./notebookDocumentService.service.js";
export interface INotebookDocument {
    readonly uri: URI;
    getCellIndex(cellUri: URI): number | undefined;
}
export declare function parse(cell: URI): {
    notebook: URI;
    handle: number;
} | undefined;
export declare function generate(notebook: URI, handle: number): URI;
export declare function parseMetadataUri(metadata: URI): URI | undefined;
export declare function generateMetadataUri(notebook: URI): URI;
export declare function extractCellOutputDetails(uri: URI): {
    notebook: URI;
    openIn: string;
    outputId?: string;
    cellFragment?: string;
    outputIndex?: number;
    cellHandle?: number;
    cellIndex?: number;
} | undefined;
export declare class NotebookDocumentWorkbenchService implements INotebookDocumentService {
    readonly _serviceBrand: undefined;
    private readonly _documents;
    getNotebook(uri: URI): INotebookDocument | undefined;
    addNotebookDocument(document: INotebookDocument): void;
    removeNotebookDocument(document: INotebookDocument): void;
}
