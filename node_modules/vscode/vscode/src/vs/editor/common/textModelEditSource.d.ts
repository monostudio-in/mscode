import { BaseStringEdit } from "./core/edits/stringEdit.js";
import { StringText } from "./core/text/abstractText.js";
import { ProviderId, VersionedExtensionId } from "./languages.js";
declare const privateSymbol: unique symbol;
export declare class TextModelEditSource {
    readonly metadata: ITextModelEditSourceMetadata;
    constructor(metadata: ITextModelEditSourceMetadata, _privateCtorGuard: typeof privateSymbol);
    toString(): string;
    getType(): string;
    /**
     * Converts the metadata to a key string.
     * Only includes properties/values that have `level` many `$` prefixes or less.
    */
    toKey(level: number, filter?: {
        [TKey in ITextModelEditSourceMetadataKeys]?: boolean;
    }): string;
    get props(): Record<ITextModelEditSourceMetadataKeys, string | undefined>;
}
type TextModelEditSourceT<T> = TextModelEditSource & {
    metadataT: T;
};
export declare function isAiEdit(source: TextModelEditSource): boolean;
export declare function isUserEdit(source: TextModelEditSource): boolean;
export declare const EditSources: {
    unknown(data: {
        name?: string | null;
    }): TextModelEditSourceT<{
        readonly source: "unknown";
        readonly name: string | null | undefined;
    }>;
    rename: (oldName: string | undefined, newName: string) => TextModelEditSourceT<{
        readonly source: "rename";
        readonly $$$oldName: string | undefined;
        readonly $$$newName: string;
    }>;
    chatApplyEdits(data: {
        modelId: string | undefined;
        sessionId: string | undefined;
        requestId: string | undefined;
        languageId: string;
        mode: string | undefined;
        extensionId: VersionedExtensionId | undefined;
        codeBlockSuggestionId: EditSuggestionId | undefined;
    }): TextModelEditSourceT<{
        readonly source: "Chat.applyEdits";
        readonly $modelId: string | undefined;
        readonly $extensionId: string | undefined;
        readonly $extensionVersion: string | undefined;
        readonly $$languageId: string;
        readonly $$sessionId: string | undefined;
        readonly $$requestId: string | undefined;
        readonly $$mode: string | undefined;
        readonly $$codeBlockSuggestionId: EditSuggestionId | undefined;
    }>;
    chatUndoEdits: () => TextModelEditSourceT<{
        readonly source: "Chat.undoEdits";
    }>;
    chatReset: () => TextModelEditSourceT<{
        readonly source: "Chat.reset";
    }>;
    inlineCompletionAccept(data: {
        nes: boolean;
        requestUuid: string;
        languageId: string;
        providerId?: ProviderId;
        correlationId: string | undefined;
    }): TextModelEditSourceT<{
        readonly $$correlationId: string | undefined;
        readonly $$requestUuid: string;
        readonly $$languageId: string;
        readonly $extensionId?: undefined;
        readonly $extensionVersion?: undefined;
        readonly $providerId?: undefined;
        readonly source: "inlineCompletionAccept";
        readonly $nes: boolean;
    } | {
        readonly $$correlationId: string | undefined;
        readonly $$requestUuid: string;
        readonly $$languageId: string;
        readonly $extensionId: string | undefined;
        readonly $extensionVersion: string | undefined;
        readonly $providerId: string | undefined;
        readonly source: "inlineCompletionAccept";
        readonly $nes: boolean;
    }>;
    inlineCompletionPartialAccept(data: {
        nes: boolean;
        requestUuid: string;
        languageId: string;
        providerId?: ProviderId;
        correlationId: string | undefined;
        type: "word" | "line";
    }): TextModelEditSourceT<{
        readonly $$correlationId: string | undefined;
        readonly $$requestUuid: string;
        readonly $$languageId: string;
        readonly $extensionId?: undefined;
        readonly $extensionVersion?: undefined;
        readonly $providerId?: undefined;
        readonly source: "inlineCompletionPartialAccept";
        readonly type: "line" | "word";
        readonly $nes: boolean;
    } | {
        readonly $$correlationId: string | undefined;
        readonly $$requestUuid: string;
        readonly $$languageId: string;
        readonly $extensionId: string | undefined;
        readonly $extensionVersion: string | undefined;
        readonly $providerId: string | undefined;
        readonly source: "inlineCompletionPartialAccept";
        readonly type: "line" | "word";
        readonly $nes: boolean;
    }>;
    inlineChatApplyEdit(data: {
        modelId: string | undefined;
        requestId: string | undefined;
        sessionId: string | undefined;
        languageId: string;
        extensionId: VersionedExtensionId | undefined;
    }): TextModelEditSourceT<{
        readonly source: "inlineChat.applyEdits";
        readonly $modelId: string | undefined;
        readonly $extensionId: string | undefined;
        readonly $extensionVersion: string | undefined;
        readonly $$sessionId: string | undefined;
        readonly $$requestId: string | undefined;
        readonly $$languageId: string;
    }>;
    reloadFromDisk: () => TextModelEditSourceT<{
        readonly source: "reloadFromDisk";
    }>;
    cursor(data: {
        kind: "compositionType" | "compositionEnd" | "type" | "paste" | "cut" | "executeCommands" | "executeCommand";
        detailedSource?: string | null;
    }): TextModelEditSourceT<{
        readonly source: "cursor";
        readonly kind: "type" | "cut" | "paste" | "compositionType" | "compositionEnd" | "executeCommands" | "executeCommand";
        readonly detailedSource: string | null | undefined;
    }>;
    setValue: () => TextModelEditSourceT<{
        readonly source: "setValue";
    }>;
    eolChange: () => TextModelEditSourceT<{
        readonly source: "eolChange";
    }>;
    applyEdits: () => TextModelEditSourceT<{
        readonly source: "applyEdits";
    }>;
    snippet: () => TextModelEditSourceT<{
        readonly source: "snippet";
    }>;
    suggest: (data: {
        providerId: ProviderId | undefined;
    }) => TextModelEditSourceT<{
        readonly $extensionId?: undefined;
        readonly $extensionVersion?: undefined;
        readonly $providerId?: undefined;
        readonly source: "suggest";
    } | {
        readonly $extensionId: string | undefined;
        readonly $extensionVersion: string | undefined;
        readonly $providerId: string | undefined;
        readonly source: "suggest";
    }>;
    codeAction: (data: {
        kind: string | undefined;
        providerId: ProviderId | undefined;
    }) => TextModelEditSourceT<{
        readonly $extensionId?: undefined;
        readonly $extensionVersion?: undefined;
        readonly $providerId?: undefined;
        readonly source: "codeAction";
        readonly $kind: string | undefined;
    } | {
        readonly $extensionId: string | undefined;
        readonly $extensionVersion: string | undefined;
        readonly $providerId: string | undefined;
        readonly source: "codeAction";
        readonly $kind: string | undefined;
    }>;
};
type Values<T> = T[keyof T];
export type ITextModelEditSourceMetadata = Values<{
    [TKey in keyof typeof EditSources]: ReturnType<typeof EditSources[TKey]>["metadataT"];
}>;
type ITextModelEditSourceMetadataKeys = Values<{
    [TKey in keyof typeof EditSources]: keyof ReturnType<typeof EditSources[TKey]>["metadataT"];
}>;
export declare class EditDeltaInfo {
    readonly linesAdded: number;
    readonly linesRemoved: number;
    readonly charsAdded: number;
    readonly charsRemoved: number;
    static fromText(text: string): EditDeltaInfo;
    /** @internal */
    static fromEdit(edit: BaseStringEdit, originalString: StringText): EditDeltaInfo;
    static tryCreate(linesAdded: number | undefined, linesRemoved: number | undefined, charsAdded: number | undefined, charsRemoved: number | undefined): EditDeltaInfo | undefined;
    constructor(linesAdded: number, linesRemoved: number, charsAdded: number, charsRemoved: number);
}
/**
 * This is an opaque serializable type that represents a unique identity for an edit.
 */
export interface EditSuggestionId {
    readonly _brand: "EditIdentity";
}
export declare namespace EditSuggestionId {
    /**
     * Use AiEditTelemetryServiceImpl to create a new id!
    */
    function newId(genPrefixedUuid?: (ns: string) => string): EditSuggestionId;
}
export {};
