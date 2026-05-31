import { RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
export declare abstract class InlineCompletionContextKeys {
    static readonly inlineSuggestionVisible: RawContextKey<boolean>;
    static readonly inlineSuggestionAlternativeActionVisible: RawContextKey<boolean>;
    static readonly inlineSuggestionHasIndentation: RawContextKey<boolean>;
    static readonly inlineSuggestionHasIndentationLessThanTabSize: RawContextKey<boolean>;
    static readonly suppressSuggestions: RawContextKey<boolean | undefined>;
    static readonly cursorBeforeGhostText: RawContextKey<boolean | undefined>;
    static readonly cursorInIndentation: RawContextKey<boolean | undefined>;
    static readonly hasSelection: RawContextKey<boolean | undefined>;
    static readonly cursorAtInlineEdit: RawContextKey<boolean | undefined>;
    static readonly inlineEditVisible: RawContextKey<boolean>;
    static readonly tabShouldJumpToInlineEdit: RawContextKey<boolean | undefined>;
    static readonly tabShouldAcceptInlineEdit: RawContextKey<boolean | undefined>;
    static readonly inInlineEditsPreviewEditor: RawContextKey<boolean>;
}
