import { OffsetRange } from "./offsetRange.js";
import { Range } from "../range.js";
/**
 * Represents a 1-based range of columns.
 * Use {@lik OffsetRange} to represent a 0-based range.
*/
export declare class ColumnRange {
    /** 1-based */
    readonly startColumn: number;
    readonly endColumnExclusive: number;
    static fromOffsetRange(offsetRange: OffsetRange): ColumnRange;
    constructor(
    /** 1-based */
    startColumn: number, endColumnExclusive: number);
    toRange(lineNumber: number): Range;
    equals(other: ColumnRange): boolean;
    toZeroBasedOffsetRange(): OffsetRange;
}
