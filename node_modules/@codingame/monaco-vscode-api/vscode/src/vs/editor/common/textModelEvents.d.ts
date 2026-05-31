import { IPosition } from "./core/position.js";
import { IRange } from "./core/range.js";
import { Selection } from "./core/selection.js";
import { IModelDecoration, InjectedTextOptions } from "./model.js";
import { IModelContentChange } from "./model/mirrorTextModel.js";
import { AnnotationsUpdate } from "./model/tokens/annotations.js";
import { TextModelEditSource } from "./textModelEditSource.js";
/**
 * An event describing that the current language associated with a model has changed.
 */
export interface IModelLanguageChangedEvent {
    /**
     * Previous language
     */
    readonly oldLanguage: string;
    /**
     * New language
     */
    readonly newLanguage: string;
    /**
     * Source of the call that caused the event.
     */
    readonly source: string;
}
/**
 * An event describing that the language configuration associated with a model has changed.
 */
export interface IModelLanguageConfigurationChangedEvent {
}
/**
 * An event describing a change in the text of a model.
 */
export interface IModelContentChangedEvent {
    /**
     * The changes are ordered from the end of the document to the beginning, so they should be safe to apply in sequence.
     */
    readonly changes: IModelContentChange[];
    /**
     * The (new) end-of-line character.
     */
    readonly eol: string;
    /**
     * The new version id the model has transitioned to.
     */
    readonly versionId: number;
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
    /**
     * Flag that indicates that all decorations were lost with this edit.
     * The model has been reset to a new value.
     */
    readonly isFlush: boolean;
    /**
     * Flag that indicates that this event describes an eol change.
     */
    readonly isEolChange: boolean;
    /**
     * Detailed reason information for the change
     * @internal
     */
    readonly detailedReasons: TextModelEditSource[];
    /**
     * The sum of these lengths equals changes.length.
     * The length of this array must equal the length of detailedReasons.
    */
    readonly detailedReasonsChangeLengths: number[];
}
export interface ISerializedModelContentChangedEvent {
    /**
     * The changes are ordered from the end of the document to the beginning, so they should be safe to apply in sequence.
     */
    readonly changes: IModelContentChange[];
    /**
     * The (new) end-of-line character.
     */
    readonly eol: string;
    /**
     * The new version id the model has transitioned to.
     */
    readonly versionId: number;
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
    /**
     * Flag that indicates that all decorations were lost with this edit.
     * The model has been reset to a new value.
     */
    readonly isFlush: boolean;
    /**
     * Flag that indicates that this event describes an eol change.
     */
    readonly isEolChange: boolean;
    /**
     * Detailed reason information for the change
     * @internal
     */
    readonly detailedReason: Record<string, unknown> | undefined;
}
/**
 * An event describing that model decorations have changed.
 */
export interface IModelDecorationsChangedEvent {
    readonly affectsMinimap: boolean;
    readonly affectsOverviewRuler: boolean;
    readonly affectsGlyphMargin: boolean;
    readonly affectsLineNumber: boolean;
}
/**
 * An event describing that some ranges of lines have been tokenized (their tokens have changed).
 * @internal
 */
export interface IModelTokensChangedEvent {
    readonly semanticTokensApplied: boolean;
    readonly ranges: {
        /**
         * The start of the range (inclusive)
         */
        readonly fromLineNumber: number;
        /**
         * The end of the range (inclusive)
         */
        readonly toLineNumber: number;
    }[];
}
/**
 * @internal
 */
export interface IFontTokenOption {
    /**
     * Font family of the token.
     */
    readonly fontFamily?: string;
    /**
     * Font size of the token.
     */
    readonly fontSizeMultiplier?: number;
    /**
     * Line height of the token.
     */
    readonly lineHeightMultiplier?: number;
}
/**
 * An event describing a token font change event
 * @internal
 */
export interface IModelFontTokensChangedEvent {
    changes: FontTokensUpdate;
}
/**
 * @internal
 */
export type FontTokensUpdate = AnnotationsUpdate<IFontTokenOption | undefined>;
/**
 * @internal
 */
export declare function serializeFontTokenOptions(): (options: IFontTokenOption) => IFontTokenOption;
/**
 * @internal
 */
export declare function deserializeFontTokenOptions(): (options: IFontTokenOption) => IFontTokenOption;
export interface IModelOptionsChangedEvent {
    readonly tabSize: boolean;
    readonly indentSize: boolean;
    readonly insertSpaces: boolean;
    readonly trimAutoWhitespace: boolean;
}
/**
 * @internal
 */
export declare enum RawContentChangedType {
    Flush = 1,
    LineChanged = 2,
    LinesDeleted = 3,
    LinesInserted = 4,
    EOLChanged = 5
}
/**
 * An event describing that a model has been reset to a new value.
 * @internal
 */
export declare class ModelRawFlush {
    readonly changeType = RawContentChangedType.Flush;
}
/**
 * Represents text injected on a line
 * @internal
 */
export declare class LineInjectedText {
    readonly ownerId: number;
    readonly lineNumber: number;
    readonly column: number;
    readonly options: InjectedTextOptions;
    readonly order: number;
    static applyInjectedText(lineText: string, injectedTexts: LineInjectedText[] | null): string;
    static fromDecorations(decorations: IModelDecoration[]): LineInjectedText[];
    constructor(ownerId: number, lineNumber: number, column: number, options: InjectedTextOptions, order: number);
    withText(text: string): LineInjectedText;
}
/**
 * An event describing that a line has changed in a model.
 * @internal
 */
export declare class ModelRawLineChanged {
    readonly changeType = RawContentChangedType.LineChanged;
    /**
     * The line number that has changed (before the change was applied).
     */
    readonly lineNumber: number;
    /**
     * The new line number the old one is mapped to (after the change was applied).
     */
    readonly lineNumberPostEdit: number;
    constructor(lineNumber: number, lineNumberPostEdit: number);
}
/**
 * An event describing that a line height has changed in the model.
 * @internal
 */
export declare class ModelLineHeightChanged {
    /**
     * Editor owner ID
     */
    readonly ownerId: number;
    /**
     * The decoration ID that has changed.
     */
    readonly decorationId: string;
    /**
     * The line that has changed.
     */
    readonly lineNumber: number;
    /**
     * The line height on the line.
     */
    readonly lineHeightMultiplier: number | null;
    constructor(ownerId: number, decorationId: string, lineNumber: number, lineHeightMultiplier: number | null);
}
/**
 * An event describing that a line height has changed in the model.
 * @internal
 */
export declare class ModelFontChanged {
    /**
     * Editor owner ID
     */
    readonly ownerId: number;
    /**
     * The line that has changed.
     */
    readonly lineNumber: number;
    constructor(ownerId: number, lineNumber: number);
}
/**
 * An event describing that line(s) have been deleted in a model.
 * @internal
 */
export declare class ModelRawLinesDeleted {
    readonly changeType = RawContentChangedType.LinesDeleted;
    /**
     * At what line the deletion began (inclusive).
     */
    readonly fromLineNumber: number;
    /**
     * At what line the deletion stopped (inclusive).
     */
    readonly toLineNumber: number;
    /**
     * The last unmodified line in the updated buffer after the deletion is made.
     */
    readonly lastUntouchedLinePostEdit: number;
    constructor(fromLineNumber: number, toLineNumber: number, lastUntouchedLinePostEdit: number);
}
/**
 * An event describing that line(s) have been inserted in a model.
 * @internal
 */
export declare class ModelRawLinesInserted {
    readonly changeType = RawContentChangedType.LinesInserted;
    /**
     * Before what line did the insertion begin
     */
    readonly fromLineNumber: number;
    /**
     * The actual start line number in the updated buffer where the newly inserted content can be found.
     */
    readonly fromLineNumberPostEdit: number;
    /**
     * The count of inserted lines.
    */
    readonly count: number;
    /**
     * `toLineNumber` - `fromLineNumber` + 1 denotes the number of lines that were inserted
     */
    get toLineNumber(): number;
    /**
     * The actual end line number of the insertion in the updated buffer.
     */
    get toLineNumberPostEdit(): number;
    constructor(fromLineNumber: number, fromLineNumberPostEdit: number, count: number);
}
/**
 * An event describing that a model has had its EOL changed.
 * @internal
 */
export declare class ModelRawEOLChanged {
    readonly changeType = RawContentChangedType.EOLChanged;
}
/**
 * @internal
 */
export type ModelRawChange = ModelRawFlush | ModelRawLineChanged | ModelRawLinesDeleted | ModelRawLinesInserted | ModelRawEOLChanged;
/**
 * An event describing a change in the text of a model.
 * @internal
 */
export declare class ModelRawContentChangedEvent {
    readonly changes: ModelRawChange[];
    /**
     * The new version id the model has transitioned to.
     */
    readonly versionId: number;
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
    resultingSelection: Selection[] | null;
    constructor(changes: ModelRawChange[], versionId: number, isUndoing: boolean, isRedoing: boolean);
    containsEvent(type: RawContentChangedType): boolean;
    static merge(a: ModelRawContentChangedEvent, b: ModelRawContentChangedEvent): ModelRawContentChangedEvent;
}
/**
 * An event describing a change in injected text.
 * @internal
 */
export declare class ModelInjectedTextChangedEvent {
    readonly changes: ModelRawLineChanged[];
    constructor(changes: ModelRawLineChanged[]);
}
/**
 * An event describing a change of a line height.
 * @internal
 */
export declare class ModelLineHeightChangedEvent {
    readonly changes: ModelLineHeightChanged[];
    constructor(changes: ModelLineHeightChanged[]);
    affects(rangeOrPosition: IRange | IPosition): boolean;
}
/**
 * An event describing a change in fonts.
 * @internal
 */
export declare class ModelFontChangedEvent {
    readonly changes: ModelFontChanged[];
    constructor(changes: ModelFontChanged[]);
}
/**
 * @internal
 */
export declare class InternalModelContentChangeEvent {
    readonly rawContentChangedEvent: ModelRawContentChangedEvent;
    readonly contentChangedEvent: IModelContentChangedEvent;
    constructor(rawContentChangedEvent: ModelRawContentChangedEvent, contentChangedEvent: IModelContentChangedEvent);
    merge(other: InternalModelContentChangeEvent): InternalModelContentChangeEvent;
    private static _mergeChangeEvents;
}
