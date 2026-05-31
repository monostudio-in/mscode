import { IViewModel } from "../../../common/viewModel.js";
import { Range } from "../../../common/core/range.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { VSDataTransfer } from "../../../../base/common/dataTransfer.js";
export declare function generateDataToCopyAndStoreInMemory(viewModel: IViewModel, id: string | undefined, isFirefox: boolean): {
    dataToCopy: ClipboardDataToCopy;
    metadata: ClipboardStoredMetadata;
};
/**
 * Every time we write to the clipboard, we record a bit of extra metadata here.
 * Every time we read from the cipboard, if the text matches our last written text,
 * we can fetch the previous metadata.
 */
export declare class InMemoryClipboardMetadataManager {
    static readonly INSTANCE: InMemoryClipboardMetadataManager;
    private _lastState;
    constructor();
    set(lastCopiedValue: string, data: ClipboardStoredMetadata): void;
    get(pastedText: string): ClipboardStoredMetadata | null;
}
export interface ClipboardDataToCopy {
    isFromEmptySelection: boolean;
    sourceRanges: Range[];
    multicursorText: string[] | null | undefined;
    text: string;
    html: string | null | undefined;
    mode: string | null;
}
export interface ClipboardStoredMetadata {
    version: 1;
    id: string | undefined;
    isFromEmptySelection: boolean | undefined;
    multicursorText: string[] | null | undefined;
    mode: string | null;
}
export declare const CopyOptions: {
    forceCopyWithSyntaxHighlighting: boolean;
    electronBugWorkaroundCopyEventHasFired: boolean;
};
/**
 * Readable clipboard data for paste operations.
 */
export interface IReadableClipboardData {
    /**
     * All MIME types present in the clipboard.
     */
    types: string[];
    /**
     * Files from the clipboard (for paste operations).
     */
    readonly files: readonly File[];
    /**
     * Get data for a specific MIME type.
     */
    getData(type: string): string;
}
/**
 * Writable clipboard data for copy/cut operations.
 */
export interface IWritableClipboardData {
    /**
     * Set data for a specific MIME type.
     */
    setData(type: string, value: string): void;
}
/**
 * Event data for clipboard copy/cut events.
 */
export interface IClipboardCopyEvent {
    /**
     * Whether this is a cut operation.
     */
    readonly isCut: boolean;
    /**
     * The clipboard data to write to.
     */
    readonly clipboardData: IWritableClipboardData;
    /**
     * The data to be copied to the clipboard.
     */
    readonly dataToCopy: ClipboardDataToCopy;
    /**
     * Ensure that the clipboard gets the editor data.
     */
    ensureClipboardGetsEditorData(): void;
    /**
     * Signal that the event has been handled and default processing should be skipped.
     */
    setHandled(): void;
    /**
     * Whether the event has been marked as handled.
     */
    readonly isHandled: boolean;
}
/**
 * Event data for clipboard paste events.
 */
export interface IClipboardPasteEvent {
    /**
     * The clipboard data being pasted.
     */
    readonly clipboardData: IReadableClipboardData;
    /**
     * The metadata stored alongside the clipboard data, if any.
     */
    readonly metadata: ClipboardStoredMetadata | null;
    /**
     * The text content being pasted.
     */
    readonly text: string;
    /**
     * The underlying DOM event, if available.
     * @deprecated Use clipboardData instead. This is provided for backward compatibility.
     */
    readonly browserEvent: ClipboardEvent | undefined;
    toExternalVSDataTransfer(): VSDataTransfer | undefined;
    /**
     * Signal that the event has been handled and default processing should be skipped.
     */
    setHandled(): void;
    /**
     * Whether the event has been marked as handled.
     */
    readonly isHandled: boolean;
}
/**
 * Creates an IClipboardCopyEvent from a DOM ClipboardEvent.
 */
export declare function createClipboardCopyEvent(e: ClipboardEvent, isCut: boolean, context: ViewContext, logService: ILogService, isFirefox: boolean): IClipboardCopyEvent;
/**
 * Creates an IClipboardPasteEvent from a DOM ClipboardEvent.
 */
export declare function createClipboardPasteEvent(e: ClipboardEvent): IClipboardPasteEvent;
export declare function createReadableClipboardData(dataTransfer: DataTransfer | undefined | null): IReadableClipboardData;
export declare function createWritableClipboardData(dataTransfer: DataTransfer | undefined | null): IWritableClipboardData;
