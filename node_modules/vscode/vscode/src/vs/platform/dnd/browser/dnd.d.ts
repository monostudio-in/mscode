import { DragMouseEvent } from "../../../base/browser/mouseEvent.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IBaseTextResourceEditorInput, ITextEditorSelection } from "../../editor/common/editor.js";
import { ServicesAccessor } from "../../instantiation/common/instantiation.js";
import { IMarker } from "../../markers/common/markers.js";
export declare const CodeDataTransfers: {
    EDITORS: string;
    FILES: string;
    SYMBOLS: string;
    MARKERS: string;
    NOTEBOOK_CELL_OUTPUT: string;
    SCM_HISTORY_ITEM: string;
};
export interface IDraggedResourceEditorInput extends IBaseTextResourceEditorInput {
    resource: URI | undefined;
    /**
     * A hint that the source of the dragged editor input
     * might not be the application but some external tool.
     */
    isExternal?: boolean;
    /**
     * Whether we probe for the dropped editor to be a workspace
     * (i.e. code-workspace file or even a folder), allowing to
     * open it as workspace instead of opening as editor.
     */
    allowWorkspaceOpen?: boolean;
}
export declare function extractEditorsDropData(e: DragEvent): Array<IDraggedResourceEditorInput>;
export declare function extractEditorsAndFilesDropData(accessor: ServicesAccessor, e: DragEvent): Promise<Array<IDraggedResourceEditorInput>>;
export declare function createDraggedEditorInputFromRawResourcesData(rawResourcesData: string | undefined): IDraggedResourceEditorInput[];
interface IFileTransferData {
    resource: URI;
    isDirectory?: boolean;
    contents?: VSBuffer;
}
export declare function extractFileListData(accessor: ServicesAccessor, files: FileList): Promise<IFileTransferData[]>;
export declare function containsDragType(event: DragEvent, ...dragTypesToFind: string[]): boolean;
export interface IResourceStat {
    readonly resource: URI;
    readonly isDirectory?: boolean;
    readonly selection?: ITextEditorSelection;
}
export interface IResourceDropHandler {
    /**
     * Handle a dropped resource.
     * @param resource The resource that was dropped
     * @param accessor Service accessor to get services
     * @returns true if handled, false otherwise
     */
    handleDrop(resource: URI, accessor: ServicesAccessor): Promise<boolean>;
}
export interface IDragAndDropContributionRegistry {
    /**
     * Registers a drag and drop contribution.
     */
    register(contribution: IDragAndDropContribution): void;
    /**
     * Returns all registered drag and drop contributions.
     */
    getAll(): IterableIterator<IDragAndDropContribution>;
    /**
     * Register a handler for dropped resources.
     * @returns A disposable that unregisters the handler when disposed
     */
    registerDropHandler(handler: IResourceDropHandler): IDisposable;
    /**
     * Handle a dropped resource using registered handlers.
     * @param resource The resource that was dropped
     * @param accessor Service accessor to get services
     * @returns true if any handler handled the resource, false otherwise
     */
    handleResourceDrop(resource: URI, accessor: ServicesAccessor): Promise<boolean>;
}
interface IDragAndDropContribution {
    readonly dataFormatKey: string;
    getEditorInputs(data: string): IDraggedResourceEditorInput[];
    setData(resources: IResourceStat[], event: DragMouseEvent | DragEvent): void;
}
export declare const Extensions: {
    DragAndDropContribution: string;
};
/**
 * A singleton to store transfer data during drag & drop operations that are only valid within the application.
 */
export declare class LocalSelectionTransfer<T> {
    private static readonly INSTANCE;
    private data?;
    private proto?;
    private constructor();
    static getInstance<T>(): LocalSelectionTransfer<T>;
    hasData(proto: T): boolean;
    clearData(proto: T): void;
    getData(proto: T): T[] | undefined;
    setData(data: T[], proto: T): void;
}
export interface DocumentSymbolTransferData {
    name: string;
    fsPath: string;
    range: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
    };
    kind: number;
}
export interface NotebookCellOutputTransferData {
    outputId: string;
}
export declare function extractSymbolDropData(e: DragEvent): DocumentSymbolTransferData[];
export declare function fillInSymbolsDragData(symbolsData: readonly DocumentSymbolTransferData[], e: DragEvent): void;
export type MarkerTransferData = IMarker | {
    uri: UriComponents;
};
export declare function extractMarkerDropData(e: DragEvent): MarkerTransferData[] | undefined;
export declare function fillInMarkersDragData(markerData: MarkerTransferData[], e: DragEvent): void;
export declare function extractNotebookCellOutputDropData(e: DragEvent): NotebookCellOutputTransferData | undefined;
/**
 * A helper to get access to Electrons `webUtils.getPathForFile` function
 * in a safe way without crashing the application when running in the web.
 */
export declare function getPathForFile(file: File): string | undefined;
export {};
