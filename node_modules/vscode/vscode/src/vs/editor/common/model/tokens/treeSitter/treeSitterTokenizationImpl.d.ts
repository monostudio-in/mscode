import { Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ILanguageIdCodec, QueryCapture } from "../../../languages.js";
import { IModelContentChangedEvent, IModelTokensChangedEvent } from "../../../textModelEvents.js";
import { TokenUpdate } from "./tokenStore.js";
import { TreeSitterTree } from "./treeSitterTree.js";
import type * as TreeSitter from "../../../../../../../../external/@vscode/tree-sitter-wasm/wasm/tree-sitter.js";
import { IObservable } from "../../../../../base/common/observable.js";
import { LineRange } from "../../../core/ranges/lineRange.js";
import { LineTokens } from "../../../tokens/lineTokens.js";
import { Range } from "../../../core/range.js";
import { ITreeSitterThemeService } from "../../../services/treeSitter/treeSitterThemeService.service.js";
export declare class TreeSitterTokenizationImpl extends Disposable {
    private readonly _tree;
    private readonly _highlightingQueries;
    private readonly _languageIdCodec;
    private readonly _visibleLineRanges;
    private readonly _treeSitterThemeService;
    private readonly _tokenStore;
    private _accurateVersion;
    private _guessVersion;
    private readonly _onDidChangeTokens;
    readonly onDidChangeTokens: Event<{
        changes: IModelTokensChangedEvent;
    }>;
    private readonly _onDidCompleteBackgroundTokenization;
    readonly onDidChangeBackgroundTokenization: Event<void>;
    private _encodedLanguageId;
    private get _textModel();
    constructor(_tree: TreeSitterTree, _highlightingQueries: TreeSitter.Query, _languageIdCodec: ILanguageIdCodec, _visibleLineRanges: IObservable<readonly LineRange[]>, _treeSitterThemeService: ITreeSitterThemeService);
    handleContentChanged(e: IModelContentChangedEvent): void;
    getLineTokens(lineNumber: number): LineTokens;
    private _createEmptyTokens;
    private _emptyToken;
    private _emptyTokensForOffsetAndLength;
    hasAccurateTokensForLine(lineNumber: number): boolean;
    tokenizeLinesAt(lineNumber: number, lines: string[]): LineTokens[] | null;
    private _rangeHasTokens;
    hasTokens(accurateForRange?: Range): boolean;
    getTokens(line: number): Uint32Array;
    getTokensInRange(range: Range, rangeStartOffset: number, rangeEndOffset: number, captures?: QueryCapture[]): TokenUpdate[] | undefined;
    private _updateTokensInStore;
    private _markForRefresh;
    private _getNeedsRefresh;
    private _parseAndTokenizeViewPort;
    private _guessTokensForLinesContent;
    private _forceParseAndTokenizeContent;
    private _firstTreeUpdate;
    private _setViewPortTokens;
    /**
     * Do not await in this method, it will cause a race
     */
    private _handleTreeUpdate;
    private _updateTreeForRanges;
    private _refreshNeedsRefresh;
    private _rangeTokensAsUpdates;
    private _updateTheme;
    captureAtPosition(lineNumber: number, column: number): QueryCapture[];
    captureAtRangeTree(range: Range): QueryCapture[];
    private captureAtRange;
    private captureAtRangeWithInjections;
    /**
     * Gets the tokens for a given line.
     * Each token takes 2 elements in the array. The first element is the offset of the end of the token *in the line, not in the document*, and the second element is the metadata.
     *
     * @param lineNumber
     * @returns
     */
    tokenizeEncoded(lineNumber: number): undefined;
    tokenizeEncodedInstrumented(lineNumber: number): {
        result: Uint32Array;
        captureTime: number;
        metadataTime: number;
    } | undefined;
    private _getCaptures;
    private _tokenize;
    private _createTokensFromCaptures;
    private _getInjectionCaptures;
    private _tokenizeCapturesWithMetadata;
    private _tokenizeEncoded;
    private _endOffsetTokensToUint32Array;
}
export declare const TREESITTER_BASE_SCOPES: Record<string, string>;
