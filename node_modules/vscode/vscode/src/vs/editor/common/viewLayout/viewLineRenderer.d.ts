import { IViewLineTokens } from "../tokens/lineTokens.js";
import { StringBuilder } from "../core/stringBuilder.js";
import { LineDecoration } from "./lineDecorations.js";
import { OffsetRange } from "../core/ranges/offsetRange.js";
import { TextDirection } from "../model.js";
export declare enum RenderWhitespace {
    None = 0,
    Boundary = 1,
    Selection = 2,
    Trailing = 3,
    All = 4
}
export interface IRenderLineInputOptions {
    useMonospaceOptimizations: boolean;
    canUseHalfwidthRightwardsArrow: boolean;
    lineContent: string;
    continuesWithWrappedLine: boolean;
    isBasicASCII: boolean;
    containsRTL: boolean;
    fauxIndentLength: number;
    lineTokens: IViewLineTokens;
    lineDecorations: LineDecoration[];
    tabSize: number;
    startVisibleColumn: number;
    spaceWidth: number;
    middotWidth: number;
    wsmiddotWidth: number;
    stopRenderingLineAfter: number;
    renderWhitespace: "none" | "boundary" | "selection" | "trailing" | "all";
    renderControlCharacters: boolean;
    fontLigatures: boolean;
    selectionsOnLine: OffsetRange[] | null;
    textDirection: TextDirection | null;
    verticalScrollbarSize: number;
    renderNewLineWhenEmpty: boolean;
}
export declare class RenderLineInput {
    readonly useMonospaceOptimizations: boolean;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly lineContent: string;
    readonly continuesWithWrappedLine: boolean;
    readonly isBasicASCII: boolean;
    readonly containsRTL: boolean;
    readonly fauxIndentLength: number;
    readonly lineTokens: IViewLineTokens;
    readonly lineDecorations: LineDecoration[];
    readonly tabSize: number;
    readonly startVisibleColumn: number;
    readonly spaceWidth: number;
    readonly renderSpaceWidth: number;
    readonly renderSpaceCharCode: number;
    readonly stopRenderingLineAfter: number;
    readonly renderWhitespace: RenderWhitespace;
    readonly renderControlCharacters: boolean;
    readonly fontLigatures: boolean;
    readonly textDirection: TextDirection | null;
    readonly verticalScrollbarSize: number;
    /**
     * Defined only when renderWhitespace is 'selection'. Selections are non-overlapping,
     * and ordered by position within the line.
     */
    readonly selectionsOnLine: OffsetRange[] | null;
    /**
     * When rendering an empty line, whether to render a new line instead
     */
    readonly renderNewLineWhenEmpty: boolean;
    get isLTR(): boolean;
    constructor(useMonospaceOptimizations: boolean, canUseHalfwidthRightwardsArrow: boolean, lineContent: string, continuesWithWrappedLine: boolean, isBasicASCII: boolean, containsRTL: boolean, fauxIndentLength: number, lineTokens: IViewLineTokens, lineDecorations: LineDecoration[], tabSize: number, startVisibleColumn: number, spaceWidth: number, middotWidth: number, wsmiddotWidth: number, stopRenderingLineAfter: number, renderWhitespace: "none" | "boundary" | "selection" | "trailing" | "all", renderControlCharacters: boolean, fontLigatures: boolean, selectionsOnLine: OffsetRange[] | null, textDirection: TextDirection | null, verticalScrollbarSize: number, renderNewLineWhenEmpty?: boolean);
    private sameSelection;
    equals(other: RenderLineInput): boolean;
}
export declare class DomPosition {
    readonly partIndex: number;
    readonly charIndex: number;
    constructor(partIndex: number, charIndex: number);
}
/**
 * Provides a both direction mapping between a line's character and its rendered position.
 */
export declare class CharacterMapping {
    private static getPartIndex;
    private static getCharIndex;
    readonly length: number;
    private readonly _data;
    private readonly _horizontalOffset;
    constructor(length: number, partCount: number);
    setColumnInfo(column: number, partIndex: number, charIndex: number, horizontalOffset: number): void;
    getHorizontalOffset(column: number): number;
    private charOffsetToPartData;
    getDomPosition(column: number): DomPosition;
    getColumn(domPosition: DomPosition, partLength: number): number;
    private partDataToCharOffset;
    inflate(): [
        number,
        number,
        number
    ][];
}
export declare enum ForeignElementType {
    None = 0,
    Before = 1,
    After = 2
}
export declare class RenderLineOutput {
    _renderLineOutputBrand: void;
    readonly characterMapping: CharacterMapping;
    readonly containsForeignElements: ForeignElementType;
    constructor(characterMapping: CharacterMapping, containsForeignElements: ForeignElementType);
}
export declare function renderViewLine(input: RenderLineInput, sb: StringBuilder): RenderLineOutput;
export declare class RenderLineOutput2 {
    readonly characterMapping: CharacterMapping;
    readonly html: string;
    readonly containsForeignElements: ForeignElementType;
    constructor(characterMapping: CharacterMapping, html: string, containsForeignElements: ForeignElementType);
}
export declare function renderViewLine2(input: RenderLineInput): RenderLineOutput2;
