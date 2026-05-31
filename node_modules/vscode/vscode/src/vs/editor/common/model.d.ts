import { Event } from "../../base/common/event.js";
import { IMarkdownString } from "../../base/common/htmlContent.js";
import { IDisposable } from "../../base/common/lifecycle.js";
import { ThemeColor } from "../../base/common/themables.js";
import { URI } from "../../base/common/uri.js";
import { ISingleEditOperation } from "./core/editOperation.js";
import { IPosition, Position } from "./core/position.js";
import { IRange, Range } from "./core/range.js";
import { Selection } from "./core/selection.js";
import { TextChange } from "./core/textChange.js";
import { WordCharacterClassifier } from "./core/wordCharacterClassifier.js";
import { IWordAtPosition } from "./core/wordHelper.js";
import { FormattingOptions } from "./languages.js";
import { ILanguageSelection } from "./languages/language.js";
import { IBracketPairsTextModelPart } from "./textModelBracketPairs.js";
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent, LineInjectedText, ModelFontChangedEvent, ModelLineHeightChangedEvent } from "./textModelEvents.js";
import { IModelContentChange } from "./model/mirrorTextModel.js";
import { IGuidesTextModelPart } from "./textModelGuides.js";
import { ITokenizationTextModelPart } from "./tokenizationTextModelPart.js";
import { UndoRedoGroup } from "../../platform/undoRedo/common/undoRedo.js";
import { TokenArray } from "./tokens/lineTokens.js";
import { IEditorModel } from "./editorCommon.js";
import { TextModelEditSource } from "./textModelEditSource.js";
import { TextEdit } from "./core/edits/textEdit.js";
import { IViewModel } from "./viewModel.js";
/**
 * Vertical Lane in the overview ruler of the editor.
 */
export declare enum OverviewRulerLane {
    Left = 1,
    Center = 2,
    Right = 4,
    Full = 7
}
/**
 * Vertical Lane in the glyph margin of the editor.
 */
export declare enum GlyphMarginLane {
    Left = 1,
    Center = 2,
    Right = 3
}
export interface IGlyphMarginLanesModel {
    /**
     * The number of lanes that should be rendered in the editor.
     */
    readonly requiredLanes: number;
    /**
     * Gets the lanes that should be rendered starting at a given line number.
     */
    getLanesAtLine(lineNumber: number): GlyphMarginLane[];
    /**
     * Resets the model and ensures it can contain at least `maxLine` lines.
     */
    reset(maxLine: number): void;
    /**
     * Registers that a lane should be visible at the Range in the model.
     * @param persist - if true, notes that the lane should always be visible,
     * even on lines where there's no specific request for that lane.
     */
    push(lane: GlyphMarginLane, range: Range, persist?: boolean): void;
}
/**
 * Position in the minimap to render the decoration.
 */
export declare enum MinimapPosition {
    Inline = 1,
    Gutter = 2
}
/**
 * Section header style.
 */
export declare enum MinimapSectionHeaderStyle {
    Normal = 1,
    Underlined = 2
}
export interface IDecorationOptions {
    /**
     * CSS color to render.
     * e.g.: rgba(100, 100, 100, 0.5) or a color from the color registry
     */
    color: string | ThemeColor | undefined;
    /**
     * CSS color to render.
     * e.g.: rgba(100, 100, 100, 0.5) or a color from the color registry
     */
    darkColor?: string | ThemeColor;
}
export interface IModelDecorationGlyphMarginOptions {
    /**
     * The position in the glyph margin.
     */
    position: GlyphMarginLane;
    /**
     * Whether the glyph margin lane in {@link position} should be rendered even
     * outside of this decoration's range.
     */
    persistLane?: boolean;
}
/**
 * Options for rendering a model decoration in the overview ruler.
 */
export interface IModelDecorationOverviewRulerOptions extends IDecorationOptions {
    /**
     * The position in the overview ruler.
     */
    position: OverviewRulerLane;
}
/**
 * Options for rendering a model decoration in the minimap.
 */
export interface IModelDecorationMinimapOptions extends IDecorationOptions {
    /**
     * The position in the minimap.
     */
    position: MinimapPosition;
    /**
     * If the decoration is for a section header, which header style.
     */
    sectionHeaderStyle?: MinimapSectionHeaderStyle | null;
    /**
     * If the decoration is for a section header, the header text.
     */
    sectionHeaderText?: string | null;
}
/**
 * Options for a model decoration.
 */
export interface IModelDecorationOptions {
    /**
     * A debug description that can be used for inspecting model decorations.
     * @internal
     */
    description: string;
    /**
     * Customize the growing behavior of the decoration when typing at the edges of the decoration.
     * Defaults to TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
     */
    stickiness?: TrackedRangeStickiness;
    /**
     * CSS class name describing the decoration.
     */
    className?: string | null;
    /**
     * Indicates whether the decoration should span across the entire line when it continues onto the next line.
     */
    shouldFillLineOnLineBreak?: boolean | null;
    blockClassName?: string | null;
    /**
     * Indicates if this block should be rendered after the last line.
     * In this case, the range must be empty and set to the last line.
     */
    blockIsAfterEnd?: boolean | null;
    blockDoesNotCollapse?: boolean | null;
    blockPadding?: [
        top: number,
        right: number,
        bottom: number,
        left: number
    ] | null;
    /**
     * Message to be rendered when hovering over the glyph margin decoration.
     */
    glyphMarginHoverMessage?: IMarkdownString | IMarkdownString[] | null;
    /**
     * Array of MarkdownString to render as the decoration message.
     */
    hoverMessage?: IMarkdownString | IMarkdownString[] | null;
    /**
     * Array of MarkdownString to render as the line number message.
     */
    lineNumberHoverMessage?: IMarkdownString | IMarkdownString[] | null;
    /**
     * Should the decoration expand to encompass a whole line.
     */
    isWholeLine?: boolean;
    /**
     * Always render the decoration (even when the range it encompasses is collapsed).
     */
    showIfCollapsed?: boolean;
    /**
     * Collapse the decoration if its entire range is being replaced via an edit.
     * @internal
     */
    collapseOnReplaceEdit?: boolean;
    /**
     * Specifies the stack order of a decoration.
     * A decoration with greater stack order is always in front of a decoration with
     * a lower stack order when the decorations are on the same line.
     */
    zIndex?: number;
    /**
     * If set, render this decoration in the overview ruler.
     */
    overviewRuler?: IModelDecorationOverviewRulerOptions | null;
    /**
     * If set, render this decoration in the minimap.
     */
    minimap?: IModelDecorationMinimapOptions | null;
    /**
     * If set, the decoration will be rendered in the glyph margin with this CSS class name.
     */
    glyphMarginClassName?: string | null;
    /**
     * If set and the decoration has {@link glyphMarginClassName} set, render this decoration
     * with the specified {@link IModelDecorationGlyphMarginOptions} in the glyph margin.
     */
    glyphMargin?: IModelDecorationGlyphMarginOptions | null;
    /**
     * If set, the decoration will override the line height of the lines it spans. This value is a multiplier to the default line height.
     */
    lineHeight?: number | null;
    /**
     * Font family
     */
    fontFamily?: string | null;
    /**
     * Font size
     */
    fontSize?: string | null;
    /**
     * Font weight
     */
    fontWeight?: string | null;
    /**
     * Font style
     */
    fontStyle?: string | null;
    /**
     * If set, the decoration will be rendered in the lines decorations with this CSS class name.
     */
    linesDecorationsClassName?: string | null;
    /**
     * Controls the tooltip text of the line decoration.
     */
    linesDecorationsTooltip?: string | null;
    /**
     * If set, the decoration will be rendered on the line number.
     */
    lineNumberClassName?: string | null;
    /**
     * If set, the decoration will be rendered in the lines decorations with this CSS class name, but only for the first line in case of line wrapping.
     */
    firstLineDecorationClassName?: string | null;
    /**
     * If set, the decoration will be rendered in the margin (covering its full width) with this CSS class name.
     */
    marginClassName?: string | null;
    /**
     * If set, the decoration will be rendered inline with the text with this CSS class name.
     * Please use this only for CSS rules that must impact the text. For example, use `className`
     * to have a background color decoration.
     */
    inlineClassName?: string | null;
    /**
     * If there is an `inlineClassName` which affects letter spacing.
     */
    inlineClassNameAffectsLetterSpacing?: boolean;
    /**
     * If set, the decoration will be rendered before the text with this CSS class name.
     */
    beforeContentClassName?: string | null;
    /**
     * If set, the decoration will be rendered after the text with this CSS class name.
     */
    afterContentClassName?: string | null;
    /**
     * If set, text will be injected in the view after the range.
     */
    after?: InjectedTextOptions | null;
    /**
     * If set, text will be injected in the view before the range.
     */
    before?: InjectedTextOptions | null;
    /**
     * If set, this decoration will not be rendered for comment tokens.
     * @internal
    */
    hideInCommentTokens?: boolean | null;
    /**
     * If set, this decoration will not be rendered for string tokens.
     * @internal
    */
    hideInStringTokens?: boolean | null;
    /**
     * Whether the decoration affects the font.
     * @internal
     */
    affectsFont?: boolean | null;
    /**
     * The text direction of the decoration.
     */
    textDirection?: TextDirection | null;
}
/**
 * Text Direction for a decoration.
 */
export declare enum TextDirection {
    LTR = 0,
    RTL = 1
}
/**
 * Configures text that is injected into the view without changing the underlying document.
*/
export interface InjectedTextOptions {
    /**
     * Sets the text to inject. Must be a single line.
     */
    readonly content: string;
    /**
     * @internal
    */
    readonly tokens?: TokenArray | null;
    /**
     * If set, the decoration will be rendered inline with the text with this CSS class name.
     */
    readonly inlineClassName?: string | null;
    /**
     * If there is an `inlineClassName` which affects letter spacing.
     */
    readonly inlineClassNameAffectsLetterSpacing?: boolean;
    /**
     * This field allows to attach data to this injected text.
     * The data can be read when injected texts at a given position are queried.
     */
    readonly attachedData?: unknown;
    /**
     * Configures cursor stops around injected text.
     * Defaults to {@link InjectedTextCursorStops.Both}.
    */
    readonly cursorStops?: InjectedTextCursorStops | null;
}
export declare enum InjectedTextCursorStops {
    Both = 0,
    Right = 1,
    Left = 2,
    None = 3
}
/**
 * New model decorations.
 */
export interface IModelDeltaDecoration {
    /**
     * Range that this decoration covers.
     */
    range: IRange;
    /**
     * Options associated with this decoration.
     */
    options: IModelDecorationOptions;
}
/**
 * A decoration in the model.
 */
export interface IModelDecoration {
    /**
     * Identifier for a decoration.
     */
    readonly id: string;
    /**
     * Identifier for a decoration's owner.
     */
    readonly ownerId: number;
    /**
     * Range that this decoration covers.
     */
    readonly range: Range;
    /**
     * Options associated with this decoration.
     */
    readonly options: IModelDecorationOptions;
}
/**
 * An accessor that can add, change or remove model decorations.
 * @internal
 */
export interface IModelDecorationsChangeAccessor {
    /**
     * Add a new decoration.
     * @param range Range that this decoration covers.
     * @param options Options associated with this decoration.
     * @return An unique identifier associated with this decoration.
     */
    addDecoration(range: IRange, options: IModelDecorationOptions): string;
    /**
     * Change the range that an existing decoration covers.
     * @param id The unique identifier associated with the decoration.
     * @param newRange The new range that this decoration covers.
     */
    changeDecoration(id: string, newRange: IRange): void;
    /**
     * Change the options associated with an existing decoration.
     * @param id The unique identifier associated with the decoration.
     * @param newOptions The new options associated with this decoration.
     */
    changeDecorationOptions(id: string, newOptions: IModelDecorationOptions): void;
    /**
     * Remove an existing decoration.
     * @param id The unique identifier associated with the decoration.
     */
    removeDecoration(id: string): void;
    /**
     * Perform a minimum amount of operations, in order to transform the decorations
     * identified by `oldDecorations` to the decorations described by `newDecorations`
     * and returns the new identifiers associated with the resulting decorations.
     *
     * @param oldDecorations Array containing previous decorations identifiers.
     * @param newDecorations Array describing what decorations should result after the call.
     * @return An array containing the new decorations identifiers.
     */
    deltaDecorations(oldDecorations: readonly string[], newDecorations: readonly IModelDeltaDecoration[]): string[];
}
/**
 * End of line character preference.
 */
export declare enum EndOfLinePreference {
    /**
     * Use the end of line character identified in the text buffer.
     */
    TextDefined = 0,
    /**
     * Use line feed (\n) as the end of line character.
     */
    LF = 1,
    /**
     * Use carriage return and line feed (\r\n) as the end of line character.
     */
    CRLF = 2
}
/**
 * The default end of line to use when instantiating models.
 */
export declare enum DefaultEndOfLine {
    /**
     * Use line feed (\n) as the end of line character.
     */
    LF = 1,
    /**
     * Use carriage return and line feed (\r\n) as the end of line character.
     */
    CRLF = 2
}
/**
 * End of line character preference.
 */
export declare enum EndOfLineSequence {
    /**
     * Use line feed (\n) as the end of line character.
     */
    LF = 0,
    /**
     * Use carriage return and line feed (\r\n) as the end of line character.
     */
    CRLF = 1
}
/**
 * An identifier for a single edit operation.
 * @internal
 */
export interface ISingleEditOperationIdentifier {
    /**
     * Identifier major
     */
    major: number;
    /**
     * Identifier minor
     */
    minor: number;
}
/**
 * A single edit operation, that has an identifier.
 */
export interface IIdentifiedSingleEditOperation extends ISingleEditOperation {
    /**
     * An identifier associated with this single edit operation.
     * @internal
     */
    identifier?: ISingleEditOperationIdentifier | null;
    /**
     * This indicates that this operation is inserting automatic whitespace
     * that can be removed on next model edit operation if `config.trimAutoWhitespace` is true.
     * @internal
     */
    isAutoWhitespaceEdit?: boolean;
    /**
     * This indicates that this operation is in a set of operations that are tracked and should not be "simplified".
     * @internal
     */
    _isTracked?: boolean;
}
export interface IValidEditOperation {
    /**
     * An identifier associated with this single edit operation.
     * @internal
     */
    identifier: ISingleEditOperationIdentifier | null;
    /**
     * The range to replace. This can be empty to emulate a simple insert.
     */
    range: Range;
    /**
     * The text to replace with. This can be empty to emulate a simple delete.
     */
    text: string;
    /**
     * @internal
     */
    textChange: TextChange;
}
/**
 * A callback that can compute the cursor state after applying a series of edit operations.
 */
export interface ICursorStateComputer {
    /**
     * A callback that can compute the resulting cursors state after some edit operations have been executed.
     */
    (inverseEditOperations: IValidEditOperation[]): Selection[] | null;
}
export declare class TextModelResolvedOptions {
    _textModelResolvedOptionsBrand: void;
    readonly tabSize: number;
    readonly indentSize: number;
    private readonly _indentSizeIsTabSize;
    readonly insertSpaces: boolean;
    readonly defaultEOL: DefaultEndOfLine;
    readonly trimAutoWhitespace: boolean;
    readonly bracketPairColorizationOptions: BracketPairColorizationOptions;
    get originalIndentSize(): number | "tabSize";
    /**
     * @internal
     */
    constructor(src: {
        tabSize: number;
        indentSize: number | "tabSize";
        insertSpaces: boolean;
        defaultEOL: DefaultEndOfLine;
        trimAutoWhitespace: boolean;
        bracketPairColorizationOptions: BracketPairColorizationOptions;
    });
    /**
     * @internal
     */
    equals(other: TextModelResolvedOptions): boolean;
    /**
     * @internal
     */
    createChangeEvent(newOpts: TextModelResolvedOptions): IModelOptionsChangedEvent;
}
/**
 * @internal
 */
export interface ITextModelCreationOptions {
    tabSize: number;
    indentSize: number | "tabSize";
    insertSpaces: boolean;
    detectIndentation: boolean;
    trimAutoWhitespace: boolean;
    defaultEOL: DefaultEndOfLine;
    isForSimpleWidget: boolean;
    largeFileOptimizations: boolean;
    bracketPairColorizationOptions: BracketPairColorizationOptions;
}
export interface BracketPairColorizationOptions {
    enabled: boolean;
    independentColorPoolPerBracketType: boolean;
}
export interface ITextModelUpdateOptions {
    tabSize?: number;
    indentSize?: number | "tabSize";
    insertSpaces?: boolean;
    trimAutoWhitespace?: boolean;
    bracketColorizationOptions?: BracketPairColorizationOptions;
}
export declare class FindMatch {
    _findMatchBrand: void;
    readonly range: Range;
    readonly matches: string[] | null;
    /**
     * @internal
     */
    constructor(range: Range, matches: string[] | null);
}
/**
 * Describes the behavior of decorations when typing/editing near their edges.
 * Note: Please do not edit the values, as they very carefully match `DecorationRangeBehavior`
 */
export declare enum TrackedRangeStickiness {
    AlwaysGrowsWhenTypingAtEdges = 0,
    NeverGrowsWhenTypingAtEdges = 1,
    GrowsOnlyWhenTypingBefore = 2,
    GrowsOnlyWhenTypingAfter = 3
}
/**
 * Text snapshot that works like an iterator.
 * Will try to return chunks of roughly ~64KB size.
 * Will return null when finished.
 */
export interface ITextSnapshot {
    read(): string | null;
}
/**
 * @internal
 */
export declare function isITextSnapshot(obj: unknown): obj is ITextSnapshot;
/**
 * A model.
 */
export type ITextModel = import("monaco-editor").editor.ITextModel;
/**
 * @internal
 */
export declare function isITextModel(obj: IEditorModel): obj is ITextModel;
/**
 * @internal
 */
export interface IAttachedView {
    /**
     * @param stabilized Indicates if the visible lines are probably going to change soon or can be considered stable.
     * Is true on reveal range and false on scroll.
     * Tokenizers should tokenize synchronously if stabilized is true.
     */
    setVisibleLines(visibleLines: {
        startLineNumber: number;
        endLineNumber: number;
    }[], stabilized: boolean): void;
}
export declare enum PositionAffinity {
    /**
     * Prefers the left most position.
    */
    Left = 0,
    /**
     * Prefers the right most position.
    */
    Right = 1,
    /**
     * No preference.
    */
    None = 2,
    /**
     * If the given position is on injected text, prefers the position left of it.
    */
    LeftOfInjectedText = 3,
    /**
     * If the given position is on injected text, prefers the position right of it.
    */
    RightOfInjectedText = 4
}
/**
 * @internal
 */
export interface ITextBufferBuilder {
    acceptChunk(chunk: string): void;
    finish(): ITextBufferFactory;
}
/**
 * @internal
 */
export interface ITextBufferFactory {
    create(defaultEOL: DefaultEndOfLine): {
        textBuffer: ITextBuffer;
        disposable: IDisposable;
    };
    getFirstLineText(lengthLimit: number): string;
}
/**
 * @internal
 */
export declare enum ModelConstants {
    FIRST_LINE_DETECTION_LENGTH_LIMIT = 1000
}
/**
 * @internal
 */
export declare class ValidAnnotatedEditOperation implements IIdentifiedSingleEditOperation {
    readonly identifier: ISingleEditOperationIdentifier | null;
    readonly range: Range;
    readonly text: string | null;
    readonly forceMoveMarkers: boolean;
    readonly isAutoWhitespaceEdit: boolean;
    readonly _isTracked: boolean;
    constructor(identifier: ISingleEditOperationIdentifier | null, range: Range, text: string | null, forceMoveMarkers: boolean, isAutoWhitespaceEdit: boolean, _isTracked: boolean);
}
/**
 * @internal
 *
 * `lineNumber` is 1 based.
 */
export interface IReadonlyTextBuffer {
    readonly onDidChangeContent: Event<void>;
    equals(other: ITextBuffer): boolean;
    mightContainRTL(): boolean;
    mightContainUnusualLineTerminators(): boolean;
    resetMightContainUnusualLineTerminators(): void;
    mightContainNonBasicASCII(): boolean;
    getBOM(): string;
    getEOL(): string;
    getOffsetAt(lineNumber: number, column: number): number;
    getPositionAt(offset: number): Position;
    getRangeAt(offset: number, length: number): Range;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    createSnapshot(preserveBOM: boolean): ITextSnapshot;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    getCharacterCountInRange(range: Range, eol: EndOfLinePreference): number;
    getLength(): number;
    getLineCount(): number;
    getLinesContent(): string[];
    getLineContent(lineNumber: number): string;
    getLineCharCode(lineNumber: number, index: number): number;
    getCharCode(offset: number): number;
    getLineLength(lineNumber: number): number;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    findMatchesLineByLine(searchRange: Range, searchData: SearchData, captureMatches: boolean, limitResultCount: number): FindMatch[];
    /**
     * Get nearest chunk of text after `offset` in the text buffer.
     */
    getNearestChunk(offset: number): string;
}
/**
 * @internal
 */
export declare class SearchData {
    /**
     * The regex to search for. Always defined.
     */
    readonly regex: RegExp;
    /**
     * The word separator classifier.
     */
    readonly wordSeparators: WordCharacterClassifier | null;
    /**
     * The simple string to search for (if possible).
     */
    readonly simpleSearch: string | null;
    constructor(regex: RegExp, wordSeparators: WordCharacterClassifier | null, simpleSearch: string | null);
}
/**
 * @internal
 */
export interface ITextBuffer extends IReadonlyTextBuffer, IDisposable {
    setEOL(newEOL: "\r\n" | "\n"): void;
    applyEdits(rawOperations: ValidAnnotatedEditOperation[], recordTrimAutoWhitespace: boolean, computeUndoEdits: boolean): ApplyEditsResult;
}
/**
 * @internal
 */
export declare class ApplyEditsResult {
    readonly reverseEdits: IValidEditOperation[] | null;
    readonly changes: IInternalModelContentChange[];
    readonly trimAutoWhitespaceLineNumbers: number[] | null;
    constructor(reverseEdits: IValidEditOperation[] | null, changes: IInternalModelContentChange[], trimAutoWhitespaceLineNumbers: number[] | null);
}
/**
 * @internal
 */
export interface IInternalModelContentChange extends IModelContentChange {
    range: Range;
    forceMoveMarkers: boolean;
}
/**
 * @internal
 */
export declare function shouldSynchronizeModel(model: ITextModel): boolean;
