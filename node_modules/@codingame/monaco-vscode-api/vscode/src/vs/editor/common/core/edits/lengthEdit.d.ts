import { OffsetRange } from "../ranges/offsetRange.js";
import { AnyEdit, BaseEdit, BaseReplacement } from "./edit.js";
/**
 * Like a normal edit, but only captures the length information.
*/
export declare class LengthEdit extends BaseEdit<LengthReplacement, LengthEdit> {
    static readonly empty: LengthEdit;
    static fromEdit(edit: AnyEdit): LengthEdit;
    static create(replacements: readonly LengthReplacement[]): LengthEdit;
    static single(replacement: LengthReplacement): LengthEdit;
    static replace(range: OffsetRange, newLength: number): LengthEdit;
    static insert(offset: number, newLength: number): LengthEdit;
    static delete(range: OffsetRange): LengthEdit;
    static compose(edits: readonly LengthEdit[]): LengthEdit;
    /**
     * Creates an edit that reverts this edit.
     */
    inverse(): LengthEdit;
    protected _createNew(replacements: readonly LengthReplacement[]): LengthEdit;
    applyArray<T>(arr: readonly T[], fillItem: T): T[];
}
export declare class LengthReplacement extends BaseReplacement<LengthReplacement> {
    readonly newLength: number;
    static create(startOffset: number, endOffsetExclusive: number, newLength: number): LengthReplacement;
    constructor(range: OffsetRange, newLength: number);
    equals(other: LengthReplacement): boolean;
    getNewLength(): number;
    tryJoinTouching(other: LengthReplacement): LengthReplacement | undefined;
    slice(range: OffsetRange, rangeInReplacement: OffsetRange): LengthReplacement;
    toString(): string;
}
