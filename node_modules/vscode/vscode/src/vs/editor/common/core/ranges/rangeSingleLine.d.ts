import { ColumnRange } from "./columnRange.js";
import { Range } from "../range.js";
/**
 * Represents a column range in a single line.
*/
export declare class RangeSingleLine {
    /** 1-based */
    readonly lineNumber: number;
    readonly columnRange: ColumnRange;
    static fromRange(range: Range): RangeSingleLine | undefined;
    constructor(
    /** 1-based */
    lineNumber: number, columnRange: ColumnRange);
    toRange(): Range;
}
