import { LineDecoration } from "../../../../common/viewLayout/lineDecorations.js";
import { ColumnRange } from "../../../../common/core/ranges/columnRange.js";
import { InlineDecoration } from "../../../../common/viewModel/inlineDecorations.js";
export declare class GhostText {
    readonly lineNumber: number;
    readonly parts: GhostTextPart[];
    constructor(lineNumber: number, parts: GhostTextPart[]);
    equals(other: GhostText): boolean;
    /**
     * Only used for testing/debugging.
    */
    render(documentText: string, debug?: boolean): string;
    renderForScreenReader(lineText: string): string;
    isEmpty(): boolean;
    get lineCount(): number;
}
export interface IGhostTextLine {
    line: string;
    lineDecorations: LineDecoration[];
}
export declare class GhostTextPart {
    readonly column: number;
    readonly text: string;
    /**
     * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
    */
    readonly preview: boolean;
    private _inlineDecorations;
    readonly lines: IGhostTextLine[];
    constructor(column: number, text: string, 
    /**
     * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
    */
    preview: boolean, _inlineDecorations?: InlineDecoration[]);
    equals(other: GhostTextPart): boolean;
}
export declare class GhostTextReplacement {
    readonly lineNumber: number;
    readonly columnRange: ColumnRange;
    readonly text: string;
    readonly additionalReservedLineCount: number;
    readonly parts: ReadonlyArray<GhostTextPart>;
    readonly newLines: string[];
    constructor(lineNumber: number, columnRange: ColumnRange, text: string, additionalReservedLineCount?: number);
    renderForScreenReader(_lineText: string): string;
    render(documentText: string, debug?: boolean): string;
    get lineCount(): number;
    isEmpty(): boolean;
    equals(other: GhostTextReplacement): boolean;
}
export type GhostTextOrReplacement = GhostText | GhostTextReplacement;
export declare function ghostTextsOrReplacementsEqual(a: readonly GhostTextOrReplacement[] | undefined, b: readonly GhostTextOrReplacement[] | undefined): boolean;
export declare function ghostTextOrReplacementEquals(a: GhostTextOrReplacement | undefined, b: GhostTextOrReplacement | undefined): boolean;
