import { ISingleEditOperation } from "../editOperation.js";
import { BaseStringEdit, StringReplacement } from "./stringEdit.js";
import { Position } from "../position.js";
import { Range } from "../range.js";
import { AbstractText } from "../text/abstractText.js";
import { IEquatable } from "../../../../base/common/equals.js";
export declare class TextEdit {
    readonly replacements: readonly TextReplacement[];
    static fromStringEdit(edit: BaseStringEdit, initialState: AbstractText): TextEdit;
    static replace(originalRange: Range, newText: string): TextEdit;
    static delete(range: Range): TextEdit;
    static insert(position: Position, newText: string): TextEdit;
    static fromParallelReplacementsUnsorted(replacements: readonly TextReplacement[]): TextEdit;
    constructor(replacements: readonly TextReplacement[]);
    /**
     * Joins touching edits and removes empty edits.
     */
    normalize(): TextEdit;
    mapPosition(position: Position): Position | Range;
    mapRange(range: Range): Range;
    inverseMapPosition(positionAfterEdit: Position, doc: AbstractText): Position | Range;
    inverseMapRange(range: Range, doc: AbstractText): Range;
    apply(text: AbstractText): string;
    applyToString(str: string): string;
    inverse(doc: AbstractText): TextEdit;
    getNewRanges(): Range[];
    toReplacement(text: AbstractText): TextReplacement;
    equals(other: TextEdit): boolean;
    /**
     * Combines two edits into one with the same effect.
     * WARNING: This is written by AI, but well tested. I do not understand the implementation myself.
     *
     * Invariant:
     * ```
     * other.applyToString(this.applyToString(s0)) = this.compose(other).applyToString(s0)
     * ```
     */
    compose(other: TextEdit): TextEdit;
    toString(text: AbstractText | string | undefined): string;
}
export declare class TextReplacement implements IEquatable<TextReplacement> {
    readonly range: Range;
    readonly text: string;
    static joinReplacements(replacements: TextReplacement[], initialValue: AbstractText): TextReplacement;
    static fromStringReplacement(replacement: StringReplacement, initialState: AbstractText): TextReplacement;
    static delete(range: Range): TextReplacement;
    constructor(range: Range, text: string);
    get isEmpty(): boolean;
    static equals(first: TextReplacement, second: TextReplacement): boolean;
    toSingleEditOperation(): ISingleEditOperation;
    toEdit(): TextEdit;
    equals(other: TextReplacement): boolean;
    extendToCoverRange(range: Range, initialValue: AbstractText): TextReplacement;
    extendToFullLine(initialValue: AbstractText): TextReplacement;
    removeCommonPrefixAndSuffix(text: AbstractText): TextReplacement;
    removeCommonPrefix(text: AbstractText): TextReplacement;
    removeCommonSuffix(text: AbstractText): TextReplacement;
    isEffectiveDeletion(text: AbstractText): boolean;
    toString(): string;
}
