import { URI } from "../../../../base/common/uri.js";
import { NotebookData, TransientOptions, NotebookExtensionDescription } from "./notebookCommon.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { IFileStatWithMetadata, IWriteFileOptions } from "../../../../platform/files/common/files.js";
import { ITextQuery } from "../../../services/search/common/search.js";
import { NotebookPriorityInfo } from "../../search/common/search.js";
import { INotebookFileMatchNoModel } from "../../search/common/searchNotebookHelpers.js";
export interface INotebookContentProvider {
    options: TransientOptions;
    open(uri: URI, backupId: string | VSBuffer | undefined, untitledDocumentData: VSBuffer | undefined, token: CancellationToken): Promise<{
        data: NotebookData;
        transientOptions: TransientOptions;
    }>;
    backup(uri: URI, token: CancellationToken): Promise<string | VSBuffer>;
}
export interface INotebookSerializer {
    options: TransientOptions;
    dataToNotebook(data: VSBuffer): Promise<NotebookData>;
    notebookToData(data: NotebookData): Promise<VSBuffer>;
    save(uri: URI, versionId: number, options: IWriteFileOptions, token: CancellationToken): Promise<IFileStatWithMetadata>;
    searchInNotebooks(textQuery: ITextQuery, token: CancellationToken, allPriorityInfo: Map<string, NotebookPriorityInfo[]>): Promise<{
        results: INotebookFileMatchNoModel<URI>[];
        limitHit: boolean;
    }>;
}
export interface INotebookRawData {
    data: NotebookData;
    transientOptions: TransientOptions;
}
export declare class SimpleNotebookProviderInfo {
    readonly viewType: string;
    readonly serializer: INotebookSerializer;
    readonly extensionData: NotebookExtensionDescription;
    constructor(viewType: string, serializer: INotebookSerializer, extensionData: NotebookExtensionDescription);
}
