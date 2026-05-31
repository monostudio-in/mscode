import { IScrollPosition, Scrollable } from "../../base/common/scrollable.js";
import { ISimpleModel } from "./viewModel/screenReaderSimpleModel.js";
import { ICoordinatesConverter } from "./coordinatesConverter.js";
import { IPosition, Position } from "./core/position.js";
import { Range } from "./core/range.js";
import { CursorConfiguration, CursorState, EditOperationType, IColumnSelectData, ICursorSimpleModel, PartialCursorState } from "./cursorCommon.js";
import { CursorChangeReason } from "./cursorEvents.js";
import { INewScrollPosition, ScrollType } from "./editorCommon.js";
import { EditorTheme } from "./editorTheme.js";
import { EndOfLinePreference, IGlyphMarginLanesModel, IModelDecorationOptions, ITextModel, TextDirection } from "./model.js";
import { ILineBreaksComputer, ILineBreaksComputerContext, InjectedText } from "./modelLineProjectionData.js";
import { InternalModelContentChangeEvent, ModelInjectedTextChangedEvent } from "./textModelEvents.js";
import { BracketGuideOptions, IActiveIndentGuideInfo, IndentGuide } from "./textModelGuides.js";
import { IViewLineTokens } from "./tokens/lineTokens.js";
import { ViewEventHandler } from "./viewEventHandler.js";
import { VerticalRevealType } from "./viewEvents.js";
import { InlineDecoration } from "./viewModel/inlineDecorations.js";
import { EditorOption, FindComputedEditorOptionValueById } from "./config/editorOptions.js";
export interface IViewModel extends ICursorSimpleModel, ISimpleModel {
    readonly model: ITextModel;
    readonly coordinatesConverter: ICoordinatesConverter;
    readonly viewLayout: IViewLayout;
    readonly cursorConfig: CursorConfiguration;
    readonly glyphLanes: IGlyphMarginLanesModel;
    addViewEventHandler(eventHandler: ViewEventHandler): void;
    removeViewEventHandler(eventHandler: ViewEventHandler): void;
    getEditorOption<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
    /**
     * Gives a hint that a lot of requests are about to come in for these line numbers.
     */
    setViewport(startLineNumber: number, endLineNumber: number, centeredLineNumber: number): void;
    visibleLinesStabilized(): void;
    setHasFocus(hasFocus: boolean): void;
    setHasWidgetFocus(hasWidgetFocus: boolean): void;
    onCompositionStart(): void;
    onCompositionEnd(): void;
    getFontSizeAtPosition(position: IPosition): string | null;
    getMinimapDecorationsInRange(range: Range): ViewModelDecoration[];
    getDecorationsInViewport(visibleRange: Range): ViewModelDecoration[];
    getTextDirection(lineNumber: number): TextDirection;
    getViewportViewLineRenderingData(visibleRange: Range, lineNumber: number): ViewLineRenderingData;
    getViewLineRenderingData(lineNumber: number): ViewLineRenderingData;
    getViewLineData(lineNumber: number): ViewLineData;
    getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): MinimapLinesRenderingData;
    getCompletelyVisibleViewRange(): Range;
    getCompletelyVisibleViewRangeAtScrollTop(scrollTop: number): Range;
    getViewRangeWithCursorPadding(viewRange: Range): Range;
    getHiddenAreas(): Range[];
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
    getBracketGuidesInRangeByLine(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    getAllOverviewRulerDecorations(theme: EditorTheme): OverviewRulerDecorationsGroup[];
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    modifyPosition(position: Position, offset: number): Position;
    getInjectedTextAt(viewPosition: Position): InjectedText | null;
    deduceModelPositionRelativeToViewPosition(viewAnchorPosition: Position, deltaOffset: number, lineFeedCnt: number): Position;
    getPlainTextToCopy(modelRanges: Range[], emptySelectionClipboard: boolean, forceCRLF: boolean): {
        sourceRanges: Range[];
        sourceText: string | string[];
    };
    getRichTextToCopy(modelRanges: Range[], emptySelectionClipboard: boolean): {
        html: string;
        mode: string;
    } | null;
    onDidChangeContentOrInjectedText(e: InternalModelContentChangeEvent | ModelInjectedTextChangedEvent): void;
    emitContentChangeEvent(e: InternalModelContentChangeEvent | ModelInjectedTextChangedEvent): void;
    createLineBreaksComputer(context?: ILineBreaksComputerContext): ILineBreaksComputer;
    getPrimaryCursorState(): CursorState;
    getLastAddedCursorIndex(): number;
    getCursorStates(): CursorState[];
    setCursorStates(source: string | null | undefined, reason: CursorChangeReason, states: PartialCursorState[] | null): boolean;
    getCursorColumnSelectData(): IColumnSelectData;
    getCursorAutoClosedCharacters(): Range[];
    setCursorColumnSelectData(columnSelectData: IColumnSelectData): void;
    getPrevEditOperationType(): EditOperationType;
    setPrevEditOperationType(type: EditOperationType): void;
    revealAllCursors(source: string | null | undefined, revealHorizontal: boolean, minimalReveal?: boolean): void;
    revealPrimaryCursor(source: string | null | undefined, revealHorizontal: boolean, minimalReveal?: boolean): void;
    revealTopMostCursor(source: string | null | undefined): void;
    revealBottomMostCursor(source: string | null | undefined): void;
    revealRange(source: string | null | undefined, revealHorizontal: boolean, viewRange: Range, verticalType: VerticalRevealType, scrollType: ScrollType): void;
    changeWhitespace(callback: (accessor: IWhitespaceChangeAccessor) => void): void;
    batchEvents(callback: () => void): void;
}
export interface IViewLayout {
    getScrollable(): Scrollable;
    getScrollWidth(): number;
    getScrollHeight(): number;
    getCurrentScrollLeft(): number;
    getCurrentScrollTop(): number;
    getCurrentViewport(): Viewport;
    getFutureViewport(): Viewport;
    setScrollPosition(position: INewScrollPosition, type: ScrollType): void;
    deltaScrollNow(deltaScrollLeft: number, deltaScrollTop: number): void;
    validateScrollPosition(scrollPosition: INewScrollPosition): IScrollPosition;
    setMaxLineWidth(maxLineWidth: number): void;
    setOverlayWidgetsMinWidth(overlayWidgetsMinWidth: number): void;
    getLinesViewportData(): IPartialViewLinesViewportData;
    getLinesViewportDataAtScrollTop(scrollTop: number): IPartialViewLinesViewportData;
    getWhitespaces(): IEditorWhitespace[];
    isAfterLines(verticalOffset: number): boolean;
    isInTopPadding(verticalOffset: number): boolean;
    isInBottomPadding(verticalOffset: number): boolean;
    getLineNumberAtVerticalOffset(verticalOffset: number): number;
    getVerticalOffsetForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getVerticalOffsetAfterLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getLineHeightForLineNumber(lineNumber: number): number;
    getWhitespaceAtVerticalOffset(verticalOffset: number): IViewWhitespaceViewportData | null;
    /**
     * Get the layout information for whitespaces currently in the viewport
     */
    getWhitespaceViewportData(): IViewWhitespaceViewportData[];
}
export interface IEditorWhitespace {
    readonly id: string;
    readonly afterLineNumber: number;
    readonly height: number;
}
/**
 * An accessor that allows for whitespace to be added, removed or changed in bulk.
 */
export interface IWhitespaceChangeAccessor {
    insertWhitespace(afterLineNumber: number, ordinal: number, heightInPx: number, minWidth: number): string;
    changeOneWhitespace(id: string, newAfterLineNumber: number, newHeight: number): void;
    removeWhitespace(id: string): void;
}
export interface ILineHeightChangeAccessor {
    insertOrChangeCustomLineHeight(decorationId: string, startLineNumber: number, endLineNumber: number, lineHeight: number): void;
    removeCustomLineHeight(decorationId: string): void;
}
export interface IPartialViewLinesViewportData {
    /**
     * Value to be substracted from `scrollTop` (in order to vertical offset numbers < 1MM)
     */
    readonly bigNumbersDelta: number;
    /**
     * The first (partially) visible line number.
     */
    readonly startLineNumber: number;
    /**
     * The last (partially) visible line number.
     */
    readonly endLineNumber: number;
    /**
     * relativeVerticalOffset[i] is the `top` position for line at `i` + `startLineNumber`.
     */
    readonly relativeVerticalOffset: number[];
    /**
     * The centered line in the viewport.
     */
    readonly centeredLineNumber: number;
    /**
     * The first completely visible line number.
     */
    readonly completelyVisibleStartLineNumber: number;
    /**
     * The last completely visible line number.
     */
    readonly completelyVisibleEndLineNumber: number;
    /**
     * The height of a line.
     */
    readonly lineHeight: number;
}
export interface IViewWhitespaceViewportData {
    readonly id: string;
    readonly afterLineNumber: number;
    readonly verticalOffset: number;
    readonly height: number;
}
export declare class Viewport {
    readonly _viewportBrand: void;
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
    constructor(top: number, left: number, width: number, height: number);
}
export declare class MinimapLinesRenderingData {
    readonly tabSize: number;
    readonly data: Array<ViewLineData | null>;
    constructor(tabSize: number, data: Array<ViewLineData | null>);
}
export declare class ViewLineData {
    _viewLineDataBrand: void;
    /**
     * The content at this view line.
     */
    readonly content: string;
    /**
     * Does this line continue with a wrapped line?
     */
    readonly continuesWithWrappedLine: boolean;
    /**
     * The minimum allowed column at this view line.
     */
    readonly minColumn: number;
    /**
     * The maximum allowed column at this view line.
     */
    readonly maxColumn: number;
    /**
     * The visible column at the start of the line (after the fauxIndent).
     */
    readonly startVisibleColumn: number;
    /**
     * The tokens at this view line.
     */
    readonly tokens: IViewLineTokens;
    /**
     * Additional inline decorations for this line.
    */
    readonly inlineDecorations: readonly InlineDecoration[] | null;
    constructor(content: string, continuesWithWrappedLine: boolean, minColumn: number, maxColumn: number, startVisibleColumn: number, tokens: IViewLineTokens, inlineDecorations: readonly InlineDecoration[] | null);
}
export declare class ViewLineRenderingData {
    /**
     * The minimum allowed column at this view line.
     */
    readonly minColumn: number;
    /**
     * The maximum allowed column at this view line.
     */
    readonly maxColumn: number;
    /**
     * The content at this view line.
     */
    readonly content: string;
    /**
     * Does this line continue with a wrapped line?
     */
    readonly continuesWithWrappedLine: boolean;
    /**
     * Describes if `content` contains RTL characters.
     */
    readonly containsRTL: boolean;
    /**
     * Describes if `content` contains non basic ASCII chars.
     */
    readonly isBasicASCII: boolean;
    /**
     * The tokens at this view line.
     */
    readonly tokens: IViewLineTokens;
    /**
     * Inline decorations at this view line.
     */
    readonly inlineDecorations: InlineDecoration[];
    /**
     * The tab size for this view model.
     */
    readonly tabSize: number;
    /**
     * The visible column at the start of the line (after the fauxIndent)
     */
    readonly startVisibleColumn: number;
    /**
     * The direction to use for rendering the line.
     */
    readonly textDirection: TextDirection;
    /**
     * Whether the line has variable fonts
     */
    readonly hasVariableFonts: boolean;
    constructor(minColumn: number, maxColumn: number, content: string, continuesWithWrappedLine: boolean, mightContainRTL: boolean, mightContainNonBasicASCII: boolean, tokens: IViewLineTokens, inlineDecorations: InlineDecoration[], tabSize: number, startVisibleColumn: number, textDirection: TextDirection, hasVariableFonts: boolean);
    static isBasicASCII(lineContent: string, mightContainNonBasicASCII: boolean): boolean;
    static containsRTL(lineContent: string, isBasicASCII: boolean, mightContainRTL: boolean): boolean;
}
export declare class ViewModelDecoration {
    _viewModelDecorationBrand: void;
    readonly range: Range;
    readonly options: IModelDecorationOptions;
    constructor(range: Range, options: IModelDecorationOptions);
}
export declare class OverviewRulerDecorationsGroup {
    readonly color: string;
    readonly zIndex: number;
    /**
     * Decorations are encoded in a number array using the following scheme:
     *  - 3*i = lane
     *  - 3*i+1 = startLineNumber
     *  - 3*i+2 = endLineNumber
     */
    readonly data: number[];
    constructor(color: string, zIndex: number, 
    /**
     * Decorations are encoded in a number array using the following scheme:
     *  - 3*i = lane
     *  - 3*i+1 = startLineNumber
     *  - 3*i+2 = endLineNumber
     */
    data: number[]);
    static compareByRenderingProps(a: OverviewRulerDecorationsGroup, b: OverviewRulerDecorationsGroup): number;
    static equals(a: OverviewRulerDecorationsGroup, b: OverviewRulerDecorationsGroup): boolean;
    static equalsArr(a: OverviewRulerDecorationsGroup[], b: OverviewRulerDecorationsGroup[]): boolean;
}
