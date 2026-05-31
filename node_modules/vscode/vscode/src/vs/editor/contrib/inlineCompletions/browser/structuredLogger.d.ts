import { Disposable } from "../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IDataChannelService } from "../../../../platform/dataChannel/common/dataChannel.service.js";
export interface IRecordableLogEntry {
    sourceId: string;
    time: number;
}
export interface IRecordableEditorLogEntry extends IRecordableLogEntry {
    modelUri: URI;
    modelVersion: number;
}
export type EditorLogEntryData = IDocumentEventDataSetChangeReason | IDocumentEventFetchStart;
export type LogEntryData = IEventFetchEnd;
export interface IDocumentEventDataSetChangeReason {
    sourceId: "TextModel.setChangeReason";
    source: "inlineSuggestion.accept" | "snippet" | string;
}
interface IDocumentEventFetchStart {
    sourceId: "InlineCompletions.fetch";
    kind: "start";
    requestId: number;
}
export interface IEventFetchEnd {
    sourceId: "InlineCompletions.fetch";
    kind: "end";
    requestId: number;
    error: string | undefined;
    result: IFetchResult[];
}
interface IFetchResult {
    range: string;
    text: string;
    isInlineEdit: boolean;
    source: string;
}
/**
 * The sourceLabel must not contain '@'!
*/
export declare function formatRecordableLogEntry<T extends IRecordableLogEntry>(entry: T): string;
export declare class StructuredLogger<T extends IRecordableLogEntry> extends Disposable {
    private readonly _key;
    private readonly _contextKeyService;
    private readonly _dataChannelService;
    static cast<T extends IRecordableLogEntry>(): typeof StructuredLogger<T>;
    readonly isEnabled: IObservable<boolean>;
    private readonly _isEnabledContextKeyValue;
    constructor(_key: string, _contextKeyService: IContextKeyService, _dataChannelService: IDataChannelService);
    log(data: T): boolean;
}
export {};
